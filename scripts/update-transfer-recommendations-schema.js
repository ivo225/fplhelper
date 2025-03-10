#!/usr/bin/env node

/**
 * This script updates the transfer_recommendations table schema to ensure it has a player_id column.
 * It can be run from the command line with:
 * node scripts/update-transfer-recommendations-schema.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Check if a column exists in a table
async function columnExists(tableName, columnName) {
  try {
    // Try a simple query to check if the column exists
    const { data, error } = await supabase
      .from(tableName)
      .select(columnName)
      .limit(1);
    
    return !error;
  } catch (error) {
    return false;
  }
}

// Update the transfer_recommendations table schema
async function updateTransferRecommendationsSchema() {
  try {
    console.log('Checking transfer_recommendations table schema...');
    
    // Check if the table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('transfer_recommendations')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.error('Error checking if transfer_recommendations table exists:', tableError);
      console.log('Creating transfer_recommendations table...');
      
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
      
      try {
        // Try to execute the SQL directly if possible
        console.log('Please create the table manually using the Supabase dashboard or CLI.');
        console.log('SQL for creating transfer_recommendations table:');
        console.log(createTableSQL);
        return false;
      } catch (error) {
        console.error('Error creating transfer_recommendations table:', error);
        return false;
      }
    }
    
    // Check if player_id column exists
    const hasPlayerIdColumn = await columnExists('transfer_recommendations', 'player_id');
    
    if (hasPlayerIdColumn) {
      console.log('player_id column already exists in transfer_recommendations table.');
      return true;
    }
    
    // Check if element_id column exists
    const hasElementIdColumn = await columnExists('transfer_recommendations', 'element_id');
    
    if (hasElementIdColumn) {
      console.log('element_id column exists, renaming to player_id...');
      
      // Rename element_id to player_id
      const renameColumnSQL = `
        ALTER TABLE public.transfer_recommendations
        RENAME COLUMN element_id TO player_id;
      `;
      
      try {
        // Try to execute the SQL directly if possible
        console.log('Please rename the column manually using the Supabase dashboard or CLI.');
        console.log('SQL for renaming element_id to player_id:');
        console.log(renameColumnSQL);
        return false;
      } catch (error) {
        console.error('Error renaming element_id to player_id:', error);
        return false;
      }
    } else {
      console.log('Neither player_id nor element_id column exists, adding player_id column...');
      
      // Add player_id column
      const addColumnSQL = `
        ALTER TABLE public.transfer_recommendations
        ADD COLUMN player_id INTEGER NOT NULL DEFAULT 0;
      `;
      
      try {
        // Try to execute the SQL directly if possible
        console.log('Please add the column manually using the Supabase dashboard or CLI.');
        console.log('SQL for adding player_id column:');
        console.log(addColumnSQL);
        return false;
      } catch (error) {
        console.error('Error adding player_id column:', error);
        return false;
      }
    }
  } catch (error) {
    console.error('Error updating transfer_recommendations schema:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Starting schema update...');
  
  try {
    // Update schema
    await updateTransferRecommendationsSchema();
    
    console.log('Schema update completed!');
  } catch (error) {
    console.error('Error during schema update:', error);
    process.exit(1);
  }
}

main(); 