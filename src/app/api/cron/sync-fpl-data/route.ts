import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { fetchFplData } from '../../fpl/utils';

// This function will be called by a CRON job to sync FPL data to Supabase
export async function GET() {
  try {
    const supabase = getServiceSupabase();
    
    // Fetch bootstrap-static data from FPL API
    const bootstrapData = await fetchFplData('https://fantasy.premierleague.com/api/bootstrap-static/');
    
    // Fetch fixtures data
    const fixturesData = await fetchFplData('https://fantasy.premierleague.com/api/fixtures/');
    
    // Get current gameweek
    const currentGameweek = bootstrapData.events.find((event: any) => event.is_current)?.id || 1;
    
    // Update players table
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
        })
        .select();
    }
    
    // Update teams table
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
        })
        .select();
    }
    
    // Update fixtures table
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
        })
        .select();
    }
    
    // Update events (gameweeks) table
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
        })
        .select();
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'FPL data synced successfully',
      timestamp: new Date().toISOString(),
      currentGameweek
    });
  } catch (error: any) {
    console.error('Error syncing FPL data:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 