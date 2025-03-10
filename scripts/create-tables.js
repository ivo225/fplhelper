#!/usr/bin/env node

/**
 * This script creates the necessary tables in Supabase using the API directly.
 * It can be run from the command line with:
 * node scripts/create-tables.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
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

// Create a dummy event for current gameweek
async function createDummyEvent() {
  try {
    const eventsExists = await tableExists('events');
    
    if (!eventsExists) {
      console.log('Events table does not exist yet. Will create it later.');
      return false;
    }
    
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

// Create players table
async function createPlayersTable() {
  const exists = await tableExists('players');
  
  if (exists) {
    console.log('Players table already exists.');
    return true;
  }
  
  console.log('Creating players table...');
  
  try {
    // Create a minimal structure first
    const { error } = await supabase
      .from('players')
      .insert([
        {
          id: 0,
          code: 0,
          first_name: 'Placeholder',
          second_name: 'Player',
          web_name: 'Placeholder',
          team: 0,
          position: 0,
          now_cost: 0,
          selected_by_percent: 0,
          form: '0',
          points_per_game: '0',
          total_points: 0,
          minutes: 0,
          goals_scored: 0,
          assists: 0,
          clean_sheets: 0,
          goals_conceded: 0,
          own_goals: 0,
          penalties_saved: 0,
          penalties_missed: 0,
          yellow_cards: 0,
          red_cards: 0,
          saves: 0,
          bonus: 0,
          bps: 0,
          influence: '0',
          creativity: '0',
          threat: '0',
          ict_index: '0',
          updated_at: new Date().toISOString()
        }
      ]);
    
    if (error) {
      console.error('Error creating players table:', error);
      return false;
    }
    
    console.log('Players table created successfully!');
    
    // Delete the placeholder row
    await supabase
      .from('players')
      .delete()
      .eq('id', 0);
    
    return true;
  } catch (error) {
    console.error('Error creating players table:', error);
    return false;
  }
}

// Create teams table
async function createTeamsTable() {
  const exists = await tableExists('teams');
  
  if (exists) {
    console.log('Teams table already exists.');
    return true;
  }
  
  console.log('Creating teams table...');
  
  try {
    // Create a minimal structure first
    const { error } = await supabase
      .from('teams')
      .insert([
        {
          id: 0,
          name: 'Placeholder',
          short_name: 'PLC',
          strength: 0,
          strength_attack_home: 0,
          strength_attack_away: 0,
          strength_defence_home: 0,
          strength_defence_away: 0,
          updated_at: new Date().toISOString()
        }
      ]);
    
    if (error) {
      console.error('Error creating teams table:', error);
      return false;
    }
    
    console.log('Teams table created successfully!');
    
    // Delete the placeholder row
    await supabase
      .from('teams')
      .delete()
      .eq('id', 0);
    
    return true;
  } catch (error) {
    console.error('Error creating teams table:', error);
    return false;
  }
}

// Create fixtures table
async function createFixturesTable() {
  const exists = await tableExists('fixtures');
  
  if (exists) {
    console.log('Fixtures table already exists.');
    return true;
  }
  
  console.log('Creating fixtures table...');
  
  try {
    // Create a minimal structure first
    const { error } = await supabase
      .from('fixtures')
      .insert([
        {
          id: 0,
          event: 0,
          team_h: 0,
          team_a: 0,
          team_h_difficulty: 0,
          team_a_difficulty: 0,
          kickoff_time: new Date().toISOString(),
          finished: false,
          team_h_score: 0,
          team_a_score: 0,
          updated_at: new Date().toISOString()
        }
      ]);
    
    if (error) {
      console.error('Error creating fixtures table:', error);
      return false;
    }
    
    console.log('Fixtures table created successfully!');
    
    // Delete the placeholder row
    await supabase
      .from('fixtures')
      .delete()
      .eq('id', 0);
    
    return true;
  } catch (error) {
    console.error('Error creating fixtures table:', error);
    return false;
  }
}

// Create events table
async function createEventsTable() {
  const exists = await tableExists('events');
  
  if (exists) {
    console.log('Events table already exists.');
    return true;
  }
  
  console.log('Creating events table...');
  
  try {
    // Create a minimal structure first
    const { error } = await supabase
      .from('events')
      .insert([
        {
          id: 0,
          name: 'Placeholder',
          deadline_time: new Date().toISOString(),
          average_entry_score: 0,
          finished: false,
          data_checked: false,
          highest_scoring_entry: 0,
          is_previous: false,
          is_current: false,
          is_next: false,
          updated_at: new Date().toISOString()
        }
      ]);
    
    if (error) {
      console.error('Error creating events table:', error);
      return false;
    }
    
    console.log('Events table created successfully!');
    
    // Delete the placeholder row
    await supabase
      .from('events')
      .delete()
      .eq('id', 0);
    
    return true;
  } catch (error) {
    console.error('Error creating events table:', error);
    return false;
  }
}

// Create captain_recommendations table
async function createCaptainRecommendationsTable() {
  const exists = await tableExists('captain_recommendations');
  
  if (exists) {
    console.log('Captain recommendations table already exists.');
    return true;
  }
  
  console.log('Creating captain recommendations table...');
  
  try {
    // Create a minimal structure first
    const { error } = await supabase
      .from('captain_recommendations')
      .insert([
        {
          gameweek: 0,
          player_id: 0,
          rank: 0,
          points_prediction: 0,
          confidence_score: 0,
          reasoning: 'Placeholder',
          created_at: new Date().toISOString()
        }
      ]);
    
    if (error) {
      console.error('Error creating captain recommendations table:', error);
      return false;
    }
    
    console.log('Captain recommendations table created successfully!');
    
    // Delete the placeholder row
    await supabase
      .from('captain_recommendations')
      .delete()
      .eq('gameweek', 0);
    
    return true;
  } catch (error) {
    console.error('Error creating captain recommendations table:', error);
    return false;
  }
}

// Create transfer_recommendations table
async function createTransferRecommendationsTable() {
  const exists = await tableExists('transfer_recommendations');
  
  if (exists) {
    console.log('Transfer recommendations table already exists.');
    return true;
  }
  
  console.log('Creating transfer recommendations table...');
  
  try {
    // Create a minimal structure first
    const { error } = await supabase
      .from('transfer_recommendations')
      .insert([
        {
          gameweek: 0,
          player_id: 0,
          type: 'buy',
          reasoning: 'Placeholder',
          confidence_score: 0,
          created_at: new Date().toISOString()
        }
      ]);
    
    if (error) {
      console.error('Error creating transfer recommendations table:', error);
      return false;
    }
    
    console.log('Transfer recommendations table created successfully!');
    
    // Delete the placeholder row
    await supabase
      .from('transfer_recommendations')
      .delete()
      .eq('gameweek', 0);
    
    return true;
  } catch (error) {
    console.error('Error creating transfer recommendations table:', error);
    return false;
  }
}

// Create differential_recommendations table
async function createDifferentialRecommendationsTable() {
  const exists = await tableExists('differential_recommendations');
  
  if (exists) {
    console.log('Differential recommendations table already exists.');
    return true;
  }
  
  console.log('Creating differential recommendations table...');
  
  try {
    // Create a minimal structure first
    const { error } = await supabase
      .from('differential_recommendations')
      .insert([
        {
          gameweek: 0,
          player_id: 0,
          rank: 0,
          predicted_points: 0,
          reasoning: 'Placeholder',
          created_at: new Date().toISOString()
        }
      ]);
    
    if (error) {
      console.error('Error creating differential recommendations table:', error);
      return false;
    }
    
    console.log('Differential recommendations table created successfully!');
    
    // Delete the placeholder row
    await supabase
      .from('differential_recommendations')
      .delete()
      .eq('gameweek', 0);
    
    return true;
  } catch (error) {
    console.error('Error creating differential recommendations table:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Starting table creation...');
  
  try {
    // Create tables
    await createPlayersTable();
    await createTeamsTable();
    await createFixturesTable();
    await createEventsTable();
    await createCaptainRecommendationsTable();
    await createTransferRecommendationsTable();
    await createDifferentialRecommendationsTable();
    
    // Create dummy event
    await createDummyEvent();
    
    console.log('Table creation completed successfully!');
  } catch (error) {
    console.error('Error during table creation:', error);
    process.exit(1);
  }
}

main(); 