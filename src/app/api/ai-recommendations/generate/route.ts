import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

// Deepseek API key
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';

// Helper function to call Deepseek API
async function callDeepseekAPI(prompt: string) {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are an expert Fantasy Premier League analyst." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Deepseek API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error: any) {
    console.error('Error calling Deepseek API:', error);
    throw error;
  }
}

// Get position name from position ID
function getPositionName(positionId: number) {
  const positions: Record<number, string> = {
    1: 'Goalkeeper',
    2: 'Defender',
    3: 'Midfielder',
    4: 'Forward'
  };
  return positions[positionId] || 'Unknown';
}

// Get team name from team ID
function getTeamName(teamId: number, teams: any[]) {
  const team = teams.find(t => t.id === teamId);
  return team ? team.short_name : 'Unknown';
}

// Generate captain recommendations
async function generateCaptainRecommendations(supabase: any, gameweek: number, players: any[], fixtures: any[], teams: any[]) {
  try {
    // Prepare data for the AI
    const topPlayers = players.slice(0, 30); // Focus on top 30 players by points
    
    // Map fixtures to players
    const playerFixtures = topPlayers.map(player => {
      const playerFixture = fixtures.find((f: any) => 
        f.event === gameweek && 
        (f.team_h === player.team || f.team_a === player.team)
      );
      
      return {
        player_id: player.id,
        player_name: `${player.first_name} ${player.second_name}`,
        team: player.teams?.short_name || getTeamName(player.team, teams),
        position: getPositionName(player.position),
        form: player.form,
        points_per_game: player.points_per_game,
        total_points: player.total_points,
        opponent: playerFixture ? 
          (playerFixture.team_h === player.team ? 
            getTeamName(playerFixture.team_a, teams) : 
            getTeamName(playerFixture.team_h, teams)) : 
          'Unknown',
        is_home: playerFixture ? playerFixture.team_h === player.team : false,
        difficulty: playerFixture ? 
          (playerFixture.team_h === player.team ? 
            playerFixture.team_h_difficulty : 
            playerFixture.team_a_difficulty) : 
          3
      };
    });
    
    // Create prompt for Deepseek AI
    const prompt = `
      You are an expert Fantasy Premier League analyst. Based on the following player data for gameweek ${gameweek}, 
      recommend the top 5 captain choices in order of preference. For each player, provide a brief explanation of why 
      they are a good captain choice and a predicted points range.
      
      Player data:
      ${JSON.stringify(playerFixtures, null, 2)}
      
      Format your response as a JSON object with the following structure:
      {
        "recommendations": [
          {
            "player_id": number,
            "rank": number,
            "points_prediction": number,
            "confidence_score": number,
            "reasoning": "string"
          }
        ]
      }
      
      Only include the JSON in your response, no other text.
    `;
    
    // Call Deepseek AI API
    const aiResponse = await callDeepseekAPI(prompt);
    const recommendations = aiResponse.recommendations;
    
    // Store recommendations in Supabase
    for (const rec of recommendations) {
      await supabase
        .from('captain_recommendations')
        .upsert({
          gameweek,
          player_id: rec.player_id,
          rank: rec.rank,
          points_prediction: rec.points_prediction,
          confidence_score: rec.confidence_score,
          reasoning: rec.reasoning,
          created_at: new Date().toISOString()
        });
    }
    
    return recommendations;
  } catch (error) {
    console.error('Error generating captain recommendations:', error);
    throw error;
  }
}

// Generate transfer recommendations
async function generateTransferRecommendations(supabase: any, gameweek: number, players: any[], fixtures: any[], teams: any[]) {
  try {
    // Prepare data for the AI
    const topPlayers = players.slice(0, 50); // Focus on top 50 players
    
    // Map fixtures to players for next 3 gameweeks
    const playerFixtures = topPlayers.map(player => {
      const nextFixtures = fixtures
        .filter((f: any) => 
          f.event >= gameweek && 
          f.event <= gameweek + 3 && 
          (f.team_h === player.team || f.team_a === player.team)
        )
        .map((f: any) => ({
          gameweek: f.event,
          opponent: f.team_h === player.team ? 
            getTeamName(f.team_a, teams) : 
            getTeamName(f.team_h, teams),
          is_home: f.team_h === player.team,
          difficulty: f.team_h === player.team ? 
            f.team_h_difficulty : 
            f.team_a_difficulty
        }));
      
      return {
        player_id: player.id,
        player_name: `${player.first_name} ${player.second_name}`,
        team: player.teams?.short_name || getTeamName(player.team, teams),
        position: getPositionName(player.position),
        price: player.now_cost / 10,
        form: player.form,
        points_per_game: player.points_per_game,
        total_points: player.total_points,
        selected_by_percent: player.selected_by_percent,
        minutes: player.minutes,
        goals_scored: player.goals_scored,
        assists: player.assists,
        clean_sheets: player.clean_sheets,
        next_fixtures: nextFixtures
      };
    });
    
    // Create prompt for Deepseek AI
    const prompt = `
      You are an expert Fantasy Premier League analyst. Based on the following player data for gameweek ${gameweek}, 
      recommend the top 5 players to buy and top 5 players to sell. Consider form, fixtures, price, and potential.
      
      Player data:
      ${JSON.stringify(playerFixtures, null, 2)}
      
      Format your response as a JSON object with the following structure:
      {
        "buy_recommendations": [
          {
            "player_id": number,
            "reasoning": "string",
            "confidence_score": number
          }
        ],
        "sell_recommendations": [
          {
            "player_id": number,
            "reasoning": "string",
            "confidence_score": number
          }
        ]
      }
      
      Only include the JSON in your response, no other text.
    `;
    
    // Call Deepseek AI API
    const aiResponse = await callDeepseekAPI(prompt);
    
    // Store buy recommendations in Supabase
    for (const rec of aiResponse.buy_recommendations) {
      await supabase
        .from('transfer_recommendations')
        .upsert({
          gameweek,
          player_id: rec.player_id,
          type: 'buy',
          reasoning: rec.reasoning,
          confidence_score: rec.confidence_score,
          created_at: new Date().toISOString()
        });
    }
    
    // Store sell recommendations in Supabase
    for (const rec of aiResponse.sell_recommendations) {
      await supabase
        .from('transfer_recommendations')
        .upsert({
          gameweek,
          player_id: rec.player_id,
          type: 'sell',
          reasoning: rec.reasoning,
          confidence_score: rec.confidence_score,
          created_at: new Date().toISOString()
        });
    }
    
    return {
      buy_recommendations: aiResponse.buy_recommendations,
      sell_recommendations: aiResponse.sell_recommendations
    };
  } catch (error) {
    console.error('Error generating transfer recommendations:', error);
    throw error;
  }
}

// Generate differential recommendations
async function generateDifferentialRecommendations(supabase: any, gameweek: number, players: any[], fixtures: any[], teams: any[]) {
  try {
    // Prepare data for the AI - players with less than 10% ownership
    const differentialPlayers = players
      .filter(p => parseFloat(p.selected_by_percent) < 10)
      .slice(0, 50); // Focus on top 50 differential players by points
    
    // Map fixtures to players for next 3 gameweeks
    const playerFixtures = differentialPlayers.map(player => {
      const nextFixtures = fixtures
        .filter((f: any) => 
          f.event >= gameweek && 
          f.event <= gameweek + 3 && 
          (f.team_h === player.team || f.team_a === player.team)
        )
        .map((f: any) => ({
          gameweek: f.event,
          opponent: f.team_h === player.team ? 
            getTeamName(f.team_a, teams) : 
            getTeamName(f.team_h, teams),
          is_home: f.team_h === player.team,
          difficulty: f.team_h === player.team ? 
            f.team_h_difficulty : 
            f.team_a_difficulty
        }));
      
      return {
        player_id: player.id,
        player_name: `${player.first_name} ${player.second_name}`,
        team: player.teams?.short_name || getTeamName(player.team, teams),
        position: getPositionName(player.position),
        price: player.now_cost / 10,
        form: player.form,
        points_per_game: player.points_per_game,
        total_points: player.total_points,
        selected_by_percent: player.selected_by_percent,
        minutes: player.minutes,
        goals_scored: player.goals_scored,
        assists: player.assists,
        clean_sheets: player.clean_sheets,
        next_fixtures: nextFixtures
      };
    });
    
    // Create prompt for Deepseek AI
    const prompt = `
      You are an expert Fantasy Premier League analyst. Based on the following player data for gameweek ${gameweek}, 
      recommend the top 5 differential picks (players with less than 10% ownership) that could provide great value.
      Consider form, fixtures, and underlying statistics.
      
      Player data:
      ${JSON.stringify(playerFixtures, null, 2)}
      
      Format your response as a JSON object with the following structure:
      {
        "differential_recommendations": [
          {
            "player_id": number,
            "rank": number,
            "predicted_points": number,
            "reasoning": "string"
          }
        ]
      }
      
      Only include the JSON in your response, no other text.
    `;
    
    // Call Deepseek AI API
    const aiResponse = await callDeepseekAPI(prompt);
    const recommendations = aiResponse.differential_recommendations;
    
    // Store recommendations in Supabase
    for (const rec of recommendations) {
      await supabase
        .from('differential_recommendations')
        .upsert({
          gameweek,
          player_id: rec.player_id,
          rank: rec.rank,
          predicted_points: rec.predicted_points,
          reasoning: rec.reasoning,
          created_at: new Date().toISOString()
        });
    }
    
    return recommendations;
  } catch (error) {
    console.error('Error generating differential recommendations:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    // Check for API key in request headers
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const supabase = getServiceSupabase();
    
    // Get current gameweek
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('is_current', true)
      .single();
    
    if (eventsError) {
      console.warn('Error fetching current gameweek, using default:', eventsError);
    }
    
    const currentGameweek = events?.id || 1;
    
    // Get players data - without using a join
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .order('total_points', { ascending: false });
    
    if (playersError || !players) {
      return NextResponse.json({ 
        error: `Failed to fetch players data: ${playersError?.message || 'No data'}` 
      }, { status: 500 });
    }
    
    // Get teams data separately
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError || !teams) {
      return NextResponse.json({ 
        error: `Failed to fetch teams data: ${teamsError?.message || 'No data'}` 
      }, { status: 500 });
    }
    
    // Manually add team data to players
    const playersWithTeams = players.map(player => {
      const team = teams.find(t => t.id === player.team);
      return {
        ...player,
        teams: team
      };
    });
    
    // Get fixtures data
    const { data: fixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('*')
      .gte('event', currentGameweek)
      .lte('event', currentGameweek + 5);
    
    if (fixturesError || !fixtures) {
      return NextResponse.json({ 
        error: `Failed to fetch fixtures data: ${fixturesError?.message || 'No data'}` 
      }, { status: 500 });
    }
    
    // Parse request URL to determine which recommendations to generate
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'all';
    
    let results: any = {};
    
    // Generate recommendations based on type
    if (type === 'all' || type === 'captains') {
      const captainRecommendations = await generateCaptainRecommendations(supabase, currentGameweek, playersWithTeams, fixtures, teams);
      results.captainRecommendations = captainRecommendations;
    }
    
    if (type === 'all' || type === 'transfers') {
      const transferRecommendations = await generateTransferRecommendations(supabase, currentGameweek, playersWithTeams, fixtures, teams);
      results.transferRecommendations = transferRecommendations;
    }
    
    if (type === 'all' || type === 'differentials') {
      const differentialRecommendations = await generateDifferentialRecommendations(supabase, currentGameweek, playersWithTeams, fixtures, teams);
      results.differentialRecommendations = differentialRecommendations;
    }
    
    return NextResponse.json({
      success: true,
      gameweek: currentGameweek,
      timestamp: new Date().toISOString(),
      ...results
    });
  } catch (error: any) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
} 