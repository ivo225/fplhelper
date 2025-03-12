const axios = require('axios');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials in environment variables.');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// FPL API endpoints
const FPL_API_BASE = 'https://fantasy.premierleague.com/api';
const BOOTSTRAP_ENDPOINT = `${FPL_API_BASE}/bootstrap-static/`;
const FIXTURES_ENDPOINT = `${FPL_API_BASE}/fixtures/`;

async function migrateData() {
  console.log('🚀 Starting FPL data migration...');
  
  try {
    // Step 1: Fetch bootstrap data
    console.log('\n📊 Fetching data from FPL API...');
    const bootstrapResponse = await axios.get(BOOTSTRAP_ENDPOINT);
    const { elements: players, teams, events: gameweeks, element_types: positions } = bootstrapResponse.data;
    
    // Find the current and next gameweek
    const currentGW = gameweeks.find(gw => gw.is_current);
    const nextGW = gameweeks.find(gw => gw.is_next);
    
    console.log(`✅ Data fetched successfully!`);
    console.log(`📅 Current Gameweek: ${currentGW ? currentGW.id : 'None'}`);
    console.log(`📅 Next Gameweek: ${nextGW ? nextGW.id : 'None'}`);
    
    // Step 2: Update gameweeks
    console.log('\n📅 Updating gameweeks...');
    const processedGameweeks = gameweeks.map(gw => ({
      id: gw.id,
      name: `Gameweek ${gw.id}`,
      deadline_time: gw.deadline_time,
      is_current: gw.is_current,
      is_next: gw.is_next,
      is_previous: gw.is_previous,
      finished: gw.finished,
      updated_at: new Date().toISOString()
    }));
    
    const { error: gwError } = await supabase
      .from('events')
      .upsert(processedGameweeks);
    
    if (gwError) {
      console.error('❌ Error updating gameweeks:', gwError);
    } else {
      console.log('✅ Gameweeks updated successfully');
    }
    
    // Step 3: Update teams
    console.log('\n⚽ Updating teams...');
    const processedTeams = teams.map(team => ({
      id: team.id,
      name: team.name,
      short_name: team.short_name,
      strength: team.strength,
      strength_attack_home: team.strength_attack_home,
      strength_attack_away: team.strength_attack_away,
      strength_defence_home: team.strength_defence_home,
      strength_defence_away: team.strength_defence_away,
      updated_at: new Date().toISOString()
    }));
    
    const { error: teamError } = await supabase
      .from('teams')
      .upsert(processedTeams);
    
    if (teamError) {
      console.error('❌ Error updating teams:', teamError);
    } else {
      console.log('✅ Teams updated successfully');
    }
    
    // Step 4: Skip positions update as it's not essential
    console.log('\n🏃 Skipping positions update (not essential for application)');
    
    // Step 5: Update players
    console.log(`\n👤 Updating ${players.length} players...`);
    // Process in batches to avoid request size limitations
    const BATCH_SIZE = 100;
    for (let i = 0; i < players.length; i += BATCH_SIZE) {
      const batch = players.slice(i, i + BATCH_SIZE).map(player => ({
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
      }));
      
      const { error: playerError } = await supabase
        .from('players')
        .upsert(batch, { onConflict: 'id' });
      
      if (playerError) {
        console.error(`❌ Error with player batch ${Math.floor(i / BATCH_SIZE) + 1}:`, playerError);
      } else {
        console.log(`✅ Updated player batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} players)`);
      }
      
      // Add small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Step 6: Update fixtures
    console.log('\n🏟️ Fetching and updating fixtures...');
    const fixturesResponse = await axios.get(FIXTURES_ENDPOINT);
    const fixtures = fixturesResponse.data;
    
    // Filter to focus on fixtures for the next gameweek if it exists
    let relevantFixtures = fixtures;
    if (nextGW) {
      relevantFixtures = fixtures.filter(fix => fix.event === nextGW.id);
      console.log(`📊 Found ${relevantFixtures.length} fixtures for next gameweek ${nextGW.id}`);
    }
    
    // Process all fixtures anyway to ensure completeness
    const FIXTURE_BATCH_SIZE = 100;
    for (let i = 0; i < fixtures.length; i += FIXTURE_BATCH_SIZE) {
      const batch = fixtures.slice(i, i + FIXTURE_BATCH_SIZE).map(fixture => ({
        id: fixture.id,
        event: fixture.event, // gameweek
        team_h: fixture.team_h,
        team_a: fixture.team_a,
        team_h_score: fixture.team_h_score,
        team_a_score: fixture.team_a_score,
        team_h_difficulty: fixture.team_h_difficulty,
        team_a_difficulty: fixture.team_a_difficulty,
        kickoff_time: fixture.kickoff_time,
        finished: fixture.finished,
        updated_at: new Date().toISOString()
      }));
      
      const { error: fixtureError } = await supabase
        .from('fixtures')
        .upsert(batch, { onConflict: 'id' });
      
      if (fixtureError) {
        console.error(`❌ Error with fixture batch ${Math.floor(i / FIXTURE_BATCH_SIZE) + 1}:`, fixtureError);
      } else {
        console.log(`✅ Updated fixture batch ${Math.floor(i / FIXTURE_BATCH_SIZE) + 1} (${batch.length} fixtures)`);
      }
      
      // Add small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Log the update
    try {
      await supabase
        .from('data_updates')
        .insert({
          update_type: 'fpl_data',
          gameweek: nextGW ? nextGW.id : currentGW ? currentGW.id : null,
          details: {
            players_count: players.length,
            teams_count: teams.length,
            fixtures_count: fixtures.length,
            current_gameweek: currentGW ? currentGW.id : null,
            next_gameweek: nextGW ? nextGW.id : null
          }
        });
    } catch (error) {
      console.log('Note: Could not log update to data_updates table. This is not critical.');
    }
    
    console.log('\n🎉 MIGRATION COMPLETE 🎉');
    console.log(`✅ Data has been updated successfully for ${nextGW ? `next gameweek ${nextGW.id}` : 'the latest gameweek'}`);
    console.log(`⏰ Update completed at: ${new Date().toLocaleString()}`);
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

// Update gameweek status
async function updateGameweekStatus() {
  try {
    // Set all gameweeks to not current/next
    await supabase
      .from('events')
      .update({ is_current: false, is_next: false })
      .neq('id', 0);
    
    // Set gameweek 29 as next (or current if it's already started)
    await supabase
      .from('events')
      .update({ is_next: true })
      .eq('id', 29);
    
    // Set gameweek 28 as current (until gameweek 29 officially starts)
    await supabase
      .from('events')
      .update({ is_current: true })
      .eq('id', 28);
    
    console.log('Gameweek status updated successfully');
  } catch (error) {
    console.error('Error updating gameweek status:', error);
  }
}

// Run the migration
migrateData();
