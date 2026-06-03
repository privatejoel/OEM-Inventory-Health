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
then apply a **net-benefit decision rule**: clear above-target inventory *only when the annual
carrying cost avoided exceeds the one-time clearance loss*, and redeploy the recaptured capital
to relieve stockout-risk segments first.

## Key results (illustrative baseline)

| Metric | Value |
|---|---|
| Capital deployed | **$2.87B** |
| Capital above segment target | **$412M** (14%) |
| Annualized carrying cost bled | **$74M/yr** |
| Capital recaptured | **$387M** |
| First-year net benefit | **$49M** |
| Demand-constrained gap funded | **$216M**, fully covered |

The recaptured capital more than covers the volume shortfall — the EV-glut and slow-luxury pools
fund the lean volume line, with ~$171M left for strategic priorities. Full derivation in
[METHODOLOGY.md](./METHODOLOGY.md).

## How it's structured

The app is organized as four role-targeted views:

1. **Strategy Brief** — answer-first recommendation with quantified impact, then a
   Situation / Complication / Resolution case. *(Consulting framing.)*
2. **Decision Dashboard** — segment-targeted DSI table, corrected and accurately-labeled KPIs,
   a ranked net-benefit recommendation engine, and **live scenario sliders** (carrying rate,
   clearance discount, demand shift) so every figure can be stress-tested. *(Planning / analytics.)*
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
