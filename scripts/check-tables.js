#!/usr/bin/env node

/**
 * This script checks if the necessary tables exist in Supabase.
 * It can be run from the command line with:
 * node scripts/check-tables.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable(tableName) {
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

async function main() {
  console.log('Checking Supabase tables...');
  
  try {
    // Check for required tables
    const requiredTables = [
      'players',
      'teams',
      'fixtures',
      'events',
      'captain_recommendations',
      'transfer_recommendations',
      'differential_recommendations'
    ];
    
    const tableStatus = {};
    
    for (const table of requiredTables) {
      const exists = await checkTable(table);
      tableStatus[table] = exists;
      console.log(`- ${table}: ${exists ? 'Exists' : 'Missing'}`);
    }
    
    const missingTables = requiredTables.filter(table => !tableStatus[table]);
    
    if (missingTables.length > 0) {
      console.log('\nMissing tables:');
      missingTables.forEach(table => console.log(`- ${table}`));
      
      console.log('\nYou need to create these tables in Supabase. Here are the SQL queries:');
      
      if (missingTables.includes('players')) {
        console.log(`
CREATE TABLE players (
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
);`);
      }
      
      if (missingTables.includes('teams')) {
        console.log(`
CREATE TABLE teams (
  id INTEGER PRIMARY KEY,
  name TEXT,
  short_name TEXT,
  strength INTEGER,
  strength_attack_home INTEGER,
  strength_attack_away INTEGER,
  strength_defence_home INTEGER,
  strength_defence_away INTEGER,
  updated_at TIMESTAMP DEFAULT NOW()
);`);
      }
      
      if (missingTables.includes('fixtures')) {
        console.log(`
CREATE TABLE fixtures (
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
);`);
      }
      
      if (missingTables.includes('events')) {
        console.log(`
CREATE TABLE events (
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
);`);
      }
      
      if (missingTables.includes('captain_recommendations')) {
        console.log(`
CREATE TABLE captain_recommendations (
  id SERIAL PRIMARY KEY,
  gameweek INTEGER,
  player_id INTEGER,
  rank INTEGER,
  points_prediction FLOAT,
  confidence_score FLOAT,
  reasoning TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);`);
      }
      
      if (missingTables.includes('transfer_recommendations')) {
        console.log(`
CREATE TABLE transfer_recommendations (
  id SERIAL PRIMARY KEY,
  gameweek INTEGER,
  player_id INTEGER,
  type TEXT,
  reasoning TEXT,
  expected_points FLOAT,
  confidence_score FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);`);
      }
      
      if (missingTables.includes('differential_recommendations')) {
        console.log(`
CREATE TABLE differential_recommendations (
  id SERIAL PRIMARY KEY,
  gameweek INTEGER,
  player_id INTEGER,
  rank INTEGER,
  predicted_points FLOAT,
  reasoning TEXT,
  confidence_score FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);`);
      }
    } else {
      console.log('\nAll required tables exist!');
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main(); 