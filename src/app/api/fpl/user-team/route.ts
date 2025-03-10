import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fplId = searchParams.get('fplId');
    
    if (!fplId) {
      return NextResponse.json({ error: 'FPL ID is required' }, { status: 400 });
    }
    
    // Fetch current gameweek
    const bootstrapResponse = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/');
    
    if (!bootstrapResponse.ok) {
      throw new Error(`Failed to fetch bootstrap data: ${bootstrapResponse.status}`);
    }
    
    const bootstrapData = await bootstrapResponse.json();
    const currentEvent = bootstrapData.events.find((event: any) => event.is_current)?.id || 1;
    
    // Fetch user's team
    const teamResponse = await fetch(`https://fantasy.premierleague.com/api/entry/${fplId}/event/${currentEvent}/picks/`);
    
    if (!teamResponse.ok) {
      if (teamResponse.status === 404) {
        return NextResponse.json({ error: 'FPL ID not found' }, { status: 404 });
      }
      throw new Error(`Failed to fetch team data: ${teamResponse.status}`);
    }
    
    const teamData = await teamResponse.json();
    
    // Fetch player details
    const playerIds = teamData.picks.map((pick: any) => pick.element);
    const playerDetails = bootstrapData.elements.filter((element: any) => playerIds.includes(element.id));
    
    // Enhance team data with player details
    const enhancedTeam = teamData.picks.map((pick: any) => {
      const player = playerDetails.find((p: any) => p.id === pick.element);
      const team = bootstrapData.teams.find((t: any) => t.id === player?.team);
      
      return {
        ...pick,
        player: {
          id: player?.id,
          first_name: player?.first_name,
          second_name: player?.second_name,
          web_name: player?.web_name,
          team: player?.team,
          team_name: team?.name,
          team_short_name: team?.short_name,
          position: player?.element_type,
          now_cost: player?.now_cost,
          form: player?.form,
          points_per_game: player?.points_per_game,
          total_points: player?.total_points,
          selected_by_percent: player?.selected_by_percent
        }
      };
    });
    
    // Group by position
    const positions = {
      1: 'Goalkeeper',
      2: 'Defender',
      3: 'Midfielder',
      4: 'Forward'
    };
    
    const teamByPosition = {
      1: enhancedTeam.filter((p: any) => p.player.position === 1),
      2: enhancedTeam.filter((p: any) => p.player.position === 2),
      3: enhancedTeam.filter((p: any) => p.player.position === 3),
      4: enhancedTeam.filter((p: any) => p.player.position === 4)
    };
    
    // Get team value
    const teamValue = enhancedTeam.reduce((sum: number, pick: any) => sum + pick.player.now_cost, 0) / 10;
    
    return NextResponse.json({
      manager_id: fplId,
      gameweek: currentEvent,
      team: enhancedTeam,
      team_by_position: teamByPosition,
      positions,
      team_value: teamValue,
      chips: teamData.active_chip,
      entry_history: teamData.entry_history
    });
  } catch (error: any) {
    console.error('Error fetching user team:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 