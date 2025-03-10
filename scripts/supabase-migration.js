#!/usr/bin/env node

/**
 * This script sets up all necessary tables in Supabase.
 * It can be run from the command line with:
 * node scripts/supabase-migration.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// SQL queries to create tables
const createPlayersTableSQL = `
CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY,
  code INTEGER,
  first_name TEXT,
  second_name TEXT,
  web_name TEXT,
  team INTEGER,
  position INTEGER,
  now_cost INTEGER,
  selected_by_percent FLOAT,
  form FLOAT,
  points_per_game FLOAT,
  total_points INTEGER,
  minutes INTEGER,
  goals_scored INTEGER,
  assists INTEGER,
  clean_sheets INTEGER,
  goals_conceded INTEGER,
  own_goals INTEGER,
  penalties_saved INTEGER,
  penalties_missed INTEGER,
  yellow_cards INTEGER,
  red_cards INTEGER,
  saves INTEGER,
  bonus INTEGER,
  bps INTEGER,
  influence FLOAT,
  creativity FLOAT,
  threat FLOAT,
  ict_index FLOAT,
  updated_at TIMESTAMP DEFAULT NOW()
);
`;

const createTeamsTableSQL = `
CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY,
  name TEXT,
  short_name TEXT,
  strength INTEGER,
  strength_attack_home INTEGER,
  strength_attack_away INTEGER,
  strength_defence_home INTEGER,
  strength_defence_away INTEGER,
  updated_at TIMESTAMP DEFAULT NOW()
);
`;

const createFixturesTableSQL = `
CREATE TABLE IF NOT EXISTS fixtures (
  id INTEGER PRIMARY KEY,
  event INTEGER,
  team_h INTEGER,
  team_a INTEGER,
  team_h_difficulty INTEGER,
  team_a_difficulty INTEGER,
  kickoff_time TIMESTAMP,
  finished BOOLEAN,
  team_h_score INTEGER,
  team_a_score INTEGER,
  updated_at TIMESTAMP DEFAULT NOW()
);
`;

const createEventsTableSQL = `
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY,
  name TEXT,
  deadline_time TIMESTAMP,
  average_entry_score INTEGER,
  finished BOOLEAN,
  data_checked BOOLEAN,
  highest_scoring_entry INTEGER,
  is_previous BOOLEAN,
  is_current BOOLEAN,
  is_next BOOLEAN,
  updated_at TIMESTAMP DEFAULT NOW()
);
`;

const createCaptainRecommendationsTableSQL = `
CREATE TABLE IF NOT EXISTS captain_recommendations (
  id SERIAL PRIMARY KEY,
  gameweek INTEGER,
  player_id INTEGER,
  rank INTEGER,
  points_prediction FLOAT,
  confidence_score FLOAT,
  reasoning TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
`;

const createTransferRecommendationsTableSQL = `
CREATE TABLE IF NOT EXISTS transfer_recommendations (
  id SERIAL PRIMARY KEY,
  gameweek INTEGER,
  player_id INTEGER,
  type TEXT,
  reasoning TEXT,
  confidence_score FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);
`;

const createDifferentialRecommendationsTableSQL = `
CREATE TABLE IF NOT EXISTS differential_recommendations (
  id SERIAL PRIMARY KEY,
  gameweek INTEGER,
  player_id INTEGER,
  rank INTEGER,
  predicted_points FLOAT,
  reasoning TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
`;

// Function to execute SQL query
async function executeSQL(sql, tableName) {
  try {
    // First check if the table exists
    const { data, error } = await supabase
      .from(tableName)
      .select('count')
      .limit(1);
    
    if (error && error.code === '42P01') { // relation does not exist
      console.log(`Table ${tableName} does not exist. Creating...`);
      
      // Use Supabase's SQL execution capability
      const { error: sqlError } = await supabase.rpc('exec_sql', { sql });
      
      if (sqlError) {
        console.error(`Error creating ${tableName} table:`, sqlError);
        return false;
      }
      
      console.log(`Table ${tableName} created successfully!`);
      return true;
    } else if (error) {
      console.error(`Error checking ${tableName} table:`, error);
      return false;
    } else {
      console.log(`Table ${tableName} already exists.`);
      return true;
    }
  } catch (error) {
    console.error(`Error executing SQL for ${tableName}:`, error);
    return false;
  }
}

// Create a dummy event for current gameweek
async function createDummyEvent() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_current', true)
      .single();
    
    if (error || !data) {
      console.log('No current gameweek found. Creating dummy event...');
      
      const { error: insertError } = await supabase
        .from('events')
        .insert([
          {
            id: 1,
            name: 'Gameweek 1',
            deadline_time: new Date().toISOString(),
            average_entry_score: 0,
            finished: false,
            data_checked: false,
            highest_scoring_entry: 0,
            is_previous: false,
            is_current: true,
            is_next: false
          }
        ]);
      
      if (insertError) {
        console.error('Error creating dummy event:', insertError);
        return false;
      }
      
      console.log('Dummy event created successfully!');
      return true;
    } else {
      console.log('Current gameweek already exists:', data);
      return true;
    }
  } catch (error) {
    console.error('Error creating dummy event:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Starting Supabase migration...');
  
  try {
    // Check if exec_sql function exists
    const { data: functions, error: functionsError } = await supabase.rpc('list_functions');
    
    if (functionsError) {
      console.error('Error checking functions:', functionsError);
      console.log('Creating exec_sql function...');
      
      // Create exec_sql function
      const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(sql text) RETURNS void AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      `;
      
      // Use direct SQL execution (this might not work depending on your Supabase permissions)
      const { error: createFunctionError } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
      
      if (createFunctionError) {
        console.error('Error creating exec_sql function:', createFunctionError);
        console.log('Please run the following SQL in the Supabase SQL editor:');
        console.log(createFunctionSQL);
        console.log('Then run this script again.');
        return;
      }
    }
    
    // Create tables
    await executeSQL(createPlayersTableSQL, 'players');
    await executeSQL(createTeamsTableSQL, 'teams');
    await executeSQL(createFixturesTableSQL, 'fixtures');
    await executeSQL(createEventsTableSQL, 'events');
    await executeSQL(createCaptainRecommendationsTableSQL, 'captain_recommendations');
    await executeSQL(createTransferRecommendationsTableSQL, 'transfer_recommendations');
    await executeSQL(createDifferentialRecommendationsTableSQL, 'differential_recommendations');
    
    // Create dummy event
    await createDummyEvent();
    
    console.log('Supabase migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

main(); 