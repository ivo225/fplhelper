import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const supabase = getServiceSupabase();
    
    // Check if an FPL ID was provided
    const { searchParams } = new URL(request.url);
    const fplId = searchParams.get('fplId');
    let userTeam = null;
    
    // If FPL ID is provided, fetch the user's team
    if (fplId) {
      try {
        // Use the new API endpoint
        const teamResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/my-team/${fplId}`);
        
        if (teamResponse.ok) {
          userTeam = await teamResponse.json();
        } else {
          console.warn(`Failed to fetch user team for ID ${fplId}: ${teamResponse.status}`);
        }
      } catch (error) {
        console.warn('Error fetching user team:', error);
      }
    }
    
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
    
    // Check the structure of the transfer_recommendations table
    const { data: tableInfo, error: tableInfoError } = await supabase
      .from('transfer_recommendations')
      .select('*')
      .limit(1);
    
    if (tableInfoError) {
      console.warn('Error checking transfer_recommendations table:', tableInfoError);
      
      // If the table doesn't exist or has issues, return empty recommendations
      return NextResponse.json({ 
        gameweek: currentGameweek,
        buy_recommendations: [],
        sell_recommendations: [],
        updated_at: new Date().toISOString(),
        is_personalized: !!userTeam,
        status: 'no_recommendations'
      });
    }
    
    // Get all columns from the first row to determine schema
    const sampleRow = tableInfo && tableInfo.length > 0 ? tableInfo[0] : null;
    
    // Determine which column contains the player ID
    let playerIdColumn = null;
    if (sampleRow) {
      if ('player_id' in sampleRow) {
        playerIdColumn = 'player_id';
      } else if ('element_id' in sampleRow) {
        playerIdColumn = 'element_id';
      }
    }
    
    // If we couldn't determine the player ID column, return empty recommendations
    if (!playerIdColumn) {
      console.warn('Could not determine player ID column in transfer_recommendations table');
      return NextResponse.json({ 
        gameweek: currentGameweek,
        buy_recommendations: [],
        sell_recommendations: [],
        updated_at: new Date().toISOString(),
        is_personalized: !!userTeam,
        status: 'schema_issue'
      });
    }
    
    console.log(`Using column name: ${playerIdColumn}`);
    
    // Get buy recommendations
    let buyRecommendationsData: any[] = [];
    let buyError: any = null;
    
    try {
      // Select all columns to avoid specifying column names
      const result = await supabase
        .from('transfer_recommendations')
        .select('*')
        .eq('gameweek', currentGameweek)
        .eq('type', 'buy')
        .order('confidence_score', { ascending: false });
      
      buyRecommendationsData = result.data || [];
      buyError = result.error;
    } catch (error: any) {
      console.warn('Error fetching buy recommendations:', error);
      buyError = error;
    }
    
    if (buyError) {
      console.error('Buy recommendations error:', buyError);
      // Return empty buy recommendations instead of throwing an error
      buyRecommendationsData = [];
    }
    
    // Manually add player and team data to buy recommendations
    let buyRecommendations = buyRecommendationsData.map((rec: any) => {
      const playerId = rec[playerIdColumn];
      const player = players?.find((p: any) => p.id === playerId);
      if (player) {
        const team = teams?.find((t: any) => t.id === player.team);
        return {
          ...rec,
          player_id: playerId, // Ensure player_id is always available
          players: {
            ...player,
            teams: team || { name: 'Unknown', short_name: 'UNK' }
          }
        };
      }
      return rec;
    }).filter(Boolean);
    
    // Get sell recommendations
    let sellRecommendationsData: any[] = [];
    let sellError: any = null;
    
    try {
      // Select all columns to avoid specifying column names
      const result = await supabase
        .from('transfer_recommendations')
        .select('*')
        .eq('gameweek', currentGameweek)
        .eq('type', 'sell')
        .order('confidence_score', { ascending: false });
      
      sellRecommendationsData = result.data || [];
      sellError = result.error;
    } catch (error: any) {
      console.warn('Error fetching sell recommendations:', error);
      sellError = error;
    }
    
    if (sellError) {
      console.error('Sell recommendations error:', sellError);
      // Return empty sell recommendations instead of throwing an error
      sellRecommendationsData = [];
    }
    
    // Manually add player and team data to sell recommendations
    let sellRecommendations = sellRecommendationsData.map((rec: any) => {
      const playerId = rec[playerIdColumn];
      const player = players?.find((p: any) => p.id === playerId);
      if (player) {
        const team = teams?.find((t: any) => t.id === player.team);
        return {
          ...rec,
          player_id: playerId, // Ensure player_id is always available
          players: {
            ...player,
            teams: team || { name: 'Unknown', short_name: 'UNK' }
          }
        };
      }
      return rec;
    }).filter(Boolean);
    
    // If user team is available, personalize recommendations
    if (userTeam) {
      // Get player IDs from user's team
      const userPlayerIds = userTeam.team.map((pick: any) => pick.player.id);
      
      // Filter sell recommendations to only include players in the user's team
      sellRecommendations = sellRecommendations.filter((rec: any) => 
        userPlayerIds.includes(rec.player_id)
      );
      
      // Filter buy recommendations to exclude players already in the user's team
      buyRecommendations = buyRecommendations.filter((rec: any) => 
        !userPlayerIds.includes(rec.player_id)
      );
    }
    
    // Get the last update timestamp
    let updatedAt = new Date().toISOString();
    try {
      const { data: lastUpdate } = await supabase
        .from('transfer_recommendations')
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
      buy_recommendations: buyRecommendations || [],
      sell_recommendations: sellRecommendations || [],
      updated_at: updatedAt,
      is_personalized: !!userTeam,
      status: 'success'
    });
  } catch (error: any) {
    console.error('Error fetching transfer recommendations:', error);
    return NextResponse.json({ 
      error: error.message,
      gameweek: 0,
      buy_recommendations: [],
      sell_recommendations: [],
      updated_at: new Date().toISOString(),
      is_personalized: false,
      status: 'error'
    }, { status: 500 });
  }
} 