#!/usr/bin/env node

/**
 * This script creates custom RPC functions in Supabase.
 * It can be run from the command line with:
 * node scripts/create-rpc-functions.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createGetTableColumnsFunction() {
  console.log('Creating get_table_columns function...');
  
  try {
    // SQL for the function
    const sql = `
      CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
      RETURNS TABLE (
        column_name text,
        data_type text
      )
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          columns.column_name::text,
          columns.data_type::text
        FROM 
          information_schema.columns
        WHERE 
          columns.table_name = table_name
          AND columns.table_schema = 'public';
      END;
      $$;
    `;
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      // If the exec_sql function doesn't exist, create it first
      if (error.message.includes('function exec_sql') && error.message.includes('does not exist')) {
        console.log('Creating exec_sql function first...');
        
        const createExecSql = `
          CREATE OR REPLACE FUNCTION exec_sql(sql text)
          RETURNS void
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            EXECUTE sql;
          END;
          $$;
        `;
        
        // Execute raw SQL to create the exec_sql function
        const { error: execSqlError } = await supabase.rpc('exec_sql', { sql: createExecSql });
        
        if (execSqlError) {
          console.error('Error creating exec_sql function:', execSqlError);
          
          // Try direct SQL execution if available
          console.log('Attempting direct SQL execution...');
          
          // Note: This is a simplified approach. In a production environment,
          // you would use a more secure method to execute SQL, such as migrations
          // or the Supabase CLI.
          
          console.error('Please create the functions manually using the Supabase dashboard or CLI.');
          console.log('SQL for get_table_columns function:');
          console.log(sql);
          return false;
        }
        
        // Try creating the get_table_columns function again
        const { error: retryError } = await supabase.rpc('exec_sql', { sql });
        
        if (retryError) {
          console.error('Error creating get_table_columns function on retry:', retryError);
          return false;
        }
      } else {
        console.error('Error creating get_table_columns function:', error);
        return false;
      }
    }
    
    console.log('get_table_columns function created successfully!');
    return true;
  } catch (error) {
    console.error('Error creating get_table_columns function:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Starting RPC function creation...');
  
  try {
    // Create functions
    await createGetTableColumnsFunction();
    
    console.log('RPC function creation completed successfully!');
  } catch (error) {
    console.error('Error during RPC function creation:', error);
    process.exit(1);
  }
}

main(); 