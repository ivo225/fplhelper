# FPL Analytics

A Fantasy Premier League (FPL) data analytics website built with Next.js and Tailwind CSS. This application provides data-driven insights for FPL managers to make better decisions.

## Features

- **Dashboard**: View top players, fixture difficulty, price changes, injury alerts, and differential picks
- **Player Stats**: Detailed player statistics and performance metrics
- **Team Insights**: Team form, upcoming fixtures, and win probabilities
- **Fixtures & Schedule**: Upcoming matches and fixture difficulty rankings
- **AI Recommendations**: Best captain choices, differentials, and transfer suggestions
- **Live Updates**: Live match data and real-time FPL points tracking
- **Community & Leaderboards**: Mini-league rankings and discussions

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework with App Router
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/app/` - Contains the main application code using the App Router
- `src/components/` - Reusable React components
  - `layout/` - Layout components like Navbar and MainLayout
  - `ui/` - UI components like Button, Card, and SearchBar
  - `dashboard/` - Dashboard-specific components
  - `player/` - Player stats components
  - `team/` - Team insights components
  - `fixtures/` - Fixtures and schedule components
  - `ai/` - AI recommendation components
  - `live/` - Live updates components
  - `community/` - Community and leaderboard components
- `public/` - Static assets
- `src/app/globals.css` - Global styles using Tailwind CSS
- `scripts/` - Utility scripts for data management
  - `data/` - Scripts for syncing and generating FPL data
  - `utils/` - Utility scripts for data validation and maintenance

## Data Management Scripts

The application includes several scripts to manage FPL data:

### Main Update Script

```bash
# Update all FPL data (sync data, generate and validate captain recommendations)
./scripts/update-fpl-data.js
```

### Individual Scripts

```bash
# Sync FPL data from the official API
node scripts/data/sync-fpl-data.js

# Generate captain recommendations
node scripts/data/generate-captain-recommendations.js

# Validate captain recommendations
node scripts/utils/validate-captain-recommendations.js
```

## Learn More

To learn more about Next.js, check out the [Next.js Documentation](https://nextjs.org/docs).
