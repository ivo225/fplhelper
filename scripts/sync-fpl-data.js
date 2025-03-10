#!/usr/bin/env node

/**
 * This script syncs FPL data to Supabase.
 * It can be run from the command line with:
 * node scripts/sync-fpl-data.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// FPL API endpoints
const FPL_API_BASE_URL = 'https://fantasy.premierleague.com/api';
const BOOTSTRAP_STATIC_URL = `${FPL_API_BASE_URL}/bootstrap-static/`;
const FIXTURES_URL = `${FPL_API_BASE_URL}/fixtures/`;

// Fetch data from the FPL API
async function fetchFplData(url) {
  try {
    console.log(`Fetching data from: ${url}`);
    
    // Use the built-in fetch API in Node.js 18+
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FPL-Analytics/1.0',
      },
      cache: 'no-store', // Disable caching to ensure fresh data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching FPL data:', error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    console.log('Starting FPL data sync...');
    
    // Fetch bootstrap-static data from FPL API
    const bootstrapData = await fetchFplData(BOOTSTRAP_STATIC_URL);
    
    // Fetch fixtures data
    const fixturesData = await fetchFplData(FIXTURES_URL);
    
    // Get current gameweek
    const currentGameweek = bootstrapData.events.find(event => event.is_current)?.id || 1;
    
    console.log(`Current gameweek: ${currentGameweek}`);
    
    // Update players table
    console.log('Updating players table...');
    for (const player of bootstrapData.elements) {
      await supabase
        .from('players')
        .upsert({
          id: player.id,
          code: player.code,
          first_name: player.first_name,
          second_name: player.second_name,
          web_name: player.web_name,
          team: player.team,
          position: player.element_type,
          now_cost: player.now_cost,
          selected_by_percent: player.selected_by_percent,
          form: player.form,
          points_per_game: player.points_per_game,
          total_points: player.total_points,
          minutes: player.minutes,
          goals_scored: player.goals_scored,
          assists: player.assists,
          clean_sheets: player.clean_sheets,
          goals_conceded: player.goals_conceded,
          own_goals: player.own_goals,
          penalties_saved: player.penalties_saved,
          penalties_missed: player.penalties_missed,
          yellow_cards: player.yellow_cards,
          red_cards: player.red_cards,
          saves: player.saves,
          bonus: player.bonus,
          bps: player.bps,
          influence: player.influence,
          creativity: player.creativity,
          threat: player.threat,
          ict_index: player.ict_index,
          updated_at: new Date().toISOString()
        });
    }
    console.log(`Updated ${bootstrapData.elements.length} players`);
    
    // Update teams table
    console.log('Updating teams table...');
    for (const team of bootstrapData.teams) {
      await supabase
        .from('teams')
        .upsert({
          id: team.id,
          name: team.name,
          short_name: team.short_name,
          strength: team.strength,
          strength_attack_home: team.strength_attack_home,
          strength_attack_away: team.strength_attack_away,
          strength_defence_home: team.strength_defence_home,
          strength_defence_away: team.strength_defence_away,
          updated_at: new Date().toISOString()
        });
    }
    console.log(`Updated ${bootstrapData.teams.length} teams`);
    
    // Update fixtures table
    console.log('Updating fixtures table...');
    for (const fixture of fixturesData) {
      await supabase
        .from('fixtures')
        .upsert({
          id: fixture.id,
          event: fixture.event,
          team_h: fixture.team_h,
          team_a: fixture.team_a,
          team_h_difficulty: fixture.team_h_difficulty,
          team_a_difficulty: fixture.team_a_difficulty,
          kickoff_time: fixture.kickoff_time,
          finished: fixture.finished,
          team_h_score: fixture.team_h_score,
          team_a_score: fixture.team_a_score,
          updated_at: new Date().toISOString()
        });
    }
    console.log(`Updated ${fixturesData.length} fixtures`);
    
    // Update events (gameweeks) table
    console.log('Updating events table...');
    for (const event of bootstrapData.events) {
      await supabase
        .from('events')
        .upsert({
          id: event.id,
          name: event.name,
          deadline_time: event.deadline_time,
          average_entry_score: event.average_entry_score,
          finished: event.finished,
          data_checked: event.data_checked,
          highest_scoring_entry: event.highest_scoring_entry,
          is_previous: event.is_previous,
          is_current: event.is_current,
          is_next: event.is_next,
          updated_at: new Date().toISOString()
        });
    }
    console.log(`Updated ${bootstrapData.events.length} events`);
    
    console.log('FPL data sync completed successfully!');
  } catch (error) {
    console.error('Error syncing FPL data:', error);
    process.exit(1);
  }
}

main(); 