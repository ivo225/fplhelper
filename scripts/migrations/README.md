# Database Migrations

This directory contains scripts for database migrations and schema management.

## Scripts

- `create-tables.js` - Creates all necessary tables in the database
- `create-transfer-table.js` - Creates the transfer recommendations table
- `create-missing-tables.js` - Checks for and creates any missing tables
- `create-rpc-functions.js` - Creates RPC functions in Supabase
- `fix-transfer-recommendations-schema.js` - Fixes issues with the transfer recommendations schema
- `update-transfer-recommendations-schema.js` - Updates the transfer recommendations schema
- `supabase-migration.js` - Comprehensive migration script for Supabase

## Usage

Run these scripts from the project root directory:

```bash
node scripts/migrations/create-tables.js
```

Make sure your `.env.local` file is properly configured with Supabase credentials before running these scripts. 