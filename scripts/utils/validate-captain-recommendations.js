#!/usr/bin/env node

/**
 * This script validates captain recommendations by checking if the player IDs match the reasoning text.
 * It can be run from the command line with:
 * node scripts/utils/validate-captain-recommendations.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in environment variables.');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function validateCaptainRecommendations() {
  try {
    console.log('Validating captain recommendations...');
    
    // Get current gameweek
    let currentGameweek = 1;
    try {
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_current', true)
        .single();
      
      if (error) {
        console.warn('Error fetching current gameweek, using default:', error);
      } else if (events) {
        currentGameweek = events.id;
      }
    } catch (error) {
      console.warn('Error fetching current gameweek, using default:', error);
    }
    
    console.log(`Current gameweek: ${currentGameweek}`);
    
    // Get captain recommendations
    const { data: recommendations, error: recError } = await supabase
      .from('captain_recommendations')
      .select('*')
      .eq('gameweek', currentGameweek);
    
    if (recError) {
      console.error('Error fetching captain recommendations:', recError);
      return;
    }
    
    if (!recommendations || recommendations.length === 0) {
      console.log('No captain recommendations found for the current gameweek.');
      return;
    }
    
    console.log(`Found ${recommendations.length} captain recommendations.`);
    
    // Get all players
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('id, first_name, second_name, web_name');
    
    if (playersError) {
      console.error('Error fetching players:', playersError);
      return;
    }
    
    // Validate each recommendation
    const issues = [];
    
    for (const rec of recommendations) {
      const player = players.find(p => p.id === rec.player_id);
      
      if (!player) {
        issues.push({
          id: rec.id,
          issue: 'Player not found',
          player_id: rec.player_id,
          reasoning: rec.reasoning
        });
        continue;
      }
      
      const playerName = player.web_name || `${player.first_name} ${player.second_name}`;
      const playerLastName = player.second_name;
      
      // Check if player name appears in reasoning
      const nameInReasoning = rec.reasoning.includes(playerName) || 
                             rec.reasoning.includes(player.first_name) || 
                             rec.reasoning.includes(playerLastName);
      
      if (!nameInReasoning) {
        // Try to find which player the reasoning is actually about
        const possiblePlayer = players.find(p => {
          return rec.reasoning.includes(p.web_name) || 
                 rec.reasoning.includes(p.first_name) || 
                 rec.reasoning.includes(p.second_name);
        });
        
        issues.push({
          id: rec.id,
          issue: 'Player name not in reasoning',
          player_id: rec.player_id,
          player_name: playerName,
          reasoning: rec.reasoning,
          possible_player: possiblePlayer ? 
            `${possiblePlayer.id}: ${possiblePlayer.first_name} ${possiblePlayer.second_name}` : 
            'Unknown'
        });
      }
    }
    
    if (issues.length === 0) {
      console.log('All captain recommendations are valid!');
    } else {
      console.log(`Found ${issues.length} issues with captain recommendations:`);
      console.log(JSON.stringify(issues, null, 2));
      
      // Ask if user wants to fix the issues
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question('Do you want to fix these issues? (y/n) ', async (answer) => {
        if (answer.toLowerCase() === 'y') {
          await fixIssues(issues, players);
        }
        readline.close();
      });
    }
  } catch (error) {
    console.error('Error validating captain recommendations:', error);
  }
}

async function fixIssues(issues, players) {
  console.log('Fixing issues...');
  
  for (const issue of issues) {
    if (issue.possible_player && issue.possible_player !== 'Unknown') {
      const possiblePlayerId = parseInt(issue.possible_player.split(':')[0]);
      
      if (!isNaN(possiblePlayerId)) {
        console.log(`Updating recommendation ${issue.id} from player ${issue.player_id} to ${possiblePlayerId}`);
        
        const { error } = await supabase
          .from('captain_recommendations')
          .update({ player_id: possiblePlayerId })
          .eq('id', issue.id);
        
        if (error) {
          console.error(`Error updating recommendation ${issue.id}:`, error);
        } else {
          console.log(`Successfully updated recommendation ${issue.id}`);
        }
      }
    } else {
      console.log(`Could not automatically fix issue with recommendation ${issue.id}`);
    }
  }
  
  console.log('Finished fixing issues.');
}

// Run the validation
validateCaptainRecommendations(); 