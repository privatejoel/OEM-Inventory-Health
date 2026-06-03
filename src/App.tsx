import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  DollarSign,
  Info,
  Factory,
  FileText,
  LayoutDashboard,
  Target,
  Zap,
  ShieldAlert,
  RotateCcw,
  Gauge,
  Boxes,
  TrendingDown,
  ArrowDownRight,
  GitBranch,
  Users,
  ClipboardCheck,
  Store,
  Truck,
  Clock,
  Building2,
} from 'lucide-react';

/* ============================================================================
   MODEL
   ----------------------------------------------------------------------------
   Single-market (U.S.) national portfolio, monthly. Figures are illustrative
   but scaled to OEM reality so the narrative ("multi-billion-dollar pipeline")
   matches the data. Full assumptions and formulas are documented in
   METHODOLOGY.md.
   ========================================================================== */

interface InventoryItem {
  id: number;
  model: string;
  segment: string;
  category: 'Luxury' | 'EV' | 'SUV' | 'Volume';
  stock: number; // units in national pipeline
  avgMonthlySales: number; // units / month (steady-state demand)
  unitCost: number; // OEM wholesale cost / unit (USD)
}

const HYUNDAI_INVENTORY: InventoryItem[] = [
  { id: 1, model: 'Genesis G80', segment: 'Luxury Sedan', category: 'Luxury', stock: 3400, avgMonthlySales: 1200, unitCost: 48000 },
  { id: 2, model: 'Genesis GV80', segment: 'Luxury SUV', category: 'Luxury', stock: 2600, avgMonthlySales: 950, unitCost: 55000 },
  { id: 3, model: 'Hyundai IONIQ 5', segment: 'EV SUV', category: 'EV', stock: 12000, avgMonthlySales: 3000, unitCost: 40000 },
  { id: 4, model: 'Hyundai Santa Fe', segment: 'Mid-size SUV', category: 'SUV', stock: 21000, avgMonthlySales: 12000, unitCost: 30000 },
  { id: 5, model: 'Hyundai Elantra', segment: 'Compact Sedan', category: 'Volume', stock: 9000, avgMonthlySales: 14000, unitCost: 18000 },
  { id: 6, model: 'Hyundai Palisade', segment: 'Full-size SUV', category: 'SUV', stock: 13500, avgMonthlySales: 9000, unitCost: 42000 },
  { id: 7, model: 'Hyundai Tucson', segment: 'Compact SUV', category: 'Volume', stock: 30000, avgMonthlySales: 15000, unitCost: 24000 },
];

// Segment-specific DSI targets. High-margin / low-velocity segments tolerate
// more days on hand than fast-turning volume segments. This is the core of the
// thesis: a single uniform threshold would be analytically wrong.
const SEGMENT_TARGET_DSI: Record<InventoryItem['category'], number> = {
  Luxury: 75,
  EV: 70,
  SUV: 60,
  Volume: 45,
};

// A pool running below half its target DSI is treated as stockout-risk
// (too lean — leaving sales on the table).
const STOCKOUT_FACTOR = 0.5;

interface ScenarioParams {
  carryingRate: number; // annual carrying cost as % of unit cost (floorplan + depreciation + storage)
  liquidationDiscount: number; // one-time haircut to clear excess units
  demandShift: number; // +/- shock applied to monthly sales
}

const DEFAULT_PARAMS: ScenarioParams = {
  carryingRate: 0.18,
  liquidationDiscount: 0.06,
  demandShift: 0,
};

type Status = 'At Risk' | 'Healthy' | 'Stockout Risk';

interface ProcessedItem extends InventoryItem {
  dailySales: number;
  dsi: number;
  targetDSI: number;
  targetStock: number;
  status: Status;
  excessUnits: number;
  excessCapital: number;
  shortfallUnits: number;
  shortfallCapital: number;
  carryingOnExcess: number; // annual $ bleed on the excess
  recaptured: number; // capital freed if excess cleared (net of discount)
  liquidationLoss: number; // one-time loss to clear excess
  netFirstYear: number; // carryingOnExcess - liquidationLoss
  totalCapital: number;
}

function process(items: InventoryItem[], p: ScenarioParams): ProcessedItem[] {
  return items.map((item) => {
    const adjMonthly = item.avgMonthlySales * (1 + p.demandShift);
    const dailySales = adjMonthly / 30;
    const dsi = dailySales > 0 ? item.stock / dailySales : 999;
    const targetDSI = SEGMENT_TARGET_DSI[item.category];
    const targetStock = Math.round(targetDSI * dailySales);

    let status: Status = 'Healthy';
    if (dsi > targetDSI) status = 'At Risk';
    else if (dsi < targetDSI * STOCKOUT_FACTOR) status = 'Stockout Risk';

    const excessUnits = Math.max(0, item.stock - targetStock);
    const excessCapital = excessUnits * item.unitCost;
    const shortfallUnits = Math.max(0, targetStock - item.stock);
    const shortfallCapital = status === 'Stockout Risk' ? shortfallUnits * item.unitCost : 0;

    const carryingOnExcess = excessCapital * p.carryingRate;
    const liquidationLoss = excessCapital * p.liquidationDiscount;
    const recaptured = excessCapital * (1 - p.liquidationDiscount);
    const netFirstYear = carryingOnExcess - liquidationLoss;

    return {
      ...item,
      dailySales,
      dsi: Math.round(dsi),
      targetDSI,
      targetStock,
      status,
      excessUnits,
      excessCapital,
      shortfallUnits,
      shortfallCapital,
      carryingOnExcess,
      recaptured,
      liquidationLoss,
      netFirstYear,
      totalCapital: item.stock * item.unitCost,
    };
  });
}

interface Portfolio {
  capitalDeployed: number;
  capitalAboveTarget: number;
  carryingBleed: number; // annual $ bleed on above-target capital
  portfolioDSI: number; // volume-weighted days on hand
  recapturable: number;
  liquidationLossTotal: number;
  netFirstYearTotal: number;
  stockoutGapCapital: number;
  atRiskCount: number;
}

function summarize(rows: ProcessedItem[]): Portfolio {
  const capitalDeployed = rows.reduce((s, r) => s + r.totalCapital, 0);
  const capitalAboveTarget = rows.reduce((s, r) => s + r.excessCapital, 0);
  const carryingBleed = rows.reduce((s, r) => s + r.carryingOnExcess, 0);
  const totalStock = rows.reduce((s, r) => s + r.stock, 0);
  const totalDaily = rows.reduce((s, r) => s + r.dailySales, 0);
  const recapturable = rows.reduce((s, r) => s + r.recaptured, 0);
  const liquidationLossTotal = rows.reduce((s, r) => s + r.liquidationLoss, 0);
  const stockoutGapCapital = rows.reduce((s, r) => s + r.shortfallCapital, 0);
  return {
    capitalDeployed,
    capitalAboveTarget,
    carryingBleed,
    portfolioDSI: totalDaily > 0 ? Math.round(totalStock / totalDaily) : 0,
    recapturable,
    liquidationLossTotal,
    netFirstYearTotal: carryingBleed - liquidationLossTotal,
    stockoutGapCapital,
    atRiskCount: rows.filter((r) => r.status === 'At Risk').length,
  };
}

/* ============================================================================
   FORMATTING
   ========================================================================== */

const money = (n: number): string => {
  const a = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (a >= 1e9) return `${sign}$${(a / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `${sign}$${(a / 1e6).toFixed(0)}M`;
  if (a >= 1e3) return `${sign}$${(a / 1e3).toFixed(0)}K`;
  return `${sign}$${a.toFixed(0)}`;
};

const num = (n: number): string => n.toLocaleString('en-US');
const pct = (n: number): string => `${(n * 100).toFixed(0)}%`;

const STATUS_STYLE: Record<Status, string> = {
  'At Risk': 'text-red-600 bg-red-50 border-red-200',
  Healthy: 'text-green-600 bg-green-50 border-green-200',
  'Stockout Risk': 'text-amber-600 bg-amber-50 border-amber-200',
};

/* ============================================================================
   STRATEGY BRIEF (consulting-grade, answer-first)
   ========================================================================== */

const TONE: Record<string, string> = {
  slate: 'bg-slate-100',
  red: 'bg-red-50',
  green: 'bg-green-50',
};

const BriefBlock: React.FC<{
  icon: React.ReactNode;
  tone: keyof typeof TONE;
  label: string;
  lead: string;
  children: React.ReactNode;
}> = ({ icon, tone, label, lead, children }) => (
  <section className="grid md:grid-cols-3 gap-8 items-start">
    <div className="md:col-span-1">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${TONE[tone]}`}>{icon}</div>
        <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">{label}</h3>
      </div>
      <p className="text-slate-500 text-sm leading-relaxed font-medium">{lead}</p>
    </div>
    <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
      <p className="text-slate-600 leading-relaxed">{children}</p>
    </div>
  </section>
);

const StrategyBrief: React.FC<{ rows: ProcessedItem[]; pf: Portfolio }> = ({ rows, pf }) => {
  const aboveTargetShare = pf.capitalDeployed > 0 ? pf.capitalAboveTarget / pf.capitalDeployed : 0;
  const evRow = rows.find((r) => r.category === 'EV');
  const leanRow = rows.find((r) => r.status === 'Stockout Risk');

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="mb-10">
        <h2 className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em] mb-3">Strategy Brief</h2>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
          Reallocating above-target inventory to recover capital and protect ROIC
        </h1>
      </div>

      {/* Answer-first recommendation */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-10 mb-12 shadow-xl">
        <p className="text-indigo-400 font-black text-[11px] uppercase tracking-widest mb-3">Recommendation</p>
        <p className="text-lg md:text-xl leading-relaxed font-medium">
          Clear <span className="text-indigo-300 font-bold">{money(pf.capitalAboveTarget)}</span> of above-target
          inventory ({pct(aboveTargetShare)} of deployed capital). This halts{' '}
          <span className="text-indigo-300 font-bold">{money(pf.carryingBleed)}/yr</span> of carrying cost, recaptures{' '}
          <span className="text-indigo-300 font-bold">{money(pf.recapturable)}</span>, and fully funds the{' '}
          <span className="text-indigo-300 font-bold">{money(pf.stockoutGapCapital)}</span> shortfall in
          demand-constrained volume segments — for a one-time clearance cost of{' '}
          <span className="text-indigo-300 font-bold">{money(pf.liquidationLossTotal)}</span>.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { k: 'First-year net benefit', v: money(pf.netFirstYearTotal) },
            { k: 'Recurring savings', v: `${money(pf.carryingBleed)}/yr` },
            { k: 'Capital recaptured', v: money(pf.recapturable) },
            { k: 'Pools to act on', v: `${pf.atRiskCount}` },
          ].map((m) => (
            <div key={m.k} className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{m.k}</p>
              <p className="text-xl font-black">{m.v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-12">
        <BriefBlock
          icon={<Target className="w-5 h-5 text-slate-600" />}
          tone="slate"
          label="Situation"
          lead="Capital is locked in a multi-billion-dollar national pipeline; velocity varies sharply by segment."
        >
          The portfolio holds <span className="font-bold text-slate-700">{money(pf.capitalDeployed)}</span> across luxury,
          EV, SUV, and volume segments. Each segment turns at a different rate, so inventory health cannot be judged
          against one universal benchmark — it has to be measured against a segment-specific target Days Sales of
          Inventory (DSI).
        </BriefBlock>

        <BriefBlock
          icon={<ShieldAlert className="w-5 h-5 text-red-600" />}
          tone="red"
          label="Complication"
          lead="The current mix is simultaneously over-stocked in slow segments and under-stocked in fast ones."
        >
          {evRow && (
            <>
              {evRow.model} is running at <span className="font-bold text-slate-700">{evRow.dsi} days</span> against a{' '}
              {evRow.targetDSI}-day target — softening BEV demand showing up as on-lot capital.{' '}
            </>
          )}
          {leanRow && (
            <>
              At the same time, {leanRow.model} sits at <span className="font-bold text-slate-700">{leanRow.dsi} days</span>{' '}
              — too lean — so the network is turning away volume demand it could profitably serve.{' '}
            </>
          )}
          The net effect is <span className="font-bold text-red-600">{money(pf.carryingBleed)}/yr</span> of avoidable
          carrying cost while a <span className="font-bold text-slate-700">{money(pf.stockoutGapCapital)}</span> demand
          gap goes unfunded.
        </BriefBlock>

        <BriefBlock
          icon={<Zap className="w-5 h-5 text-green-600" />}
          tone="green"
          label="Resolution"
          lead="A net-benefit decision rule that acts only when carrying cost avoided exceeds the clearance cost."
        >
          For every above-target pool, act only when{' '}
          <span className="font-mono text-[13px] bg-slate-100 px-1.5 py-0.5 rounded">
            carrying cost avoided &gt; one-time clearance loss
          </span>
          . Recaptured capital is redeployed to relieve stockout-risk segments first, with the remainder funding
          strategic EV and growth priorities. The Decision Dashboard quantifies this per model and lets you stress the
          assumptions; the Execution Plan governs the rollout.
        </BriefBlock>
      </div>

      <p className="text-[10px] text-slate-400 italic text-center leading-relaxed max-w-2xl mx-auto mt-16 pt-10 border-t border-slate-200">
        Illustrative analysis for portfolio purposes. Not affiliated with, endorsed by, or representative of Hyundai
        Motor Group. All figures are simulated to demonstrate the analytical framework; assumptions and formulas are
        documented in METHODOLOGY.md.
      </p>
    </div>
  );
};

/* ============================================================================
   DECISION DASHBOARD (planning / analytics-grade)
   ========================================================================== */

const KpiCard: React.FC<{ label: string; value: string; sub: string; tip: string; accent?: string }> = ({
  label,
  value,
  sub,
  tip,
  accent = 'text-slate-800',
}) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
    <div className="flex items-center gap-1.5 mb-3" title={tip}>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <Info className="w-3 h-3 text-slate-300 cursor-help" />
    </div>
    <p className={`text-3xl font-black mb-1 ${accent}`}>{value}</p>
    <p className="text-[10px] text-slate-400 leading-tight">{sub}</p>
  </div>
);

const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, step, display, onChange }) => (
  <div>
    <div className="flex justify-between items-baseline mb-1.5">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      <span className="text-xs font-black text-indigo-600">{display}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full accent-indigo-600 cursor-pointer"
    />
  </div>
);

const Dashboard: React.FC<{
  rows: ProcessedItem[];
  pf: Portfolio;
  params: ScenarioParams;
  setParams: React.Dispatch<React.SetStateAction<ScenarioParams>>;
  recaptured: number;
  onExecute: (id: number) => void;
  onExecuteAll: () => void;
  onReset: () => void;
}> = ({ rows, pf, params, setParams, recaptured, onExecute, onExecuteAll, onReset }) => {
  const recommendations = rows
    .filter((r) => r.status === 'At Risk')
    .sort((a, b) => b.excessCapital - a.excessCapital);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Decision Dashboard</h1>
          <p className="text-slate-500 font-medium">Segment-targeted DSI monitoring with net-benefit reallocation</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Capital Recaptured</p>
            <p className="text-2xl font-black text-slate-800">{money(recaptured)}</p>
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight">Freed for redeployment</p>
          </div>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <KpiCard
          label="Capital Deployed"
          value={money(pf.capitalDeployed)}
          sub="Wholesale value of units in the national pipeline."
          tip="Sum of (units in stock x OEM wholesale cost) across all models."
        />
        <KpiCard
          label="Capital Above Target"
          value={money(pf.capitalAboveTarget)}
          sub="Value of units beyond each segment's target DSI."
          tip="Sum over at-risk pools of (units above target stock x unit cost). The base that carrying cost bleeds from."
          accent="text-red-600"
        />
        <KpiCard
          label="Annualized Carrying Cost"
          value={money(pf.carryingBleed)}
          sub={`Bleed on above-target capital at ${pct(params.carryingRate)}/yr.`}
          tip="Capital Above Target x carrying rate (floorplan interest + depreciation + storage). The recurring money at stake."
          accent="text-red-600"
        />
        <KpiCard
          label="Portfolio DSI"
          value={`${pf.portfolioDSI} days`}
          sub="Volume-weighted days of inventory on hand."
          tip="Total units / total daily sales. A single blended number; the table shows the segment-level detail that matters."
        />
      </div>

      {/* Scenario controls */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 mb-8">
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <Gauge className="w-4 h-4 text-indigo-600" />
          <h2 className="font-black text-sm uppercase tracking-widest text-slate-700">Scenario Assumptions</h2>
          <span className="text-[10px] text-slate-400 font-medium">— drag to test sensitivity; every figure recomputes live</span>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Slider
            label="Annual carrying cost"
            value={params.carryingRate}
            min={0.08}
            max={0.28}
            step={0.01}
            display={pct(params.carryingRate)}
            onChange={(v) => setParams((p) => ({ ...p, carryingRate: v }))}
          />
          <Slider
            label="Clearance discount"
            value={params.liquidationDiscount}
            min={0.02}
            max={0.15}
            step={0.01}
            display={pct(params.liquidationDiscount)}
            onChange={(v) => setParams((p) => ({ ...p, liquidationDiscount: v }))}
          />
          <Slider
            label="Demand shift"
            value={params.demandShift}
            min={-0.2}
            max={0.2}
            step={0.01}
            display={`${params.demandShift > 0 ? '+' : ''}${pct(params.demandShift)}`}
            onChange={(v) => setParams((p) => ({ ...p, demandShift: v }))}
          />
        </div>
      </div>

      {/* Channel table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2" title="Each model's DSI versus its segment-specific target. Status is set per segment, not by one universal cutoff.">
            <Boxes className="w-5 h-5 text-slate-400" />
            <h2 className="font-black text-lg tracking-tight">Segment Velocity Map</h2>
            <Info className="w-4 h-4 text-slate-300 cursor-help" />
          </div>
          <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-green-500 rounded-full" /> Healthy</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full" /> Stockout Risk</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-500 rounded-full" /> At Risk</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">Model</th>
                <th className="px-6 py-4 text-center">DSI / Target</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Capital Above Target</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <p className="font-black text-slate-800 tracking-tight">{r.model}</p>
                    <p className="text-[10px] text-slate-400 font-mono tracking-wide">{r.segment} · {num(r.stock)} units</p>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`text-sm font-black ${r.status === 'At Risk' ? 'text-red-600' : r.status === 'Stockout Risk' ? 'text-amber-600' : 'text-slate-800'}`}>
                      {r.dsi}
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold"> / {r.targetDSI}d</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border ${STATUS_STYLE[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right font-black text-slate-700">
                    {r.excessCapital > 0 ? money(r.excessCapital) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-6 py-5 text-right">
                    {r.status === 'At Risk' && r.netFirstYear > 0 ? (
                      <button
                        onClick={() => onExecute(r.id)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all active:scale-95"
                      >
                        Reallocate
                      </button>
                    ) : r.status === 'At Risk' ? (
                      <span
                        title="Above target, but clearing it would cost more than the carrying cost avoided — the net-benefit rule says hold."
                        className="inline-block text-amber-600 text-[10px] font-black uppercase tracking-widest cursor-help"
                      >
                        Hold · net-negative
                      </span>
                    ) : (
                      <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">No action</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendation engine */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <TrendingDown className="w-5 h-5 text-indigo-600" />
              <h2 className="font-black text-lg tracking-tight">Recommended Actions</h2>
              <span className="text-[10px] text-slate-400 font-medium">— ranked by capital above target, net-benefit tested</span>
            </div>
            <button
              onClick={onExecuteAll}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
            >
              Execute all positive net-benefit
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {recommendations.map((r) => (
              <div key={r.id} className="p-6 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-50 rounded-lg mt-0.5"><ArrowDownRight className="w-4 h-4 text-red-600" /></div>
                  <div>
                    <p className="font-black text-slate-800">{r.model} — clear {num(r.excessUnits)} units to target</p>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                      Avoids <span className="font-bold text-slate-700">{money(r.carryingOnExcess)}/yr</span> carrying cost
                      at a one-time <span className="font-bold text-slate-700">{money(r.liquidationLoss)}</span> clearance
                      loss. Recaptures <span className="font-bold text-slate-700">{money(r.recaptured)}</span>.
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">First-year net benefit</p>
                  <p className={`text-xl font-black ${r.netFirstYear >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {money(r.netFirstYear)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end mb-8">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset model
        </button>
      </div>
    </div>
  );
};

/* ============================================================================
   EXECUTION PLAN (program-management-grade)
   ========================================================================== */

const PHASES = [
  { window: 'Weeks 0–2', name: 'Mobilize', owner: 'PMO', detail: 'Stand up the data feed, ratify segment DSI targets with Finance, baseline the bleed.' },
  { window: 'Weeks 2–6', name: 'Pilot', owner: 'Regional Ops', detail: 'Apply the net-benefit rule to EV + one region; validate the recaptured-capital model against actuals.' },
  { window: 'Weeks 6–12', name: 'Scale', owner: 'Sales Ops', detail: 'Roll across all segments; embed reallocation triggers in the monthly S&OP cycle.' },
  { window: 'Ongoing', name: 'Govern', owner: 'Strategy / Finance', detail: 'Monthly net-benefit realized vs. plan; recalibrate targets quarterly as residuals and rates move.' },
];

const RACI = {
  cols: ['PMO', 'Regional Ops', 'Finance', 'Network'],
  rows: [
    { task: 'Set segment DSI targets', vals: ['C', 'C', 'A', 'I'] },
    { task: 'Approve reallocation', vals: ['I', 'R', 'A', 'C'] },
    { task: 'Execute clearance', vals: ['I', 'A', 'I', 'R'] },
    { task: 'Track realized benefit', vals: ['A', 'C', 'R', 'I'] },
  ],
};

const RISKS = [
  { risk: 'Luxury brand-equity erosion from discounting', mit: 'Use targeted retail incentives and inter-region transfers before any open clearance.' },
  { risk: 'Channel conflict over reallocated units', mit: 'Route decisions through Network with transparent allocation rules and dealer comms.' },
  { risk: 'Demand-forecast error invalidates targets', mit: 'Recompute against rolling 90-day sales; cap single-cycle reallocation at 30% of a pool.' },
  { risk: 'EV residual-value volatility', mit: 'Tighten the EV carrying-rate assumption; re-test net benefit monthly, not quarterly.' },
];

const RACI_COLOR: Record<string, string> = {
  R: 'bg-indigo-600 text-white',
  A: 'bg-slate-900 text-white',
  C: 'bg-slate-200 text-slate-700',
  I: 'bg-slate-50 text-slate-400',
};

const ExecutionPlan: React.FC = () => (
  <div className="max-w-5xl mx-auto py-12 px-4">
    <div className="mb-10">
      <h2 className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em] mb-3">Execution Plan</h2>
      <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
        From recommendation to governed rollout
      </h1>
    </div>

    {/* Phases */}
    <div className="flex items-center gap-2 mb-5">
      <GitBranch className="w-4 h-4 text-indigo-600" />
      <h3 className="font-black text-sm uppercase tracking-widest text-slate-700">Phased Rollout</h3>
    </div>
    <div className="grid md:grid-cols-2 gap-5 mb-14">
      {PHASES.map((p, i) => (
        <div key={p.name} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{p.window}</span>
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">{i + 1}</span>
          </div>
          <p className="font-black text-slate-800 mb-1">{p.name}</p>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Owner: {p.owner}</p>
          <p className="text-sm text-slate-500 leading-relaxed">{p.detail}</p>
        </div>
      ))}
    </div>

    {/* RACI */}
    <div className="flex items-center gap-2 mb-5">
      <Users className="w-4 h-4 text-indigo-600" />
      <h3 className="font-black text-sm uppercase tracking-widest text-slate-700">Decision Rights (RACI)</h3>
    </div>
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-x-auto mb-14">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <th className="px-6 py-4">Activity</th>
            {RACI.cols.map((c) => <th key={c} className="px-4 py-4 text-center">{c}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {RACI.rows.map((row) => (
            <tr key={row.task}>
              <td className="px-6 py-4 text-sm font-bold text-slate-700">{row.task}</td>
              {row.vals.map((v, idx) => (
                <td key={idx} className="px-4 py-4 text-center">
                  <span className={`inline-flex w-7 h-7 rounded-lg text-[11px] font-black items-center justify-center ${RACI_COLOR[v]}`}>{v}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* KPIs */}
    <div className="flex items-center gap-2 mb-5">
      <ClipboardCheck className="w-4 h-4 text-indigo-600" />
      <h3 className="font-black text-sm uppercase tracking-widest text-slate-700">Governance KPIs</h3>
    </div>
    <div className="grid sm:grid-cols-3 gap-5 mb-14">
      {[
        { k: 'Weekly', v: 'At-risk pool watchlist + units above target' },
        { k: 'Monthly', v: 'Realized net benefit vs. plan; capital recaptured' },
        { k: 'Quarterly', v: 'DSI target recalibration vs. rates & residuals' },
      ].map((m) => (
        <div key={m.k} className="bg-slate-900 text-white p-6 rounded-3xl">
          <p className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-2">{m.k}</p>
          <p className="text-sm leading-relaxed">{m.v}</p>
        </div>
      ))}
    </div>

    {/* Risks */}
    <div className="flex items-center gap-2 mb-5">
      <AlertTriangle className="w-4 h-4 text-indigo-600" />
      <h3 className="font-black text-sm uppercase tracking-widest text-slate-700">Key Risks &amp; Mitigations</h3>
    </div>
    <div className="space-y-4">
      {RISKS.map((r) => (
        <div key={r.risk} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm grid md:grid-cols-2 gap-4">
          <p className="text-sm font-bold text-slate-700">{r.risk}</p>
          <p className="text-sm text-slate-500 leading-relaxed">{r.mit}</p>
        </div>
      ))}
    </div>
  </div>
);

/* ============================================================================
   RETAIL & DMS LAYER (retail-execution-grade)
   ----------------------------------------------------------------------------
   Drills the OEM thesis down to where it becomes a dealer P&L reality. The
   Dealer Management System (e.g. CDK, Reynolds & Reynolds, Tekion) is the
   system of record: VIN-level in-stock dates, F&I / sales transactions, and
   RDR (retail delivery reporting) back to the OEM are the source for
   days-on-lot, floorplan, and turn used here. See METHODOLOGY.md §10.
   ========================================================================== */

const FLOORPLAN_APR = 0.095; // dealer floorplan financing rate

interface Dealer {
  id: number;
  name: string;
  profile: string;
  avgUnitCost: number;
  monthlySales: number;
  aging: { d0_30: number; d31_60: number; d61_90: number; d90plus: number };
}

const DEALERS: Dealer[] = [
  { id: 1, name: 'Summit Hyundai', profile: 'Balanced metro', avgUnitCost: 28000, monthlySales: 95, aging: { d0_30: 60, d31_60: 35, d61_90: 18, d90plus: 7 } },
  { id: 2, name: 'Metro Genesis', profile: 'Luxury, low velocity', avgUnitCost: 50000, monthlySales: 30, aging: { d0_30: 22, d31_60: 18, d61_90: 15, d90plus: 15 } },
  { id: 3, name: 'Coastal Hyundai', profile: 'EV-heavy', avgUnitCost: 38000, monthlySales: 70, aging: { d0_30: 50, d31_60: 35, d61_90: 30, d90plus: 35 } },
  { id: 4, name: 'Valley Hyundai', profile: 'Volume, fast turn', avgUnitCost: 22000, monthlySales: 110, aging: { d0_30: 55, d31_60: 25, d61_90: 8, d90plus: 2 } },
  { id: 5, name: 'Lakeside Hyundai', profile: 'Mixed', avgUnitCost: 30000, monthlySales: 65, aging: { d0_30: 40, d31_60: 30, d61_90: 22, d90plus: 18 } },
];

interface DealerCalc extends Dealer {
  onLot: number;
  agedUnits: number; // > 60 days
  criticalUnits: number; // 90+ days (curtailment territory)
  agedShare: number;
  daysSupply: number;
  turn: number; // annualized
  floorplanMonth: number;
  agedFloorplanMonth: number;
  lever: string;
  note: string;
}

function dealerCalc(d: Dealer): DealerCalc {
  const onLot = d.aging.d0_30 + d.aging.d31_60 + d.aging.d61_90 + d.aging.d90plus;
  const agedUnits = d.aging.d61_90 + d.aging.d90plus;
  const criticalUnits = d.aging.d90plus;
  const agedShare = onLot > 0 ? agedUnits / onLot : 0;
  const daily = d.monthlySales / 30;
  const daysSupply = daily > 0 ? Math.round(onLot / daily) : 0;
  const turn = onLot > 0 ? (d.monthlySales * 12) / onLot : 0;
  const floorplanMonth = onLot * d.avgUnitCost * (FLOORPLAN_APR / 12);
  const agedFloorplanMonth = agedUnits * d.avgUnitCost * (FLOORPLAN_APR / 12);

  let lever = 'Hold';
  let note = 'Aging within normal range.';
  if (agedShare > 0.25) {
    lever = turn > 9 ? 'Targeted incentive' : 'Dealer trade + incentive';
    note = `${agedUnits} units over 60 days burning ${money(agedFloorplanMonth)}/mo; ${criticalUnits} past 90-day curtailment.`;
  } else if (agedShare > 0.15) {
    lever = 'Promote pre-90d';
    note = `${agedUnits} units aging; move before 90-day curtailment hits.`;
  }
  return { ...d, onLot, agedUnits, criticalUnits, agedShare, daysSupply, turn, floorplanMonth, agedFloorplanMonth, lever, note };
}

const LEVER_STYLE: Record<string, string> = {
  Hold: 'text-slate-400 bg-slate-50 border-slate-200',
  'Promote pre-90d': 'text-amber-600 bg-amber-50 border-amber-200',
  'Targeted incentive': 'text-indigo-600 bg-indigo-50 border-indigo-200',
  'Dealer trade + incentive': 'text-red-600 bg-red-50 border-red-200',
};

const RetailDMS: React.FC = () => {
  const dealers = DEALERS.map(dealerCalc);
  const onLot = dealers.reduce((s, d) => s + d.onLot, 0);
  const agedUnits = dealers.reduce((s, d) => s + d.agedUnits, 0);
  const floorplanBalance = dealers.reduce((s, d) => s + d.onLot * d.avgUnitCost, 0);
  const floorplanMonth = dealers.reduce((s, d) => s + d.floorplanMonth, 0);
  const agedFloorplanMonth = dealers.reduce((s, d) => s + d.agedFloorplanMonth, 0);
  const totalMonthlySales = dealers.reduce((s, d) => s + d.monthlySales, 0);
  const networkTurn = onLot > 0 ? (totalMonthlySales * 12) / onLot : 0;

  const buckets = [
    { label: '0–30d', n: dealers.reduce((s, d) => s + d.aging.d0_30, 0), color: 'bg-green-500' },
    { label: '31–60d', n: dealers.reduce((s, d) => s + d.aging.d31_60, 0), color: 'bg-slate-400' },
    { label: '61–90d', n: dealers.reduce((s, d) => s + d.aging.d61_90, 0), color: 'bg-amber-500' },
    { label: '90+d', n: dealers.reduce((s, d) => s + d.aging.d90plus, 0), color: 'bg-red-500' },
  ];

  const actions = dealers.filter((d) => d.lever !== 'Hold').sort((a, b) => b.agedFloorplanMonth - a.agedFloorplanMonth);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
      <header className="mb-8">
        <h2 className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em] mb-3">Retail &amp; DMS</h2>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Where above-target capital becomes dealer floorplan</h1>
        <p className="text-slate-500 font-medium mt-1">
          DMS-sourced aging, floorplan, and turn across a representative dealer network
        </p>
      </header>

      {/* DMS data-lineage banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-7 mb-8 flex flex-col md:flex-row md:items-center gap-4">
        <div className="p-3 bg-indigo-50 rounded-2xl shrink-0">
          <Building2 className="w-6 h-6 text-indigo-600" />
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          <span className="font-bold text-slate-800">Data lineage:</span> VIN-level in-stock dates, F&amp;I and sales
          transactions, and RDR flow from the <span className="font-bold text-slate-800">DMS</span> (CDK · Reynolds ·
          Tekion) → these are the source for days-on-lot, floorplan balance, and turn. The capital the OEM flags as
          <span className="font-bold text-slate-800"> above target</span> shows up here as
          <span className="font-bold text-slate-800"> aged units</span> carrying floorplan interest until they retail,
          transfer, or wholesale.
        </p>
      </div>

      {/* Network KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <KpiCard
          label="Network Floorplan Balance"
          value={money(floorplanBalance)}
          sub={`${num(onLot)} units on lot · ${networkTurn.toFixed(1)}x annual turn.`}
          tip="Sum of (on-lot units x avg unit cost) across the dealer network."
        />
        <KpiCard
          label="Floorplan Cost / mo"
          value={money(floorplanMonth)}
          sub={`Financing the lot at ${pct(FLOORPLAN_APR)} APR.`}
          tip="Floorplan balance x (APR / 12). The monthly cost of holding inventory."
        />
        <KpiCard
          label="Aged Inventory (>60d)"
          value={pct(onLot > 0 ? agedUnits / onLot : 0)}
          sub={`${num(agedUnits)} units past 60 days on lot.`}
          tip="Units over 60 days as a share of on-lot inventory. The retail mirror of the OEM above-target metric."
          accent="text-amber-600"
        />
        <KpiCard
          label="Aged Floorplan Burn / mo"
          value={money(agedFloorplanMonth)}
          sub="Interest spent holding units that should have moved."
          tip="Floorplan cost attributable to >60-day units. This is the recoverable waste."
          accent="text-red-600"
        />
      </div>

      {/* Aging distribution */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 mb-8">
        <div className="flex items-center gap-2 mb-5">
          <Clock className="w-4 h-4 text-indigo-600" />
          <h2 className="font-black text-sm uppercase tracking-widest text-slate-700">Network Aging Distribution</h2>
          <span className="text-[10px] text-slate-400 font-medium">— 90+ days triggers floorplan curtailment</span>
        </div>
        <div className="flex w-full h-6 rounded-full overflow-hidden mb-4">
          {buckets.map((b) => (
            <div key={b.label} className={`${b.color} h-full`} style={{ width: `${(b.n / onLot) * 100}%` }} title={`${b.label}: ${b.n} units`} />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {buckets.map((b) => (
            <div key={b.label} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-sm ${b.color}`} />
              <div>
                <p className="text-sm font-black text-slate-800">{num(b.n)} <span className="text-slate-400 font-bold">units</span></p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{b.label} · {pct(b.n / onLot)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dealer table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center gap-2">
          <Store className="w-5 h-5 text-slate-400" />
          <h2 className="font-black text-lg tracking-tight">Dealer Network</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">Rooftop</th>
                <th className="px-6 py-4 text-center">Days Supply / Turn</th>
                <th className="px-6 py-4 text-center">Aged &gt;60d</th>
                <th className="px-6 py-4 text-right">Floorplan / mo</th>
                <th className="px-6 py-4 text-right">Recommended Lever</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dealers.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <p className="font-black text-slate-800 tracking-tight">{d.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono tracking-wide">{d.profile} · {num(d.onLot)} units</p>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-sm font-black text-slate-800">{d.daysSupply}d</span>
                    <span className="text-[11px] text-slate-400 font-bold"> · {d.turn.toFixed(1)}x</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`text-sm font-black ${d.agedShare > 0.25 ? 'text-red-600' : d.agedShare > 0.15 ? 'text-amber-600' : 'text-slate-800'}`}>
                      {pct(d.agedShare)}
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold"> · {d.criticalUnits} @ 90+</span>
                  </td>
                  <td className="px-6 py-5 text-right font-black text-slate-700">{money(d.floorplanMonth)}</td>
                  <td className="px-6 py-5 text-right">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border ${LEVER_STYLE[d.lever]}`}>
                      {d.lever}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Retail actions */}
      {actions.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="p-6 md:p-8 border-b border-slate-100 flex items-center gap-2 flex-wrap">
            <Truck className="w-5 h-5 text-indigo-600" />
            <h2 className="font-black text-lg tracking-tight">Retail Actions</h2>
            <span className="text-[10px] text-slate-400 font-medium">— ranked by monthly floorplan burn on aged units</span>
          </div>
          <div className="divide-y divide-slate-100">
            {actions.map((d) => (
              <div key={d.id} className="p-6 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg mt-0.5"><Store className="w-4 h-4 text-indigo-600" /></div>
                  <div>
                    <p className="font-black text-slate-800">{d.name} — {d.lever.toLowerCase()}</p>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xl">{d.note}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Floorplan recoverable</p>
                  <p className="text-xl font-black text-green-600">{money(d.agedFloorplanMonth)}/mo</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-[10px] text-slate-400 italic text-center leading-relaxed max-w-2xl mx-auto mt-4 mb-4">
        Representative dealer-group figures, illustrative only. DMS vendors named for context; no affiliation or
        endorsement implied. Floorplan and aging logic documented in METHODOLOGY.md §10.
      </p>
    </div>
  );
};

/* ============================================================================
   APP SHELL
   ========================================================================== */

type View = 'brief' | 'dashboard' | 'execution' | 'retail';

const App: React.FC = () => {
  const [view, setView] = useState<View>('brief');
  const [inventory, setInventory] = useState<InventoryItem[]>(HYUNDAI_INVENTORY);
  const [params, setParams] = useState<ScenarioParams>(DEFAULT_PARAMS);
  const [recaptured, setRecaptured] = useState(0);

  const rows = useMemo(() => process(inventory, params), [inventory, params]);
  const pf = useMemo(() => summarize(rows), [rows]);

  // Strategy brief always reflects the baseline data at default assumptions so
  // the headline numbers stay stable and consistent with the documented case.
  const baselineRows = useMemo(() => process(HYUNDAI_INVENTORY, DEFAULT_PARAMS), []);
  const baselinePf = useMemo(() => summarize(baselineRows), [baselineRows]);

  const executeOne = (id: number) => {
    const row = rows.find((r) => r.id === id);
    // Honor the net-benefit rule per row, exactly like "Execute all": only act
    // when carrying cost avoided exceeds the one-time clearance loss.
    if (!row || row.excessUnits <= 0 || row.netFirstYear <= 0) return;
    setRecaptured((c) => c + row.recaptured);
    setInventory((prev) => prev.map((i) => (i.id === id ? { ...i, stock: row.targetStock } : i)));
  };

  const executeAll = () => {
    const positive = rows.filter((r) => r.status === 'At Risk' && r.netFirstYear > 0);
    if (positive.length === 0) return;
    const freed = positive.reduce((s, r) => s + r.recaptured, 0);
    setRecaptured((c) => c + freed);
    setInventory((prev) =>
      prev.map((i) => {
        const hit = positive.find((r) => r.id === i.id);
        return hit ? { ...i, stock: hit.targetStock } : i;
      })
    );
  };

  const reset = () => {
    setInventory(HYUNDAI_INVENTORY);
    setParams(DEFAULT_PARAMS);
    setRecaptured(0);
  };

  const tabs: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'brief', label: 'Strategy Brief', icon: <FileText className="w-4 h-4" /> },
    { id: 'dashboard', label: 'Decision Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'execution', label: 'Execution Plan', icon: <GitBranch className="w-4 h-4" /> },
    { id: 'retail', label: 'Retail & DMS', icon: <Store className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="sticky top-0 h-16 bg-white/90 backdrop-blur border-b border-slate-200 z-40 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
            <Factory className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-xs md:text-sm tracking-tight hidden sm:block">OEM INVENTORY HEALTH</span>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className={`flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-lg text-[11px] md:text-xs font-bold transition-all ${
                view === t.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.icon}
              <span className="hidden md:inline">{t.label}</span>
            </button>
          ))}
        </div>
        <div className="w-8 md:w-32" />
      </nav>

      <main className="pb-16">
        {view === 'brief' && <StrategyBrief rows={baselineRows} pf={baselinePf} />}
        {view === 'dashboard' && (
          <div className="pt-8">
            <Dashboard
              rows={rows}
              pf={pf}
              params={params}
              setParams={setParams}
              recaptured={recaptured}
              onExecute={executeOne}
              onExecuteAll={executeAll}
              onReset={reset}
            />
          </div>
        )}
        {view === 'execution' && <ExecutionPlan />}
        {view === 'retail' && <RetailDMS />}
      </main>

      <footer className="max-w-7xl mx-auto mb-16 px-4 text-center border-t border-slate-200 pt-10">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.35em] leading-relaxed">
          Joel Johnson · Automotive Strategy &amp; Planning Portfolio
        </p>
        <p className="text-slate-300 text-[9px] mt-2 max-w-xl mx-auto leading-relaxed">
          Illustrative case study. Not affiliated with or endorsed by Hyundai Motor Group. Methodology and assumptions in
          METHODOLOGY.md.
        </p>
      </footer>
    </div>
  );
};

export default App;
