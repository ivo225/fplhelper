#!/usr/bin/env node

/**
 * This script creates the missing tables in Supabase.
 * It can be run from the command line with:
 * node scripts/create-missing-tables.js
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

async function createEventsTable() {
  const { error } = await supabase.rpc('create_events_table', {
    sql_query: `
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
    `
  });
  
  if (error) {
    console.error('Error creating events table:', error);
    return false;
  }
  
  return true;
}

async function createDummyEvent() {
  const { error } = await supabase
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
  
  if (error) {
    console.error('Error creating dummy event:', error);
    return false;
  }
  
  return true;
}

async function main() {
  console.log('Checking for missing tables...');
  
  try {
    // Check if events table exists
    const eventsExists = await checkTable('events');
    
    if (!eventsExists) {
      console.log('Creating events table...');
      
      // Try direct SQL approach
      try {
        const { data, error } = await supabase.rpc('exec', { 
          query: `
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
          `
        });
        
        if (error) {
          console.error('Error with exec RPC:', error);
          console.log('Trying alternative approach...');
          
          // If direct SQL fails, try using the REST API
          const { error: restError } = await supabase
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
          
          if (restError) {
            if (restError.code === '42P01') { // relation does not exist
              console.error('Cannot create table via REST API. Please create the table manually in the Supabase dashboard.');
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
            } else {
              console.error('Error creating events table via REST API:', restError);
            }
          } else {
            console.log('Events table created successfully via REST API!');
          }
        } else {
          console.log('Events table created successfully via SQL!');
          
          // Create a dummy event
          console.log('Creating a dummy event...');
          const success = await createDummyEvent();
          
          if (success) {
            console.log('Dummy event created successfully!');
          }
        }
      } catch (execError) {
        console.error('Error executing SQL:', execError);
        console.log('Please create the events table manually in the Supabase dashboard.');
      }
    } else {
      console.log('Events table already exists.');
    }
    
    // Check if the events table exists now
    const eventsExistsNow = await checkTable('events');
    
    if (eventsExistsNow) {
      console.log('All required tables exist!');
    } else {
      console.log('Events table still does not exist. Please create it manually in the Supabase dashboard.');
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main(); 