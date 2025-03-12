# Data Management Scripts

This directory contains scripts for data management, synchronization, and generation.

## Scripts

- `migrate-fpl-data.js` - Migrates data from the FPL API to the database
- `sync-fpl-data.js` - Synchronizes the database with the latest FPL API data
- `update-gameweek-flags.js` - Updates the current, next, and previous gameweek flags
- `generate-captain-recommendations.js` - Generates captain recommendations
- `generate-differential-recommendations.js` - Generates differential player recommendations
- `generate-recommendations.js` - General recommendations generator
- `clear-old-captain-recommendations.js` - Clears outdated captain recommendations

## Usage

Run these scripts from the project root directory:

```bash
node scripts/data/migrate-fpl-data.js
```

Make sure your `.env.local` file is properly configured with Supabase credentials before running these scripts. 