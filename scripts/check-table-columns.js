#!/usr/bin/env node

/**
 * This script checks the columns of the tables in Supabase.
 * It can be run from the command line with:
 * node scripts/check-table-columns.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableColumns(tableName) {
  try {
    // Try to get a single row to see the structure
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.error(`Error fetching from ${tableName}:`, error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log(`No data in ${tableName}`);
      
      // Try to get the columns from the table definition
      const { data: columns, error: columnsError } = await supabase.rpc('get_table_columns', {
        table_name: tableName
      });
      
      if (columnsError) {
        console.error(`Error fetching columns for ${tableName}:`, columnsError);
        return null;
      }
      
      return columns;
    }
    
    // Return the keys of the first row
    return Object.keys(data[0]);
  } catch (error) {
    console.error(`Error checking columns for ${tableName}:`, error);
    return null;
  }
}

async function main() {
  console.log('Checking table columns in Supabase...');
  
  try {
    const tables = [
      'players',
      'teams',
      'fixtures',
      'captain_recommendations',
      'transfer_recommendations',
      'differential_recommendations'
    ];
    
    for (const table of tables) {
      const columns = await checkTableColumns(table);
      
      if (columns) {
        console.log(`\nColumns in ${table}:`);
        console.log(columns);
      } else {
        console.log(`\nCould not get columns for ${table}`);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main(); 