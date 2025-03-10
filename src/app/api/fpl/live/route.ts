import { NextResponse } from 'next/server';
import { fetchFplData } from '@/utils/fplApi';

interface LivePlayer {
  id: number;
  name: string;
  team: string;
  position: string;
  points: number;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number;
  in_dreamteam: boolean;
}

interface BonusPrediction {
  fixture_id: number;
  home_team: string;
  away_team: string;
  players: {
    id: number;
    name: string;
    team: string;
    bps: number;
    predicted_bonus: number;
  }[];
}

interface LiveFixture {
  id: number;
  started: boolean;
  finished: boolean;
  finished_provisional: boolean;
  kickoff_time: string;
  minutes: number;
  home_team_id: number;
  home_team_name: string;
  home_team_score: number;
  away_team_id: number;
  away_team_name: string;
  away_team_score: number;
  stats: any[];
}

export async function GET() {
  try {
    // Get current gameweek and bootstrap data
    const bootstrap = await fetchFplData('bootstrap-static/');
    
    if (!bootstrap || !bootstrap.events) {
      throw new Error('Failed to fetch FPL bootstrap data');
    }
    
    const currentEvent = bootstrap.events.find((event: any) => event.is_current);
    
    if (!currentEvent) {
      return NextResponse.json({ 
        status: 'No active gameweek',
        isLive: false,
        gameweek: null,
        lastUpdated: new Date().toISOString(),
        livePlayers: [],
        bonusPredictions: [],
        fixtures: []
      });
    }
    
    // Fetch live data for current gameweek
    const liveData = await fetchFplData(`event/${currentEvent.id}/live/`);
    
    if (!liveData || !liveData.elements) {
      throw new Error('Failed to fetch FPL live data');
    }
    
    // Fetch fixtures for current gameweek
    const fixturesData = await fetchFplData(`fixtures/?event=${currentEvent.id}`);
    
    if (!fixturesData) {
      throw new Error('Failed to fetch FPL fixtures data');
    }
    
    // Create team ID to name mapping
    const teamMap = new Map();
    bootstrap.teams.forEach((team: any) => {
      teamMap.set(team.id, team.name);
    });
    
    // Create player ID to details mapping
    const playerMap = new Map();
    bootstrap.elements.forEach((player: any) => {
      // Map position codes to readable positions
      let position;
      switch (player.element_type) {
        case 1: position = 'GK'; break;
        case 2: position = 'DEF'; break;
        case 3: position = 'MID'; break;
        case 4: position = 'FWD'; break;
        default: position = 'UNK';
      }
      
      playerMap.set(player.id, {
        name: `${player.first_name} ${player.second_name}`,
        team: teamMap.get(player.team),
        team_id: player.team,
        position
      });
    });
    
    // Process live player data
    const livePlayers: LivePlayer[] = liveData.elements
      .filter((element: any) => element.stats.minutes > 0) // Only include players who have played
      .map((element: any) => {
        const playerDetails = playerMap.get(element.id);
        if (!playerDetails) return null;
        
        const stats = element.stats;
        return {
          id: element.id,
          name: playerDetails.name,
          team: playerDetails.team,
          position: playerDetails.position,
          points: stats.total_points,
          minutes: stats.minutes,
          goals_scored: stats.goals_scored,
          assists: stats.assists,
          clean_sheets: stats.clean_sheets,
          goals_conceded: stats.goals_conceded,
          own_goals: stats.own_goals,
          penalties_saved: stats.penalties_saved,
          penalties_missed: stats.penalties_missed,
          yellow_cards: stats.yellow_cards,
          red_cards: stats.red_cards,
          saves: stats.saves,
          bonus: stats.bonus,
          bps: stats.bps,
          in_dreamteam: stats.in_dreamteam
        };
      })
      .filter(Boolean)
      .sort((a: LivePlayer, b: LivePlayer) => b.points - a.points);
    
    // Process fixtures data
    const liveFixtures: LiveFixture[] = fixturesData
      .filter((fixture: any) => fixture.started && !fixture.finished)
      .map((fixture: any) => ({
        id: fixture.id,
        started: fixture.started,
        finished: fixture.finished,
        finished_provisional: fixture.finished_provisional,
        kickoff_time: fixture.kickoff_time,
        minutes: fixture.minutes,
        home_team_id: fixture.team_h,
        home_team_name: teamMap.get(fixture.team_h),
        home_team_score: fixture.team_h_score,
        away_team_id: fixture.team_a,
        away_team_name: teamMap.get(fixture.team_a),
        away_team_score: fixture.team_a_score,
        stats: fixture.stats
      }));
    
    // Calculate bonus point predictions for live fixtures
    const bonusPredictions: BonusPrediction[] = liveFixtures
      .filter((fixture: LiveFixture) => !fixture.finished_provisional)
      .map((fixture: LiveFixture) => {
        // Get players from this fixture
        const fixturePlayersBPS = livePlayers
          .filter(player => 
            playerMap.get(player.id)?.team_id === fixture.home_team_id || 
            playerMap.get(player.id)?.team_id === fixture.away_team_id
          )
          .map(player => ({
            id: player.id,
            name: player.name,
            team: player.team,
            bps: player.bps,
            predicted_bonus: 0
          }))
          .sort((a, b) => b.bps - a.bps);
        
        // Assign predicted bonus points (3, 2, 1)
        if (fixturePlayersBPS.length > 0) {
          fixturePlayersBPS[0].predicted_bonus = 3;
          if (fixturePlayersBPS.length > 1) {
            fixturePlayersBPS[1].predicted_bonus = 2;
            if (fixturePlayersBPS.length > 2) {
              fixturePlayersBPS[2].predicted_bonus = 1;
            }
          }
        }
        
        return {
          fixture_id: fixture.id,
          home_team: fixture.home_team_name,
          away_team: fixture.away_team_name,
          players: fixturePlayersBPS
        };
      });
    
    return NextResponse.json({
      status: 'Live',
      isLive: liveFixtures.length > 0,
      gameweek: currentEvent.id,
      lastUpdated: new Date().toISOString(),
      livePlayers,
      bonusPredictions,
      fixtures: liveFixtures
    });
  } catch (error) {
    console.error('Error fetching live data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live data' },
      { status: 500 }
    );
  }
} 