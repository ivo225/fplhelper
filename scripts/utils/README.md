# Utility Scripts

This directory contains utility scripts for checking and verifying database state and application data.

## Scripts

- `check-current-gameweek.js` - Checks the current gameweek status
- `check-recommendations.js` - Verifies recommendation data
- `check-table-columns.js` - Lists columns for a specified table
- `check-tables.js` - Checks if all required tables exist
- `check-transfer-table-schema.js` - Verifies the transfer table schema

## Usage

Run these scripts from the project root directory:

```bash
node scripts/utils/check-tables.js
```

Make sure your `.env.local` file is properly configured with Supabase credentials before running these scripts. 