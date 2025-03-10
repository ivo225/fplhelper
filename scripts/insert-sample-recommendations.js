#!/usr/bin/env node

/**
 * This script inserts sample transfer recommendations data into the Supabase database.
 * It can be run from the command line with:
 * node scripts/insert-sample-recommendations.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

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
    
    // If no data, try to insert a dummy row to see what columns are accepted
    const dummyRow = {
      gameweek: 0,
      element_id: 0,
      type: 'dummy',
      reasoning: 'Testing columns',
      confidence_score: 0.1,
      created_at: new Date().toISOString()
    };
    
    const { error: insertError } = await supabase
      .from(tableName)
      .insert([dummyRow]);
    
    if (insertError) {
      console.error(`Error inserting dummy row to ${tableName}:`, insertError);
      
      // Try with player_id instead of element_id
      const dummyRow2 = {
        gameweek: 0,
        player_id: 0,
        type: 'dummy',
        reasoning: 'Testing columns',
        confidence_score: 0.1,
        created_at: new Date().toISOString()
      };
      
      const { error: insertError2 } = await supabase
        .from(tableName)
        .insert([dummyRow2]);
      
      if (insertError2) {
        console.error(`Error inserting dummy row with player_id to ${tableName}:`, insertError2);
        return [];
      }
      
      // Clean up the dummy row
      await supabase
        .from(tableName)
        .delete()
        .eq('gameweek', 0)
        .eq('type', 'dummy');
      
      return Object.keys(dummyRow2);
    }
    
    // Clean up the dummy row
    await supabase
      .from(tableName)
      .delete()
      .eq('gameweek', 0)
      .eq('type', 'dummy');
    
    return Object.keys(dummyRow);
  } catch (error) {
    console.error(`Error getting columns for ${tableName}:`, error);
    return [];
  }
}

// Create transfer_recommendations table if it doesn't exist
async function createTransferRecommendationsTable() {
  const exists = await tableExists('transfer_recommendations');
  
  if (exists) {
    console.log('Transfer recommendations table already exists.');
    
    // Check if the table has the correct columns
    const columns = await getTableColumns('transfer_recommendations');
    console.log('Existing columns:', columns);
    
    // Check if player_id column exists
    if (!columns.includes('player_id')) {
      console.log('player_id column does not exist.');
      
      // Check if element_id column exists
      if (columns.includes('element_id')) {
        console.log('element_id column exists. Will use element_id for player IDs.');
        return { exists: true, playerIdColumn: 'element_id' };
      }
      
      // Try to add player_id column
      console.log('Attempting to add player_id column...');
      
      try {
        const addColumnSQL = `
          ALTER TABLE public.transfer_recommendations
          ADD COLUMN player_id INTEGER;
        `;
        
        // Try to execute the SQL
        const { error } = await supabase.rpc('exec_sql', { sql: addColumnSQL });
        
        if (error) {
          console.error('Error adding player_id column:', error);
          console.log('Please add the column manually using the Supabase dashboard or CLI.');
          console.log('SQL for adding player_id column:');
          console.log(addColumnSQL);
          return { exists: true, playerIdColumn: null };
        }
        
        console.log('player_id column added successfully!');
        return { exists: true, playerIdColumn: 'player_id' };
      } catch (error) {
        console.error('Error adding player_id column:', error);
        return { exists: true, playerIdColumn: null };
      }
    }
    
    return { exists: true, playerIdColumn: 'player_id' };
  }
  
  console.log('Creating transfer recommendations table...');
  
  try {
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
    
    // Execute the SQL directly if possible
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (error) {
      console.error('Error creating transfer_recommendations table:', error);
      console.log('Please create the table manually using the Supabase dashboard or CLI.');
      console.log('SQL for creating transfer_recommendations table:');
      console.log(createTableSQL);
      return { exists: false, playerIdColumn: null };
    }
    
    console.log('Transfer recommendations table created successfully!');
    return { exists: true, playerIdColumn: 'player_id' };
  } catch (error) {
    console.error('Error creating transfer_recommendations table:', error);
    return { exists: false, playerIdColumn: null };
  }
}

// Get current gameweek
async function getCurrentGameweek() {
  const { data, error } = await supabase
    .from('events')
    .select('id')
    .eq('is_current', true)
    .single();

  if (error) throw error;
  return data.id;
}

// Get top players for sample recommendations
async function getTopPlayers() {
  const { data, error } = await supabase
    .from('players')
    .select(`
      id,
      first_name,
      second_name,
      total_points,
      form
    `)
    .order('total_points', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data;
}

// Insert sample transfer recommendations
async function insertSampleRecommendations(playerIdColumn) {
  try {
    if (!playerIdColumn) {
      console.error('Cannot insert recommendations without a valid player ID column');
      return false;
    }
    
    const currentGameweek = await getCurrentGameweek();
    const topPlayers = await getTopPlayers();
    
    if (topPlayers.length === 0) {
      console.error('No players found to create recommendations');
      return false;
    }
    
    console.log(`Inserting sample recommendations for gameweek ${currentGameweek} using ${playerIdColumn} column...`);
    
    // Create buy recommendations for top 10 players
    const buyRecommendations = topPlayers.slice(0, 10).map((player, index) => ({
      gameweek: currentGameweek,
      player_id: player.id,
      type: 'buy',
      reasoning: `${player.first_name} ${player.second_name} has been in excellent form, scoring ${player.total_points} points so far. With a form rating of ${player.form}, they are likely to continue performing well.`,
      confidence_score: (100 - index * 5) / 100, // Decreasing confidence score
      created_at: new Date().toISOString()
    }));
    
    // Create sell recommendations for players ranked 11-20
    const sellRecommendations = topPlayers.slice(10, 20).map((player, index) => ({
      gameweek: currentGameweek,
      player_id: player.id,
      type: 'sell',
      reasoning: `Despite ${player.first_name} ${player.second_name}'s previous performances, their form has dropped recently. Consider transferring them out for a more in-form player.`,
      confidence_score: (95 - index * 5) / 100,
      created_at: new Date().toISOString()
    }));
    
    // Combine recommendations
    const allRecommendations = [...buyRecommendations, ...sellRecommendations];
    
    // Clear existing recommendations for the current gameweek
    const { error: deleteError } = await supabase
      .from('transfer_recommendations')
      .delete()
      .eq('gameweek', currentGameweek);
    
    if (deleteError) {
      console.warn('Error clearing existing recommendations:', deleteError);
    } else {
      console.log('Cleared existing recommendations for the current gameweek');
    }
    
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

// Main function
async function main() {
  console.log('Starting sample data insertion...');
  
  try {
    // Create table if it doesn't exist and get the player ID column name
    const { exists, playerIdColumn } = await createTransferRecommendationsTable();
    
    if (!exists) {
      console.log('Skipping sample data insertion due to table creation issues');
      return;
    }
    
    // Insert sample data
    await insertSampleRecommendations(playerIdColumn);
    
    console.log('Sample data insertion completed!');
  } catch (error) {
    console.error('Error during sample data insertion:', error);
    process.exit(1);
  }
}

main(); 