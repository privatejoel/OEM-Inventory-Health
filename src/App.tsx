import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRightLeft, 
  DollarSign, 
  Package, 
  BarChart3, 
  RefreshCw, 
  Info, 
  X, 
  ArrowRight, 
  Factory, 
  FileText, 
  LayoutDashboard, 
  Target, 
  Zap, 
  ShieldAlert,
  RotateCcw
} from 'lucide-react';

// Real-world OEM Data: Hyundai/Genesis Lineup
const HYUNDAI_INVENTORY = [
  { id: 1, model: 'Genesis G80', segment: 'Luxury Sedan', stock: 14, avgMonthlySales: 3.2, unitCost: 56000, category: 'Luxury' },
  { id: 2, model: 'Hyundai Venue', segment: 'Compact SUV', stock: 58, avgMonthlySales: 62, unitCost: 19800, category: 'Volume' },
  { id: 3, model: 'Hyundai IONIQ 5', segment: 'EV SUV', stock: 32, avgMonthlySales: 38, unitCost: 45000, category: 'EV' },
  { id: 4, model: 'Hyundai Santa Fe', segment: 'Mid-size SUV', stock: 24, avgMonthlySales: 28, unitCost: 36000, category: 'SUV' },
  { id: 5, model: 'Hyundai Elantra', segment: 'Sedan', stock: 42, avgMonthlySales: 55, unitCost: 21500, category: 'Volume' },
  { id: 6, model: 'Hyundai Palisade', segment: 'Full-size SUV', stock: 18, avgMonthlySales: 5.5, unitCost: 48000, category: 'Luxury' },
];

const INITIAL_LIQUID_CASH = 2450000;

const CaseStudyPage = () => (
  <div className="max-w-5xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="mb-12 text-center">
      <h2 className="text-sm font-black text-indigo-600 uppercase tracking-[0.3em] mb-3">Executive Case Study</h2>
      <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4">
        Optimizing Multi-Billion Dollar <br/>OEM Inventory Cycles
      </h1>
      <p className="text-slate-500 text-lg max-w-2xl mx-auto">
        A strategic framework for capital reallocation in high-volatility automotive markets.
      </p>
    </div>

    <div className="space-y-16">
      {/* Section 1: Situation */}
      <section className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-100 rounded-lg"><Target className="w-5 h-5 text-slate-600" /></div>
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">The Situation</h3>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            Modern OEMs manage massive global vehicle pipelines where capital is locked in transit for 60-90 days before reaching retail delivery.
          </p>
        </div>
        <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-slate-700 leading-relaxed italic">
            "In 2024, inventory holding costs surged due to shifting consumer preferences from ICE to EV and high interest rates on floor-planning loans. Hyundai Motor Group required a mechanism to identify 'stagnant' capital at a regional level before it impacted quarterly ROE."
          </p>
        </div>
      </section>

      {/* Section 2: Complication */}
      <section className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-50 rounded-lg"><ShieldAlert className="w-5 h-5 text-red-600" /></div>
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">The Complication</h3>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            Traditional reporting is reactive. By the time a 'slow-mover' is identified, the capital is already depleted by depreciation and regional port storage fees.
          </p>
        </div>
        <div className="md:col-span-2 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-900 text-white p-6 rounded-2xl">
              <p className="text-indigo-400 font-black text-xs uppercase mb-2">Issue A</p>
              <p className="text-sm">Luxury segments (Genesis) have high margins but extremely low velocity, causing "dead-stock" if misallocated to wrong regions.</p>
            </div>
            <div className="bg-slate-900 text-white p-6 rounded-2xl">
              <p className="text-indigo-400 font-black text-xs uppercase mb-2">Issue B</p>
              <p className="text-sm">High-turnover segments (Venue/Elantra) suffer from frequent stockouts, leading to missed revenue opportunities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Resolution */}
      <section className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 rounded-lg"><Zap className="w-5 h-5 text-green-600" /></div>
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">The Resolution</h3>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            A Predictive DSI Dashboard that allows OEM Executives to simulate "Inventory Redirection" from low-velocity ports to high-demand hubs.
          </p>
        </div>
        <div className="md:col-span-2 bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-xl shadow-indigo-100">
          <h4 className="text-xl font-bold mb-6 italic">The Proposed Solution:</h4>
          <ul className="space-y-4">
            <li className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">1</div>
              <p className="text-sm opacity-90">
                <span className="font-bold">Threshold Automation</span>: Set a 60-day DSI hard-cap to trigger immediate management review of luxury segments.
              </p>
            </li>
            <li className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">2</div>
              <p className="text-sm opacity-90">
                <span className="font-bold">Liquidity Reinvestment</span>: 30% reallocation of capital from "At Risk" units back into Volume and EV segments.
              </p>
            </li>
            <li className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">3</div>
              <p className="text-sm opacity-90">
                <span className="font-bold">Decision-Support UI</span>: A confirmation workflow that models the 6% liquidation loss versus the 15% holding-cost saving.
              </p>
            </li>
          </ul>
        </div>
      </section>
      
      {/* Disclaimer Section for Case Study */}
      <section className="pt-12 border-t border-slate-200">
        <p className="text-[10px] text-slate-400 italic text-center leading-relaxed max-w-2xl mx-auto">
          Disclaimer: This case study and associated dashboard are created for educational purposes only. This project is not affiliated with, endorsed by, or representative of Hyundai Motor Group or its subsidiaries. All data, scenarios, and optimization models are simulated to demonstrate product planning and analytical capabilities.
        </p>
      </section>
    </div>
  </div>
);

interface ProcessedItem {
  id: number;
  model: string;
  segment: string;
  stock: number;
  avgMonthlySales: number;
  unitCost: number;
  category: string;
  dsi: number;
  status: string;
  color: string;
  icon: React.ReactNode;
  totalCapital: number;
}

const App = () => {
  const [view, setView] = useState<'casestudy' | 'dashboard'>('casestudy'); 
  const [inventory, setInventory] = useState(HYUNDAI_INVENTORY);
  const [liquidCash, setLiquidCash] = useState(INITIAL_LIQUID_CASH); 
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ProcessedItem | null>(null); 

  const processedInventory = useMemo(() => {
    return inventory.map(item => {
      const dsi = Math.round(item.stock / (item.avgMonthlySales / 30));
      let status = 'Healthy';
      let color = 'text-green-600 bg-green-50 border-green-200';
      let icon = <CheckCircle2 className="w-4 h-4" />;
      
      if (dsi > 60) {
        status = 'At Risk';
        color = 'text-red-600 bg-red-50 border-red-200';
        icon = <AlertCircle className="w-4 h-4" />;
      } else if (dsi > 30) {
        status = 'Warning';
        color = 'text-amber-600 bg-amber-50 border-amber-200';
        icon = <Info className="w-4 h-4" />;
      }
      const totalCapital = item.stock * item.unitCost;
      return { ...item, dsi, status, color, icon, totalCapital };
    });
  }, [inventory]);

  const metrics = useMemo(() => {
    const totalInventoryValue = processedInventory.reduce((sum, item) => sum + item.totalCapital, 0);
    const atRiskCapital = processedInventory
      .filter(item => item.status === 'At Risk')
      .reduce((sum, item) => sum + item.totalCapital, 0);
    const healthyInventory = processedInventory.filter(item => item.status === 'Healthy').length;
    return { totalInventoryValue, atRiskCapital, healthyInventory };
  }, [processedInventory]);

  const resetDashboard = () => {
    setInventory(HYUNDAI_INVENTORY);
    setLiquidCash(INITIAL_LIQUID_CASH);
    setLastAction(null);
    setSelectedItem(null);
  };

  const openReallocationModal = (id: number) => {
    const item = processedInventory.find(i => i.id === id);
    if (item) setSelectedItem(item);
  };

  const executeReallocation = () => {
    if (!selectedItem) return;
    const stockToLiquidate = Math.ceil(selectedItem.stock * 0.30);
    const recoveredCapital = stockToLiquidate * selectedItem.unitCost * 0.94; 
    setInventory(prev => prev.map(i => i.id === selectedItem.id ? { ...i, stock: i.stock - stockToLiquidate } : i));
    setLiquidCash(prev => prev + recoveredCapital);
    setLastAction(`OEM Action Executed: Redirected ${stockToLiquidate} units of ${selectedItem.model}. Recovered $${(recoveredCapital / 1000000).toFixed(2)}M.`);
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative">
      
      {/* Navigation Sidebar-style Toggle */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
            <Factory className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-sm tracking-tighter">HYUNDAI GLOBAL OPS</span>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setView('casestudy')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'casestudy' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <FileText className="w-4 h-4" />
            Case Study
          </button>
          <button 
            onClick={() => setView('dashboard')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'dashboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Live Dashboard
          </button>
        </div>
        <div className="hidden md:block">
           <button 
            onClick={resetDashboard}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-200 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
           >
             <RotateCcw className="w-3.5 h-3.5" />
             Reset System
           </button>
        </div>
      </nav>

      <div className="pt-24 pb-12">
        {view === 'casestudy' ? (
          <CaseStudyPage />
        ) : (
          <div className="max-w-7xl mx-auto px-4 md:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Reallocation Modal */}
            {selectedItem && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">Regional Optimization</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">OEM Strategy Engine</p>
                    </div>
                    <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex gap-3">
                      <Factory className="w-6 h-6 text-red-500 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-red-800 uppercase tracking-tight">Production Alert: High Inventory</p>
                        <p className="text-sm text-red-700">
                          {selectedItem.model} channel DSI is <span className="font-bold">{selectedItem.dsi} days</span>.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-center">Current Stock</p>
                        <p className="text-xl font-bold text-center">{selectedItem.stock} Units</p>
                      </div>
                      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                        <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest text-center">Redirect Target</p>
                        <p className="text-xl font-bold text-indigo-600 text-center">{Math.ceil(selectedItem.stock * 0.30)} Units</p>
                      </div>
                    </div>

                    <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden text-center">
                      <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest mb-1">Capital Recapture</p>
                      <p className="text-3xl font-bold">
                        +${((Math.ceil(selectedItem.stock * 0.30) * selectedItem.unitCost * 0.94) / 1000000).toFixed(2)}M
                      </p>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 flex gap-4">
                    <button onClick={() => setSelectedItem(null)} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 border border-slate-200 hover:bg-white transition-all uppercase tracking-tighter">Decline</button>
                    <button onClick={executeReallocation} className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 uppercase tracking-tighter">Execute Redirect</button>
                  </div>
                </div>
              </div>
            )}

            {/* Header */}
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Inventory Health</h1>
                  <p className="text-slate-500 font-medium">Monitoring Days Sales of Inventory (DSI) for National Fleet Management</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shadow-sm">
                    <DollarSign className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 justify-center mb-0.5" title="Recaptured Capital: Total capital recovered through strategic liquidation or redirection for reinvestment in higher-velocity segments.">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Recaptured Capital</p>
                      <Info className="w-3 h-3 text-slate-300 cursor-help" />
                    </div>
                    <p className="text-2xl font-black text-slate-800 text-center">${(liquidCash / 1000000).toFixed(2)}M</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter text-center">Recovered for Reinvestment</p>
                  </div>
                </div>
            </header>

            {/* Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-center">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-4" title="The total acquisition value of all vehicles currently in the global system.">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Fleet Value</p>
                  <Info className="w-3 h-3 text-slate-300 cursor-help" />
                </div>
                <p className="text-4xl font-black text-slate-800 mb-2">${(metrics.totalInventoryValue / 1000000).toFixed(2)}M</p>
                <p className="text-[10px] text-slate-400 leading-tight">Total market valuation of vehicles in channel.</p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-red-100 ring-4 ring-red-50/50 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-4 text-red-600" title="Potential loss of ROE due to capital being tied in high-DSI (>60 days) inventory.">
                  <p className="text-[10px] font-black uppercase tracking-widest">Capital Leakage Risk</p>
                  <Info className="w-3 h-3 text-red-300 cursor-help" />
                </div>
                <p className="text-4xl font-black text-red-600 mb-2">${(metrics.atRiskCapital / 1000000).toFixed(2)}M</p>
                <p className="text-[10px] text-slate-400 leading-tight">Assets in low-velocity segments prone to depreciation.</p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-4 text-green-600" title="Return on Equity Efficiency: Measures the ratio of high-turnover healthy assets against the total fleet.">
                  <p className="text-[10px] font-black uppercase tracking-widest">ROE Efficiency</p>
                  <Info className="w-3 h-3 text-green-300 cursor-help" />
                </div>
                <p className="text-4xl font-black text-green-600 mb-2">{((metrics.healthyInventory / inventory.length) * 100).toFixed(0)}%</p>
                <p className="text-[10px] text-slate-400 leading-tight">Ratio of high-turnover assets vs. total fleet.</p>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden mb-8">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2" title="Channel Velocity Map: A visual representation of inventory turnover speeds across vehicle models, using Days Sales of Inventory (DSI) as the primary efficiency metric.">
                  <h2 className="font-black text-xl tracking-tight">Channel Velocity Map</h2>
                  <Info className="w-4 h-4 text-slate-300 cursor-help" />
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    <div className="flex items-center gap-1 text-center"><span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span> Healthy</div>
                    <div className="flex items-center gap-1 text-center"><span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span> At Risk</div>
                  </div>
                  <p className="text-[8px] text-slate-300 font-bold uppercase">Real-time segment performance tracking</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <th className="px-8 py-5">Vehicle Model</th>
                      <th className="px-8 py-5">Segment</th>
                      <th className="px-8 py-5 text-center">Avg. DSI</th>
                      <th className="px-8 py-5 text-right">Strategic Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {processedInventory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6 text-left">
                          <p className="font-black text-slate-800 tracking-tighter">{item.model}</p>
                          <p className="text-[10px] text-slate-400 font-mono tracking-widest">{item.category}</p>
                        </td>
                        <td className="px-8 py-6 text-left">
                          <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-black uppercase tracking-tight">{item.segment}</span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={`text-xs font-black ${item.status === 'At Risk' ? 'text-red-600' : 'text-slate-800'}`}>{item.dsi} DAYS</span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          {item.status === 'At Risk' ? (
                            <button onClick={() => openReallocationModal(item.id)} className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all">Optimize</button>
                          ) : (
                            <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">Efficient</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Execution Log */}
            {lastAction && (
              <div className="bg-slate-900 text-white p-8 rounded-[2rem] flex items-center gap-6 shadow-2xl animate-in fade-in slide-in-from-bottom-8">
                <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30"><RefreshCw className="w-6 h-6 text-white" /></div>
                <div>
                  <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Execution Log</p>
                  <p className="text-lg font-medium">{lastAction}</p>
                </div>
              </div>
            )}
            
            {/* Dashboard Disclaimer */}
            <div className="mt-8 px-8">
              <p className="text-[9px] text-slate-400 italic text-center leading-relaxed">
                Note: This dashboard is for educational purposes only and is not affiliated with, endorsed by, or representative of Hyundai Motor Group. All data and scenarios are simulated to demonstrate automotive product planning frameworks.
              </p>
            </div>
          </div>
        )}
      </div>

      <footer className="max-w-7xl mx-auto mt-12 mb-16 text-center border-t border-slate-200 pt-12">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">
          Joel Johnson | OEM Product Strategy Portfolio | Industry Case Study: Hyundai Motor Group
        </p>
      </footer>
    </div>
  );
};

export default App;
