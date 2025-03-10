import { NextResponse } from 'next/server';
import { fetchFplData } from '@/utils/fplApi';

export async function GET() {
  try {
    // Fetch bootstrap-static data which contains all player and team information
    const bootstrapData = await fetchFplData('bootstrap-static/');
    
    if (!bootstrapData || !bootstrapData.elements || !bootstrapData.teams) {
      throw new Error('Failed to fetch FPL data');
    }

    // Process teams data
    const teams = bootstrapData.teams.map((team: any) => ({
      id: team.id,
      name: team.name,
      short_name: team.short_name,
      strength: team.strength,
      strength_attack_home: team.strength_attack_home,
      strength_attack_away: team.strength_attack_away,
      strength_defence_home: team.strength_defence_home,
      strength_defence_away: team.strength_defence_away,
    }));

    // Create a map of team IDs to team names for easy lookup
    const teamMap = new Map();
    teams.forEach((team: any) => {
      teamMap.set(team.id, team.name);
    });

    // Process player data
    const players = bootstrapData.elements.map((player: any) => {
      // Map position codes to readable positions
      let position;
      switch (player.element_type) {
        case 1:
          position = 'GK';
          break;
        case 2:
          position = 'DEF';
          break;
        case 3:
          position = 'MID';
          break;
        case 4:
          position = 'FWD';
          break;
        default:
          position = 'UNK';
      }

      // Check if the player might be a coach (based on certain criteria)
      // Coaches typically have very low minutes, special roles, or specific naming patterns
      const isCoach = 
        (player.first_name.includes('Coach') || 
         player.second_name.includes('Coach') ||
         player.web_name.includes('Coach') ||
         player.status === 'unavailable' && player.minutes === 0 && player.news && player.news.toLowerCase().includes('coach'));
      
      if (isCoach) {
        position = 'COACH';
      }

      return {
        id: player.id,
        name: `${player.first_name} ${player.second_name}`,
        team: teamMap.get(player.team),
        team_id: player.team,
        position: isCoach ? 'COACH' : position,
        price: player.now_cost / 10, // Convert to decimal format (e.g., 55 -> 5.5)
        total_points: player.total_points,
        points_per_game: player.points_per_game,
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
        influence: parseFloat(player.influence),
        creativity: parseFloat(player.creativity),
        threat: parseFloat(player.threat),
        ict_index: parseFloat(player.ict_index),
        form: parseFloat(player.form),
        selected_by_percent: parseFloat(player.selected_by_percent),
        // Expected goals and assists - these might not be directly available in the API
        // Using influence and creativity as proxies if needed
        xG: player.expected_goals ? parseFloat(player.expected_goals) : parseFloat(player.influence) / 100,
        xA: player.expected_assists ? parseFloat(player.expected_assists) : parseFloat(player.creativity) / 100,
      };
    });

    return NextResponse.json({ 
      players,
      teams
    });
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player statistics' },
      { status: 500 }
    );
  }
} 