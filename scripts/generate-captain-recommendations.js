require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Deepseek API key
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-4cc79be2639c40f19123237042897f4a';

// Helper function to call Deepseek API
async function callDeepseekAPI(prompt) {
  try {
    console.log('Calling Deepseek API...');
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You are an expert Fantasy Premier League analyst. Respond with pure JSON only, no markdown formatting."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    let content = response.data.choices[0].message.content;
    
    // Remove any markdown formatting if present
    if (content.includes('```')) {
      content = content.replace(/```json\n|\n```/g, '');
    }
    
    // Clean up any remaining whitespace
    content = content.trim();
    
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to parse API response:', content);
      throw new Error('Invalid JSON response from API');
    }
  } catch (error) {
    console.error('Error calling Deepseek API:', error.message);
    throw error;
  }
}

// Get position name from position ID
function getPositionName(positionId) {
  const positions = {
    1: 'Goalkeeper',
    2: 'Defender',
    3: 'Midfielder',
    4: 'Forward'
  };
  return positions[positionId] || 'Unknown';
}

// Get team name from team ID
function getTeamName(teamId, teams) {
  const team = teams.find(t => t.id === teamId);
  return team ? team.short_name : 'Unknown';
}

// Generate captain recommendations
async function generateCaptainRecommendations(gameweek, players, fixtures, teams) {
  try {
    console.log(`Generating captain recommendations for gameweek ${gameweek}...`);
    
    // Filter players - only consider those with good form and minutes
    const viableCaptains = players
      .filter(player => {
        const form = parseFloat(player.form) || 0;
        const minutes = parseInt(player.minutes) || 0;
        const avgMinutesPerGame = minutes / (gameweek - 1); // Rough estimate of minutes per game
        
        return form > 3.0 && avgMinutesPerGame > 60; // Only players with good form and regular starters
      })
      .sort((a, b) => {
        const formA = parseFloat(a.form) || 0;
        const formB = parseFloat(b.form) || 0;
        return formB - formA;
      })
      .slice(0, 30); // Take top 30 in-form players
    
    // Map fixtures to players for next gameweek
    const playerFixtures = viableCaptains.map(player => {
      const nextFixtures = fixtures
        .filter(f => 
          f.event === gameweek && 
          (f.team_h === player.team || f.team_a === player.team)
        )
        .map(f => ({
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
        team: getTeamName(player.team, teams),
        position: getPositionName(player.position),
        form: player.form,
        points_per_game: player.points_per_game,
        total_points: player.total_points,
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
      recommend the top 5 captain picks that could provide the highest points return.
      Consider form, fixtures, historical performance, and underlying statistics.
      
      Player data:
      ${JSON.stringify(playerFixtures, null, 2)}
      
      Format your response as a JSON object with the following structure:
      {
        "captain_recommendations": [
          {
            "player_id": number,
            "rank": number,
            "points_prediction": number,
            "reasoning": "string",
            "confidence_score": number
          }
        ]
      }
      
      Only include the JSON in your response, no other text.
    `;
    
    console.log('Calling Deepseek API...');
    // Call Deepseek AI API
    const aiResponse = await callDeepseekAPI(prompt);
    console.log('Received response from Deepseek API');
    
    // Store recommendations in Supabase
    console.log('Storing captain recommendations in Supabase...');
    for (const rec of aiResponse.captain_recommendations) {
      const { data, error } = await supabase
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
      
      if (error) {
        console.error(`Error inserting captain recommendation for player ${rec.player_id}:`, error);
      } else {
        console.log(`Successfully inserted captain recommendation for player ${rec.player_id}`);
      }
    }

    console.log('Captain recommendations generated and stored successfully!');
    return aiResponse.captain_recommendations;
  } catch (error) {
    console.error('Error generating captain recommendations:', error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('Starting captain recommendations generation for Gameweek 29...');
    
    // Hardcode gameweek to 29
    const currentGameweek = 29;
    console.log(`Target gameweek: ${currentGameweek}`);
    
    // Get players data
    console.log('Fetching players data...');
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .order('total_points', { ascending: false });
    
    if (playersError || !players) {
      throw new Error(`Failed to fetch players data: ${playersError?.message || 'No data'}`);
    }
    console.log(`Fetched ${players.length} players`);
    
    // Get fixtures data
    console.log('Fetching fixtures data...');
    const { data: fixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('*')
      .eq('event', currentGameweek);
    
    if (fixturesError || !fixtures) {
      throw new Error(`Failed to fetch fixtures data: ${fixturesError?.message || 'No data'}`);
    }
    console.log(`Fetched ${fixtures.length} fixtures`);
    
    // Get teams data
    console.log('Fetching teams data...');
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError || !teams) {
      throw new Error(`Failed to fetch teams data: ${teamsError?.message || 'No data'}`);
    }
    console.log(`Fetched ${teams.length} teams`);
    
    // Generate captain recommendations
    await generateCaptainRecommendations(currentGameweek, players, fixtures, teams);
    
    console.log('\n🎉 CAPTAIN RECOMMENDATIONS GENERATION COMPLETE 🎉');
    console.log(`✅ Recommendations have been generated for gameweek ${currentGameweek}`);
    console.log(`⏰ Completed at: ${new Date().toLocaleString()}`);
    
  } catch (error) {
    console.error('❌ Error during captain recommendations generation:', error);
    process.exit(1);
  }
}

// Run the main function
main(); 