# Methodology & Assumptions

This document makes the model defensible. Every figure in the app derives from the
inputs and formulas below. Numbers are **illustrative** — calibrated to OEM scale so
the narrative is coherent, not pulled from Hyundai's actuals.

## 1. Scope & unit of analysis

- **Market:** single market (U.S.), national aggregate. Not modeled per-region or per-dealer.
- **Cadence:** monthly demand, expressed as steady-state run-rate.
- **Pipeline:** units in the national pipeline (in-transit + on-lot), valued at OEM wholesale cost.
- **Currency:** USD, OEM wholesale (not retail/MSRP), to keep capital-at-risk on a cost basis.

## 2. Inputs (per model)

| Field | Meaning |
|---|---|
| `stock` | Units in the national pipeline |
| `avgMonthlySales` | Steady-state monthly demand (units) |
| `unitCost` | OEM wholesale cost per unit (USD) |
| `category` | Luxury / EV / SUV / Volume — drives the target DSI |

## 3. Core formulas

```
dailySales      = avgMonthlySales × (1 + demandShift) / 30
DSI             = stock / dailySales                       # days of inventory on hand
targetStock     = targetDSI[category] × dailySales
excessUnits     = max(0, stock − targetStock)
excessCapital   = excessUnits × unitCost
carryingOnExcess= excessCapital × carryingRate             # annual $ bled on the excess
liquidationLoss = excessCapital × liquidationDiscount      # one-time clearance haircut
recaptured      = excessCapital × (1 − liquidationDiscount)
netFirstYear    = carryingOnExcess − liquidationLoss
portfolioDSI    = Σ stock / Σ dailySales                   # volume-weighted, not a simple average
```

**Status rule (segment-specific, not one universal cutoff):**

- `At Risk` — `DSI > targetDSI` (over-stocked relative to the segment's velocity)
- `Stockout Risk` — `DSI < 0.5 × targetDSI` (too lean; turning away serviceable demand)
- `Healthy` — otherwise

## 4. Segment DSI targets (rationale)

High-margin, low-velocity segments tolerate more days on hand; fast-turning volume
segments do not. A uniform threshold would contradict the thesis.

| Segment | Target DSI | Rationale |
|---|---|---|
| Luxury | 75 | Low velocity, high margin; longer hold is economic |
| EV | 70 | Elevated by residual-value risk during the BEV transition |
| SUV | 60 | Mainstream mid-velocity |
| Volume | 45 | High turnover; lean target protects ROIC |

## 5. Decision rule

For each above-target pool, act **only when `netFirstYear > 0`** — i.e. the annual
carrying cost avoided exceeds the one-time clearance loss. Recaptured capital is then
redeployed against `Stockout Risk` pools first (relieving lost-sale demand), with the
remainder funding strategic EV / growth priorities. This resolves the
redirect-vs-liquidate distinction: transfer where a constrained pool can absorb units,
clear only where none can.

## 6. Scenario parameters (defaults & ranges)

| Parameter | Default | Range | Source logic |
|---|---|---|---|
| `carryingRate` | 18%/yr | 8–28% | Floorplan interest (~8%) + depreciation (~7%) + storage/insurance (~3%) |
| `liquidationDiscount` | 6% | 2–15% | Wholesale/auction haircut to clear excess units |
| `demandShift` | 0% | −20% to +20% | Demand stress test |

## 7. Baseline results (default assumptions)

| Metric | Value |
|---|---|
| Capital deployed | $2.87B |
| Capital above target | $412M (14% of deployed) |
| Annualized carrying cost on excess | $74M/yr |
| Capital recaptured (net of discount) | $387M |
| One-time clearance loss | $25M |
| First-year net benefit | $49M |
| Stockout-risk funding gap | $216M (fully covered by recaptured capital) |
| Portfolio DSI (volume-weighted) | 50 days |

## 8. Sensitivity (illustrative)

- **Carrying rate is the swing factor.** At 8% the annual bleed falls to ~$33M and several
  pools no longer clear the net-benefit hurdle; at 28% it rises past ~$115M and clearance is
  obviously worth it. This is why the rate assumption must be owned by Finance, not assumed.
- **Clearance discount** mostly affects *how much* is recaptured, not *whether* to act,
  until it approaches the carrying rate.
- **Demand shift** moves pools across thresholds — a −10% shock pushes additional volume/SUV
  pools above target; +10% relieves them. The status logic recomputes live.

## 9. Known limitations (and the honest next steps)

- **No regional granularity.** A real reallocation engine needs per-region inventory and demand
  to choose transfer-vs-clear; this models the portfolio level. *Next step: a region × model matrix.*
- **Contribution margin not modeled**, so redeployment upside is stated as the funded demand gap,
  not an incremental-profit figure. *Next step: per-segment margin to value recaptured capital.*
- **Steady-state demand** — no seasonality, model-year transitions, or incentive elasticity.
- **Single-period view** — `netFirstYear` mixes a recurring annual saving with a one-time loss;
  a full NPV would discount multi-year carrying savings. *Next step: multi-period NPV.*
- Figures are illustrative and not Hyundai actuals.

## 10. Retail & DMS layer

The retail view drills the portfolio thesis down to the dealer P&L, where above-target
capital becomes **aged inventory carrying floorplan interest**.

**Data lineage.** The Dealer Management System (CDK, Reynolds & Reynolds, Tekion, etc.) is
the system of record. VIN-level in-stock dates, F&I and sales transactions, and RDR (retail
delivery reporting) to the OEM are the source for days-on-lot, floorplan balance, and turn.
DMS vendors are named for context only — no affiliation or endorsement.

**Inputs (per dealer):** `avgUnitCost`, `monthlySales`, and an aging vector
(`0–30 / 31–60 / 61–90 / 90+` day buckets, in units).

```
onLot            = Σ aging buckets
agedUnits        = units 61–90 + units 90+              # > 60 days
criticalUnits    = units 90+                            # floorplan-curtailment territory
agedShare        = agedUnits / onLot
daysSupply       = onLot / (monthlySales / 30)
turn (annual)    = monthlySales × 12 / onLot
floorplanMonth   = onLot × avgUnitCost × (floorplanAPR / 12)
agedFloorplanMo  = agedUnits × avgUnitCost × (floorplanAPR / 12)   # recoverable waste
```

**Floorplan APR:** 9.5% (constant). At 90+ days most floorplan lenders require principal
curtailment, so 90+ is treated as the critical bucket.

**Retail lever rule (heuristic):**

- `agedShare > 25%` → **Targeted incentive** if turn > 9x (the store can retail its way out),
  else **Dealer trade + incentive** (move units to a higher-velocity rooftop).
- `agedShare 15–25%` → **Promote pre-90d** (act before curtailment).
- otherwise → **Hold**.

**Baseline network result (illustrative, 5 rooftops):** 540 units on lot, 31% aged > 60 days,
$17.8M floorplan balance costing ~$141K/mo, of which ~$48K/mo is burned on aged units. The
EV-heavy and luxury rooftops carry ~43% aged inventory — the same IONIQ 5 / Genesis pressure
from the OEM layer, now visible as floorplan cost.

**Retail-layer limitations / next steps:** front + back-end gross erosion by age bucket is not
yet modeled (would quantify the *margin* cost of aging, not just floorplan); dealer-trade
logistics cost is assumed negligible; and a live DMS integration (vs. illustrative aging
vectors) is the obvious productionization step.
