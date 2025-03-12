# Setup Scripts

This directory contains scripts for initial setup and sample data insertion.

## Scripts

- `insert-sample-data.js` - Inserts sample data into the database for testing
- `insert-sample-recommendations.js` - Inserts sample recommendation data

## Usage

Run these scripts from the project root directory:

```bash
node scripts/setup/insert-sample-data.js
```

**Note**: These scripts are primarily for development and testing purposes. They should not be run in a production environment unless you specifically want to reset or populate the database with sample data.

Make sure your `.env.local` file is properly configured with Supabase credentials before running these scripts. 