# FPL Helper Scripts

This directory contains various scripts for managing the FPL Helper application. The scripts are organized into the following categories:

## Directory Structure

- **[migrations/](./migrations/)** - Database migration and schema management scripts
- **[data/](./data/)** - Data management, synchronization, and generation scripts
- **[utils/](./utils/)** - Utility scripts for checking and verifying database state
- **[setup/](./setup/)** - Initial setup and sample data insertion scripts
- **[triggers/](./triggers/)** - Scripts for triggering various processes and functions

## Environment Setup

Before running any scripts, make sure your `.env.local` file is properly configured with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

## Common Usage Patterns

### Initial Setup

For a fresh installation, run these scripts in order:

1. Create database tables:
   ```bash
   node scripts/migrations/create-tables.js
   ```

2. Migrate FPL data:
   ```bash
   node scripts/data/migrate-fpl-data.js
   ```

3. Create transfer recommendations table:
   ```bash
   node scripts/migrations/create-transfer-table.js
   ```

### Regular Updates

For regular updates, run:

```bash
node scripts/data/sync-fpl-data.js
node scripts/data/update-gameweek-flags.js
node scripts/triggers/trigger-recommendations.js
```

### Verification

To verify the database state:

```bash
node scripts/utils/check-tables.js
node scripts/utils/check-current-gameweek.js
```

## Contributing

When adding new scripts, please follow the established directory structure and naming conventions. Add documentation for your script in the appropriate README file. 