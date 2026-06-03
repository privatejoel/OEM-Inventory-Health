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

The central correction over a naive DSI model: **above-target stock is not automatically a
liquidation candidate.** Stock that will sell through within a patience window at current
demand should simply have its replenishment paused — it *bleeds off* at no clearance cost.
Only the residual still sitting after the window is a **structural overhang** worth a
clearance haircut. This is what stops the model from recommending you discount demand you
already have.

```
dailySales      = avgMonthlySales × (1 + demandShift) / 30
DSI             = stock / dailySales                       # days of inventory on hand
targetStock     = targetDSI[category] × dailySales
excessUnits     = max(0, stock − targetStock)              # gross above target
windowUnits     = dailySales × 30 × clearWindowMonths      # what sells within the patience window
bleedUnits      = min(excessUnits, windowUnits)            # clears organically — no action
overhangUnits   = max(0, excessUnits − bleedUnits)         # structural overhang — the actionable base
overhangCapital = overhangUnits × unitCost
monthsToClear   = excessUnits / (dailySales × 30)          # organic sell-through of the excess

carryOnOverhang = overhangCapital × carryingRate           # annual $ bled on the overhang
liquidationLoss = overhangCapital × liquidationDiscount    # one-time clearance haircut
recaptured      = overhangCapital × (1 − liquidationDiscount)
netBenefit      = carryOnOverhang − liquidationLoss
portfolioDSI    = Σ stock / Σ dailySales                   # volume-weighted, not a simple average
```

**Status rule (segment-specific, not one universal cutoff):**

- `Overhang` — `overhangUnits > 0` (above target *and* won't clear within the window → clearance candidate)
- `Bleeding Off` — above target but `overhangUnits = 0` (self-resolves once replenishment pauses → no clearance)
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

## 5. Decision rule (two steps)

1. **Pause, don't dump.** For every above-target pool, first stop replenishment and let it
   bleed off. Anything that clears within `clearWindowMonths` never warrants a clearance
   haircut — liquidating demand you already have is value-destructive.
2. **Clear the overhang on net benefit.** For the structural overhang that remains, act
   **only when `netBenefit > 0`** — the annual carrying cost avoided exceeds the one-time
   clearance loss. Because the overhang sits *beyond* the window by construction, annual
   carry is the right horizon to weigh against the one-time haircut.

Recaptured capital is then redeployed against `Stockout Risk` pools first (relieving
lost-sale demand), with the remainder funding strategic EV / growth priorities. This is why
the model clears the IONIQ 5 (soft demand → a months-long overhang) but *not* the Tucson
(above target, yet sells through in days). It also resolves the redirect-vs-liquidate
distinction: transfer where a constrained pool can absorb units, clear only where none can.

## 6. Scenario parameters (defaults & ranges)

| Parameter | Default | Range | Source logic |
|---|---|---|---|
| `carryingRate` | 18%/yr | 8–28% | Floorplan interest (~8%) + depreciation (~7%) + storage/insurance (~3%) |
| `liquidationDiscount` | 6% | 2–15% | Wholesale/auction haircut to clear excess units (see §12 for the channel ladder) |
| `clearWindowMonths` | 2 mo | 1–6 mo | Patience window: above-target stock that sells through within it bleeds off rather than being cleared |
| `demandShift` | 0% | −20% to +20% | Demand stress test |

## 7. Baseline results (default assumptions)

| Metric | Value |
|---|---|
| Capital deployed | $2.80B |
| Capital above target (gross) | $603M (22% of deployed) |
| Structural overhang (actionable) | $320M (11% of deployed) |
| Annualized carrying cost on overhang | $58M/yr |
| Capital recaptured (net of discount) | $301M |
| One-time clearance loss | $19M |
| Net benefit | $38M |
| Stockout-risk funding gap | $216M (fully covered by recaptured capital) |
| Portfolio DSI (volume-weighted) | 52 days |
| Overhang pools / bleeding-off pools | 3 / 1 |

Note the gap between **$603M above target** and the **$320M actually cleared**: ~$283M of
above-target stock bleeds off on its own once replenishment pauses, and is never liquidated.

## 8. Sensitivity (illustrative)

- **The bleed-off window decides how much is even actionable.** This is the parameter that
  encodes "don't liquidate demand you still have." At a 1-month window more above-target stock
  counts as overhang; widen it toward 6 months and most pools are judged self-resolving, so the
  overhang — and the recommended clearance — shrinks toward zero. At the 2-month default, $320M
  of the $603M above-target is overhang.
- **Carrying rate** scales the annual bleed on the overhang (≈$26M at 8%, ≈$90M at 28% on the
  baseline overhang) and, with the discount, sets whether clearing clears the net-benefit hurdle.
  It must be owned by Finance, not assumed.
- **Clearance discount** mostly affects *how much* is recaptured, not *whether* to act, until it
  approaches the carrying rate.
- **Demand shift** moves pools across thresholds and resizes the overhang — a −10% shock lengthens
  sell-through (more overhang); +10% lets more stock bleed off. The status logic recomputes live.

## 9. Known limitations (and the honest next steps)

- **No regional granularity.** A real reallocation engine needs per-region inventory and demand
  to choose transfer-vs-clear; this models the portfolio level. *Next step: a region × model matrix.*
- **Contribution margin not modeled**, so redeployment upside is stated as the funded demand gap,
  not an incremental-profit figure. *Next step: per-segment margin to value recaptured capital.*
- **Steady-state demand** — no seasonality, model-year transitions, or incentive elasticity.
- **Single-period view** — `netBenefit` weighs one year of carry on the overhang against a one-time
  loss. The bleed-off window removes the cruder "annual-vs-one-time always clears" bias, but a true
  model would integrate carry over each pool's expected hold path. *Next step: multi-period NPV.*
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

## 11. Whose capital is it — OEM vs. dealer floorplan

A deliberate simplification worth stating plainly: the OEM layer values the **entire** national
pipeline at OEM wholesale cost and frames clearing it as recovering OEM capital. In reality,
once a unit is wholesaled to a franchised dealer it sits on the **dealer's floorplan**, not the
OEM's balance sheet — which is exactly what the Retail & DMS layer (§10) measures. The two
layers describe the same metal from two balance sheets:

| Stage | Who owns it | Where the carry lands |
|---|---|---|
| In production / in-transit / port / unallocated | **OEM** | OEM working capital |
| Allocated & wholesaled to a dealer (on the lot) | **Dealer** | Dealer floorplan interest (Retail layer) |

The OEM's *direct* capital-at-risk is therefore the un-wholesaled slice plus its exposure to
incentives and residual support; the on-lot overhang is borne by dealers and influenced by the
OEM through **allocation and incentive policy**, not by repossessing units. Figures are stated on
a single OEM-wholesale-cost basis for clarity, with the dealer view reconciled in §10. *Next step:
split the pipeline into OEM-owned vs. dealer-floorplanned and carry each at its own rate.*

## 12. How the overhang actually clears (the "6%" unpacked)

`liquidationDiscount` is a single blended haircut; in practice clearance runs down a ladder of
channels, each with a different cost and side effect — there is no single anonymous buyer:

| Channel | Buyer | Typical haircut | Side effect |
|---|---|---|---|
| Retail incentive | Ordinary retail customer | ~2–8% (subvented APR/lease, cash) | Pulls demand forward; brand-equity drag on luxury |
| Fleet / commercial | Rental & commercial fleets | ~8–15% | Floods the used market later → **depresses residuals** |
| Dealer trade / wholesale | Other dealers | ~10–20% | Logistics cost; limited absorbing capacity |
| Auction / remarketing | Dealers & exporters | ~15–30% | Last resort for 90+ day units (see §10 curtailment) |

The default 6% corresponds to a **modest retail-incentive bump** — the cheapest rung. The model
does not yet price the residual-value contamination from the fleet/auction rungs, which would feed
back into a higher effective EV carrying rate. *Next step: a channel-mix input that blends the
haircut and routes the residual hit back into `carryingRate`.*
