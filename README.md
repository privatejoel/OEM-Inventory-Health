# OEM Inventory Health

**A decision-support model for automotive inventory strategy — from OEM portfolio down to the dealer lot. Answer-first brief, a live net-benefit engine, a governed rollout plan, and a DMS-sourced retail view.**

🔗 **Live:** https://privatejoel.github.io/OEM-Inventory-Health/
📄 **Methodology & assumptions:** [METHODOLOGY.md](./METHODOLOGY.md)

---

## The problem

A multi-billion-dollar national vehicle portfolio is, at any moment, simultaneously
*over-stocked in slow-turning segments* and *under-stocked in fast ones*. Judging every
segment against one inventory benchmark hides this — luxury and high-volume models have
fundamentally different velocity economics. The result is capital bleeding carrying cost in
one place while demand goes unserved in another.

## The approach

Measure each model's **Days Sales of Inventory (DSI)** against a **segment-specific target**,
separate stock that will **bleed off on its own** (just pause replenishment) from a genuine
**structural overhang**, then clear only that overhang *when the annual carrying cost avoided
exceeds the one-time clearance loss* — redeploying the recaptured capital to relieve
stockout-risk segments first. The point of the bleed-off step: never discount demand you
already have.

## Key results (illustrative baseline)

| Metric | Value |
|---|---|
| Capital deployed | **$2.80B** |
| Capital above segment target (gross) | **$603M** (22%) |
| Structural overhang (won't bleed off) | **$320M** (11%) |
| Annualized carrying cost on overhang | **$58M/yr** |
| Capital recaptured | **$301M** |
| Net benefit | **$38M** |
| Demand-constrained gap funded | **$216M**, fully covered |

Most above-target stock isn't cleared — it *bleeds off* once replenishment pauses; only the **$320M
structural overhang** (EV-glut + slow-luxury) is liquidated. The recaptured capital more than covers
the volume shortfall, with **~$85M** left for strategic priorities. Full derivation in
[METHODOLOGY.md](./METHODOLOGY.md).

## How it's structured

The app is organized as four role-targeted views:

1. **Strategy Brief** — answer-first recommendation with quantified impact, then a
   Situation / Complication / Resolution case. *(Consulting framing.)*
2. **Decision Dashboard** — segment-targeted DSI table that separates a **structural overhang**
   from above-target stock that simply **bleeds off**, accurately-labeled KPIs, a ranked
   net-benefit recommendation engine, and **live scenario sliders** (carrying rate, clearance
   discount, bleed-off window, demand shift) so every figure can be stress-tested. *(Planning / analytics.)*
3. **Execution Plan** — phased rollout, RACI decision rights, governance KPIs, and a
   risk/mitigation register. *(Program management.)*
4. **Retail & DMS** — drills the OEM thesis down to the dealer P&L: DMS-sourced aging buckets,
   floorplan cost, inventory turn, and dealer-level retail levers (incentive / dealer trade /
   wholesale). Shows the OEM → dealer → DMS data flow. *(Retail execution.)*

## Why the metrics are defensible

This was deliberately built to survive a probing interview:

- **Scale matches the narrative** — national-aggregate units and OEM wholesale costs put the
  portfolio in the billions, not the low millions.
- **Metrics are labeled for what they are** — "Annualized Carrying Cost," "Capital Above Target,"
  and a volume-weighted "Portfolio DSI," not a count ratio mislabeled as a financial return.
- **The headline tradeoff is actually computed** — carrying cost avoided vs. clearance loss, per
  pool, with an explicit act/hold rule — not asserted in prose.
- **Above-target ≠ liquidate** — the model strips out inventory that sells through on its own and
  only clears the structural overhang, so it never recommends discounting demand you already have.
- **Targets are segment-specific**, consistent with the core thesis.
- **Assumptions are owned and sourced**, with sensitivity and limitations documented openly.

## Built with

React 18 · TypeScript (strict) · Tailwind CSS 3 · Vite 5 · lucide-react

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to /dist
npm run deploy   # publish /dist to GitHub Pages
```

## Limitations

Portfolio-level (no per-region matrix), steady-state demand, single-period net benefit, and
contribution margin not yet modeled. Each is called out with its next step in
[METHODOLOGY.md](./METHODOLOGY.md) §9.

## Disclaimer

For portfolio and educational purposes only. Not affiliated with, endorsed by, or representative
of Hyundai Motor Group or its subsidiaries. All data and scenarios are simulated to demonstrate
the analytical framework.

## Author

**Joel Johnson** — Automotive Strategy & Planning Portfolio
