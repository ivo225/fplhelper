import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ 
        error: 'Search query is required' 
      }, { status: 400 });
    }
    
    const supabase = getServiceSupabase();
    
    // Get teams data for joining
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError) {
      return NextResponse.json({ 
        error: `Failed to fetch teams data: ${teamsError.message}` 
      }, { status: 500 });
    }
    
    // Search for players by name
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .or(`first_name.ilike.%${query}%,second_name.ilike.%${query}%,web_name.ilike.%${query}%`)
      .order('total_points', { ascending: false })
      .limit(20);
    
    if (playersError) {
      return NextResponse.json({ 
        error: `Failed to search players: ${playersError.message}` 
      }, { status: 500 });
    }
    
    // Enrich player data with team information
    const enrichedPlayers = players.map(player => {
      const team = teams.find(t => t.id === player.team);
      return {
        ...player,
        team_name: team?.name || 'Unknown',
        team_short_name: team?.short_name || 'UNK',
        position_name: getPositionName(player.position)
      };
    });
    
    return NextResponse.json({
      results: enrichedPlayers,
      count: enrichedPlayers.length,
      query
    });
    
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

// Helper function to convert position ID to name
function getPositionName(positionId: number): string {
  switch (positionId) {
    case 1:
      return 'GK';
    case 2:
      return 'DEF';
    case 3:
      return 'MID';
    case 4:
      return 'FWD';
    default:
      return 'Unknown';
  }
} 