#!/usr/bin/env node

/**
 * This script creates a new transfer_recommendations table with the correct schema.
 * 
 * Run with: node scripts/create-transfer-table.js
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

// Main function
async function main() {
  console.log('Starting transfer_recommendations table creation...');
  
  try {
    // Get current gameweek
    const currentGameweek = await getCurrentGameweek();
    console.log(`Current gameweek: ${currentGameweek}`);
    
    // Get top players
    const topPlayers = await getTopPlayers();
    
    if (topPlayers.length === 0) {
      console.error('No players found to create recommendations');
      return;
    }
    
    console.log(`Found ${topPlayers.length} players for sample recommendations`);
    
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
    
    // Try to insert the recommendations
    console.log('Inserting sample recommendations...');
    
    const { error: insertError } = await supabase
      .from('transfer_recommendations')
      .insert(allRecommendations);
    
    if (insertError) {
      console.error('Error inserting recommendations:', insertError);
      
      // If the error is about the player_id column not existing, we need to create the table
      if (insertError.message && insertError.message.includes('player_id')) {
        console.log('\nThe player_id column does not exist. You need to create the table with the correct schema.');
        console.log('Please run the following SQL in the Supabase dashboard:');
        console.log(`
CREATE TABLE IF NOT EXISTS public.transfer_recommendations (
  id SERIAL PRIMARY KEY,
  gameweek INTEGER NOT NULL,
  player_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  reasoning TEXT,
  confidence_score FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
        `);
      }
      
      return;
    }
    
    console.log(`Successfully inserted ${allRecommendations.length} sample recommendations`);
    console.log('\nYou should now be able to see transfer recommendations in the app.');
  } catch (error) {
    console.error('Error during table creation:', error);
    process.exit(1);
  }
}

main(); 