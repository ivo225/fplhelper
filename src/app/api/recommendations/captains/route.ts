import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

interface Player {
  id: number;
  first_name: string;
  second_name: string;
  web_name: string;
  team: number;
  position: number;
  now_cost: number;
  form: string;
  points_per_game: string;
  total_points: number;
}

interface Team {
  id: number;
  name: string;
  short_name: string;
}

interface CaptainRecommendation {
  id: number;
  gameweek: number;
  player_id: number;
  rank: number;
  points_prediction: number;
  confidence_score: number;
  reasoning: string;
  created_at: string;
  players: Player;
}

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    
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
    
    // Get teams data
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError) {
      throw new Error(`Failed to fetch teams data: ${teamsError.message}`);
    }
    
    // Get players data
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*');
    
    if (playersError) {
      throw new Error(`Failed to fetch players data: ${playersError.message}`);
    }
    
    // Get captain recommendations without player join
    const { data: recommendationsData, error } = await supabase
      .from('captain_recommendations')
      .select(`
        id,
        gameweek,
        player_id,
        rank,
        points_prediction,
        confidence_score,
        reasoning,
        created_at
      `)
      .eq('gameweek', currentGameweek)
      .order('rank');
    
    if (error) {
      throw new Error(`Failed to fetch captain recommendations: ${error.message}`);
    }
    
    // Manually add player and team data
    const recommendations = recommendationsData?.map((rec: any) => {
      const player = players?.find((p: any) => p.id === rec.player_id);
      if (player) {
        const team = teams?.find((t: any) => t.id === player.team);
        return {
          ...rec,
          players: {
            ...player,
            teams: team || { name: 'Unknown', short_name: 'UNK' }
          }
        };
      }
      return rec;
    });
    
    // Get the last update timestamp
    let updatedAt = new Date().toISOString();
    try {
      const { data: lastUpdate } = await supabase
        .from('captain_recommendations')
        .select('created_at')
        .eq('gameweek', currentGameweek)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (lastUpdate) {
        updatedAt = lastUpdate.created_at;
      }
    } catch (error) {
      console.warn('Error fetching last update timestamp, using current time:', error);
    }
    
    return NextResponse.json({ 
      gameweek: currentGameweek,
      recommendations: recommendations || [],
      updated_at: updatedAt
    });
  } catch (error: any) {
    console.error('Error fetching captain recommendations:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
} 