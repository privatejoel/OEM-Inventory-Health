# OEM Inventory Health Dashboard

A strategic **Days Sales of Inventory (DSI)** optimization platform for automotive OEM supply chain management. This interactive dashboard enables executives to monitor global fleet health, identify capital-locked inventory, and execute real-time reallocation strategies across regional channels.

## Features

- 📊 **Real-Time DSI Monitoring** – Calculates Days Sales of Inventory metrics across vehicle segments
- 🎯 **Capital Leakage Detection** – Identifies at-risk inventory (DSI > 60 days) prone to depreciation
- 🔄 **Inventory Redirection Simulation** – Model 30% capital reallocation with 6% liquidation loss vs. 15% holding-cost savings
- 📈 **Multi-Segment Analytics** – Track Luxury, Volume, EV, and SUV categories simultaneously
- 💰 **Liquidity Tracking** – Real-time recaptured capital display for reinvestment decisions
- 📋 **Executive Case Study** – Comprehensive narrative on OEM inventory challenges and solutions

## Built With

- **React** 18.2 – UI framework
- **TypeScript** – Type-safe development
- **Tailwind CSS** 3.3 – Utility-first styling
- **Vite** 5.0 – Lightning-fast build tool
- **Lucide React** – Premium icon library

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app will open at `http://localhost:5173` with:
- **Case Study** tab – Educational narrative on inventory optimization frameworks
- **Live Dashboard** tab – Interactive inventory health simulator with Hyundai/Genesis product lineup

## Deployment

### GitHub Pages (Automatic)

This project is configured for automatic deployment to GitHub Pages. Every push to `main` branch triggers the deployment workflow.

**To set up:**

1. Ensure the repository is public or has GitHub Pages enabled
2. Go to **Settings** → **Pages** → set source to "Deploy from a branch" (gh-pages)
3. The site will be live at: `https://privatejoel.github.io/OEM-Inventory-Health/`

### Manual Deployment

```bash
# Deploy to GitHub Pages
npm run deploy
```

This runs the build and deploys the `dist` folder to the `gh-pages` branch.

## Use Case

**Scenario:** A global OEM (Hyundai Motor Group) manages a multi-billion-dollar vehicle pipeline across luxury (Genesis G80), volume (Venue, Elantra), and EV segments (IONIQ 5). High-DSI luxury models accumulate holding costs while volume segments suffer from stockouts. This dashboard provides the decision-support layer to:

1. **Detect** – Identify which regional channels have stagnant capital
2. **Model** – Simulate inventory redirection and capital recapture scenarios
3. **Execute** – Approve strategic liquidation with transparent ROI calculations

## Data Model

The dashboard tracks 6 vehicle models with realistic metrics:

| Model | Segment | Stock | Monthly Sales | Unit Cost | Category |
|-------|---------|-------|---|---|---|
| Genesis G80 | Luxury Sedan | 14 | 3.2 | $56,000 | Luxury |
| Hyundai Venue | Compact SUV | 58 | 62 | $19,800 | Volume |
| Hyundai IONIQ 5 | EV SUV | 32 | 38 | $45,000 | EV |
| Hyundai Santa Fe | Mid-size SUV | 24 | 28 | $36,000 | SUV |
| Hyundai Elantra | Sedan | 42 | 55 | $21,500 | Volume |
| Hyundai Palisade | Full-size SUV | 18 | 5.5 | $48,000 | Luxury |

## Disclaimer

This project is **for educational purposes only**. It is not affiliated with, endorsed by, or representative of Hyundai Motor Group or its subsidiaries. All data, scenarios, and optimization models are simulated to demonstrate product planning and analytical frameworks.

## Author

Joel Johnson – OEM Product Strategy Portfolio