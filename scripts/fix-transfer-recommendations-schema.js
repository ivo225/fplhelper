#!/usr/bin/env node

/**
 * This script fixes the transfer_recommendations table schema by adding the player_id column
 * and inserting sample data.
 * 
 * Run with: node scripts/fix-transfer-recommendations-schema.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or service key is missing in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Check if a table exists
async function tableExists(tableName) {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('count')
      .limit(1);
    
    return !error;
  } catch (error) {
    return false;
  }
}

// Get table columns
async function getTableColumns(tableName) {
  try {
    // Try to get a row to see the column names
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.error(`Error fetching columns for ${tableName}:`, error);
      return [];
    }
    
    // If we have data, get the column names from the first row
    if (data && data.length > 0) {
      return Object.keys(data[0]);
    }
    
    return [];
  } catch (error) {
    console.error(`Error getting columns for ${tableName}:`, error);
    return [];
  }
}

// Try to execute SQL using RPC
async function tryExecSql(sql) {
  try {
    const { error } = await supabase.rpc('exec_sql', { sql });
    return !error;
  } catch (error) {
    console.error('Error executing SQL:', error);
    return false;
  }
}

// Create or recreate the transfer_recommendations table
async function recreateTransferRecommendationsTable() {
  try {
    const exists = await tableExists('transfer_recommendations');
    
    if (exists) {
      console.log('Dropping existing transfer_recommendations table...');
      
      // Drop the existing table
      const dropSuccess = await tryExecSql('DROP TABLE IF EXISTS public.transfer_recommendations;');
      if (!dropSuccess) {
        console.log('Error dropping table with RPC, will try direct API approach.');
      }
    }
    
    console.log('Creating transfer_recommendations table with correct schema...');
    
    // Create the table with the correct schema
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.transfer_recommendations (
        id SERIAL PRIMARY KEY,
        gameweek INTEGER NOT NULL,
        player_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        reasoning TEXT,
        confidence_score FLOAT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    // Try to execute the SQL
    const createSuccess = await tryExecSql(createTableSQL);
    
    if (!createSuccess) {
      console.error('Error creating table with RPC');
      console.log('Please run this SQL manually in the Supabase dashboard:');
      console.log(createTableSQL);
      return false;
    }
    
    console.log('Transfer recommendations table created successfully!');
    return true;
  } catch (error) {
    console.error('Error recreating transfer_recommendations table:', error);
    return false;
  }
}

// Get current gameweek
async function getCurrentGameweek() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('id')
      .eq('is_current', true)
      .single();
    
    if (error || !data) {
      console.warn('Error fetching current gameweek, using default:', error);
      return 1;
    }
    
    return data.id;
  } catch (error) {
    console.warn('Error fetching current gameweek, using default:', error);
    return 1;
  }
}

// Get top players for sample recommendations
async function getTopPlayers() {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('id, first_name, second_name, web_name, team, position, now_cost, form, total_points')
      .order('total_points', { ascending: false })
      .limit(20);
    
    if (error) {
      console.error('Error fetching players:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching players:', error);
    return [];
  }
}

// Insert sample transfer recommendations
async function insertSampleRecommendations() {
  try {
    const currentGameweek = await getCurrentGameweek();
    const topPlayers = await getTopPlayers();
    
    if (topPlayers.length === 0) {
      console.error('No players found to create recommendations');
      return false;
    }
    
    console.log(`Inserting sample recommendations for gameweek ${currentGameweek}...`);
    
    // Create buy recommendations for top 10 players
    const buyRecommendations = topPlayers.slice(0, 10).map((player, index) => ({
      gameweek: currentGameweek,
      player_id: player.id,
      type: 'buy',
      reasoning: `${player.first_name} ${player.second_name} is in excellent form and has been consistently scoring points. With a total of ${player.total_points} points so far, they represent great value at £${(player.now_cost / 10).toFixed(1)}m.`,
      confidence_score: 0.9 - (index * 0.05),
      created_at: new Date().toISOString()
    }));
    
    // Create sell recommendations for players ranked 11-20
    const sellRecommendations = topPlayers.slice(10, 20).map((player, index) => ({
      gameweek: currentGameweek,
      player_id: player.id,
      type: 'sell',
      reasoning: `Despite ${player.first_name} ${player.second_name}'s past performance, their form has been declining. Consider transferring them out for a player with better upcoming fixtures.`,
      confidence_score: 0.8 - (index * 0.05),
      created_at: new Date().toISOString()
    }));
    
    // Combine recommendations
    const allRecommendations = [...buyRecommendations, ...sellRecommendations];
    
    // Insert new recommendations
    const { error: insertError } = await supabase
      .from('transfer_recommendations')
      .insert(allRecommendations);
    
    if (insertError) {
      console.error('Error inserting sample recommendations:', insertError);
      return false;
    }
    
    console.log(`Successfully inserted ${allRecommendations.length} sample recommendations`);
    return true;
  } catch (error) {
    console.error('Error inserting sample recommendations:', error);
    return false;
  }
}

// Create exec_sql function if it doesn't exist
async function createExecSqlFunction() {
  try {
    console.log('Checking if exec_sql function exists...');
    
    // Try to call the function to see if it exists
    const { error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1;' });
    
    if (!error) {
      console.log('exec_sql function already exists.');
      return true;
    }
    
    console.log('Creating exec_sql function...');
    
    // We can't create the function through RPC since it doesn't exist yet
    // This is just for documentation purposes
    const createFunctionSQL = `
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
    
    console.log('Please create the exec_sql function manually in the Supabase dashboard:');
    console.log(createFunctionSQL);
    
    // Ask the user if they want to continue
    console.log('\nSince we cannot create the exec_sql function automatically,');
    console.log('we will attempt to create the table directly using the Supabase API.');
    
    return false;
  } catch (error) {
    console.error('Error checking/creating exec_sql function:', error);
    return false;
  }
}

// Try to delete all data from a table
async function tryDeleteAllData(tableName) {
  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .neq('id', 0);
    
    if (error) {
      console.error(`Error deleting data from ${tableName}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting data from ${tableName}:`, error);
    return false;
  }
}

// Try to insert a sample row
async function tryInsertSampleRow(tableName, sampleRow) {
  try {
    const { error } = await supabase
      .from(tableName)
      .insert([sampleRow]);
    
    if (error) {
      console.error(`Error inserting sample row into ${tableName}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error inserting sample row into ${tableName}:`, error);
    return false;
  }
}

// Try to delete a sample row
async function tryDeleteSampleRow(tableName, conditions) {
  try {
    let query = supabase
      .from(tableName)
      .delete();
    
    for (const [key, value] of Object.entries(conditions)) {
      query = query.eq(key, value);
    }
    
    const { error } = await query;
    
    if (error) {
      console.error(`Error deleting sample row from ${tableName}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting sample row from ${tableName}:`, error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Starting schema fix...');
  
  try {
    // Check if exec_sql function exists
    await createExecSqlFunction();
    
    // Recreate the transfer_recommendations table
    const tableCreated = await recreateTransferRecommendationsTable();
    
    if (!tableCreated) {
      console.log('Attempting to create the table directly using the Supabase API...');
      
      // Try to delete the existing table if it exists
      await tryDeleteAllData('transfer_recommendations');
      
      // Insert a sample row to create the table with the correct schema
      const sampleRow = {
        gameweek: 0,
        player_id: 0,
        type: 'sample',
        reasoning: 'Creating table schema',
        confidence_score: 0.1,
        created_at: new Date().toISOString()
      };
      
      const insertSuccess = await tryInsertSampleRow('transfer_recommendations', sampleRow);
      
      if (!insertSuccess) {
        console.error('Error creating table directly');
        console.log('Please fix the table schema manually in the Supabase dashboard.');
        return;
      }
      
      // Delete the sample row
      await tryDeleteSampleRow('transfer_recommendations', { gameweek: 0, type: 'sample' });
      
      console.log('Table created successfully using the Supabase API!');
    }
    
    // Insert sample data
    await insertSampleRecommendations();
    
    console.log('Schema fix completed!');
    console.log('\nYou should now be able to see transfer recommendations in the app.');
  } catch (error) {
    console.error('Error during schema fix:', error);
    process.exit(1);
  }
}

main(); 