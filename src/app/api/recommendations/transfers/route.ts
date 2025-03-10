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
    
    // Fetch fixtures data for the next 5 gameweeks
    const fixturesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/fpl/fixtures/upcoming`);
    let fixturesData = { matches: [] };
    
    if (fixturesResponse.ok) {
      fixturesData = await fixturesResponse.json();
    } else {
      console.warn(`Failed to fetch fixtures: ${fixturesResponse.status}`);
    }
    
    // Group fixtures by team for the next 5 gameweeks
    const fixturesByTeam = fixturesData.matches.reduce((acc: any, fixture: any) => {
      const homeTeamId = fixture.team_h;
      const awayTeamId = fixture.team_a;
      
      // Only include fixtures for the next 5 gameweeks
      if (fixture.event && fixture.event >= currentGameweek && fixture.event <= currentGameweek + 5) {
        // Add home fixture to home team's list
        if (!acc[homeTeamId]) acc[homeTeamId] = [];
        acc[homeTeamId].push({
          opponent: awayTeamId,
          difficulty: fixture.team_h_difficulty,
          isHome: true,
          event: fixture.event
        });
        
        // Add away fixture to away team's list
        if (!acc[awayTeamId]) acc[awayTeamId] = [];
        acc[awayTeamId].push({
          opponent: homeTeamId,
          difficulty: fixture.team_a_difficulty,
          isHome: false,
          event: fixture.event
        });
      }
      
      return acc;
    }, {});
    
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
        
        // Calculate fixture score for the player's team (next 5 gameweeks)
        const teamFixtures = fixturesByTeam[player.team] || [];
        const fixtureScore = teamFixtures.reduce((score: number, fixture: any, index: number) => {
          // Weight earlier fixtures more heavily
          const weight = 1 - (index * 0.1); // 1.0, 0.9, 0.8, 0.7, 0.6
          return score + (fixture.difficulty * weight);
        }, 0) / (teamFixtures.length || 1);
        
        // Calculate position-specific fixture bonus
        let positionFixtureBonus = 0;
        
        if (player.element_type === 1) { // Goalkeeper
          // Bonus for teams likely to keep clean sheets
          positionFixtureBonus = calculateCleanSheetPotential(teamFixtures);
        } else if (player.element_type === 2) { // Defender
          // Bonus for teams likely to keep clean sheets
          positionFixtureBonus = calculateCleanSheetPotential(teamFixtures);
        } else if (player.element_type === 3) { // Midfielder
          // Bonus for creative teams facing weaker defenses
          positionFixtureBonus = calculateMidfieldScoreChance(teamFixtures);
        } else if (player.element_type === 4) { // Forward
          // Bonus for teams facing weaker defenses
          positionFixtureBonus = calculateForwardScoreChance(teamFixtures);
        }
        
        // Combined score balancing form, fixtures, and expected points
        const combinedScore = 
          (player.form ? parseFloat(player.form) * 0.3 : 0) + 
          ((6 - fixtureScore) * 0.4) + 
          (positionFixtureBonus * 0.3);
        
        return {
          ...rec,
          player_id: playerId, // Ensure player_id is always available
          players: {
            ...player,
            teams: team || { name: 'Unknown', short_name: 'UNK' }
          },
          fixture_score: fixtureScore,
          position_fixture_bonus: positionFixtureBonus,
          combined_score: combinedScore,
          upcoming_fixtures: teamFixtures.slice(0, 5)
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
        
        // Calculate fixture score for the player's team (next 5 gameweeks)
        const teamFixtures = fixturesByTeam[player.team] || [];
        const fixtureScore = teamFixtures.reduce((score: number, fixture: any, index: number) => {
          // Weight earlier fixtures more heavily
          const weight = 1 - (index * 0.1); // 1.0, 0.9, 0.8, 0.7, 0.6
          return score + (fixture.difficulty * weight);
        }, 0) / (teamFixtures.length || 1);
        
        return {
          ...rec,
          player_id: playerId, // Ensure player_id is always available
          players: {
            ...player,
            teams: team || { name: 'Unknown', short_name: 'UNK' }
          },
          fixture_score: fixtureScore,
          upcoming_fixtures: teamFixtures.slice(0, 5)
        };
      }
      return rec;
    }).filter(Boolean);
    
    // If user team is available, personalize recommendations
    if (userTeam) {
      try {
        // Extract player IDs and positions from user's team
        const userPlayers = userTeam.team.map((pick: any) => ({
          id: pick.player.id,
          position: pick.player.element_type,
          teamId: pick.player.team
        }));
        
        const userPlayerIds = userPlayers.map((p: any) => p.id);
        const userPositionCounts = userPlayers.reduce((counts: any, player: any) => {
          counts[player.position] = (counts[player.position] || 0) + 1;
          return counts;
        }, {});
        
        // Identify positions that might need strengthening (less than optimal count)
        const positionTargets = {
          1: 2,  // 2 goalkeepers
          2: 5,  // 5 defenders
          3: 5,  // 5 midfielders
          4: 3   // 3 forwards
        };
        
        const weakPositions = Object.entries(positionTargets).filter(
          ([position, target]) => (userPositionCounts[position] || 0) < (target as number)
        ).map(([position]) => parseInt(position));
        
        // Find positions with injured or flagged players
        const injuredPositions = userTeam.team
          .filter((pick: any) => 
            pick.player.status !== 'a' && 
            pick.player.status !== ''
          )
          .map((pick: any) => pick.player.element_type);
        
        // Combine weak and injured positions for prioritization
        const priorityPositions = Array.from(new Set([...weakPositions, ...injuredPositions]));
        
        // Filter sell recommendations to only include players in the user's team
        sellRecommendations = sellRecommendations.filter((rec: any) => 
          userPlayerIds.includes(rec.player_id)
        );
        
        // Filter buy recommendations to exclude players already in the user's team
        let filteredBuyRecommendations = buyRecommendations.filter((rec: any) => 
          !userPlayerIds.includes(rec.player_id)
        );
        
        // Boost recommendation scores for priority positions
        filteredBuyRecommendations = filteredBuyRecommendations.map(rec => {
          const positionBoost = priorityPositions.includes(rec.players.element_type) ? 1.5 : 1;
          return {
            ...rec,
            combined_score: rec.combined_score * positionBoost,
            position_priority: priorityPositions.includes(rec.players.element_type)
          };
        });
        
        // For each player in the user's team, find similar players as potential replacements
        const positionSpecificRecommendations = userTeam.team.flatMap((pick: any) => {
          // Only consider players that might need replacing
          if (
            pick.player.status !== 'a' || 
            pick.player.form < 4 || 
            sellRecommendations.some(sell => sell.player_id === pick.player.id)
          ) {
            // Find players in same position with better fixtures/form
            return filteredBuyRecommendations
              .filter(rec => 
                rec.players.element_type === pick.player.element_type &&
                !userPlayerIds.includes(rec.player_id) &&
                (
                  rec.combined_score > (pick.player.form ? parseFloat(pick.player.form) : 0) ||
                  rec.fixture_score < 3 // Better fixtures
                )
              )
              .map(rec => ({
                ...rec,
                // Calculate similarity to the player being replaced
                replacing_player: pick.player.web_name,
                similarity_score: calculatePlayerSimilarity(pick.player, rec.players),
                recommendation_reason: getRecommendationReason(pick.player, rec.players, rec.fixture_score)
              }));
          }
          return [];
        });
        
        // Combine general recommendations with position-specific ones
        // and sort by combined score
        buyRecommendations = [...filteredBuyRecommendations, ...positionSpecificRecommendations]
          // Remove duplicates by player_id
          .filter((rec, index, self) => 
            index === self.findIndex((r) => r.player_id === rec.player_id)
          )
          .sort((a, b) => b.combined_score - a.combined_score);
      } catch (error) {
        console.warn('Error during recommendation personalization:', error);
      }
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

// Helper functions for fixture analysis

function calculateCleanSheetPotential(fixtures: any[]): number {
  // For goalkeepers and defenders, lower difficulty means better clean sheet potential
  return fixtures.reduce((total: number, fixture: any, index: number) => {
    // Weight earlier fixtures more heavily
    const weight = 1 - (index * 0.1); // 1.0, 0.9, 0.8, 0.7, 0.6
    // Invert difficulty (6 - difficulty) so lower difficulty gives higher score
    // 5->1, 4->2, 3->3, 2->4, 1->5
    return total + ((6 - fixture.difficulty) * weight);
  }, 0) / (fixtures.length || 1);
}

function calculateMidfieldScoreChance(fixtures: any[]): number {
  // For midfielders, favor easier fixtures but also consider home fixtures more valuable
  return fixtures.reduce((total: number, fixture: any, index: number) => {
    const weight = 1 - (index * 0.1);
    const homeBonus = fixture.isHome ? 0.5 : 0; // Bonus for home games
    return total + ((6 - fixture.difficulty + homeBonus) * weight);
  }, 0) / (fixtures.length || 1);
}

function calculateForwardScoreChance(fixtures: any[]): number {
  // For forwards, easier fixtures are more valuable for scoring potential
  return fixtures.reduce((total: number, fixture: any, index: number) => {
    const weight = 1 - (index * 0.1);
    const homeBonus = fixture.isHome ? 0.7 : 0; // Bigger bonus for home games for forwards
    return total + ((6 - fixture.difficulty + homeBonus) * weight);
  }, 0) / (fixtures.length || 1);
}

function calculatePlayerSimilarity(player1: any, player2: any): number {
  // Compare relevant metrics depending on position
  const metrics = [
    'goals_scored', 
    'assists', 
    'bonus', 
    'bps', 
    'ict_index',
    'minutes',
    'clean_sheets'
  ];
  
  let totalWeight = 0;
  let similarityScore = 0;
  
  metrics.forEach(metric => {
    // Skip if metric doesn't exist on either player
    if (player1[metric] === undefined || player2[metric] === undefined) return;
    
    let weight = 1;
    
    // Apply position-specific weights
    if (player1.element_type === 1 && metric === 'clean_sheets') weight = 3;
    if (player1.element_type === 2 && metric === 'clean_sheets') weight = 2;
    if (player1.element_type === 3 && (metric === 'goals_scored' || metric === 'assists')) weight = 2;
    if (player1.element_type === 4 && metric === 'goals_scored') weight = 3;
    
    const normalizedDiff = Math.abs(player1[metric] - player2[metric]) / 
      (Math.max(player1[metric], player2[metric]) || 1);
    
    similarityScore += (1 - normalizedDiff) * weight;
    totalWeight += weight;
  });
  
  return totalWeight > 0 ? similarityScore / totalWeight : 0;
}

function getRecommendationReason(currentPlayer: any, recommendedPlayer: any, fixtureScore: number): string {
  const reasons = [];
  
  // Check fixtures
  if (fixtureScore < 3) {
    reasons.push("favorable upcoming fixtures");
  }
  
  // Check form
  if (
    recommendedPlayer.form && 
    currentPlayer.form &&
    parseFloat(recommendedPlayer.form) > parseFloat(currentPlayer.form)
  ) {
    reasons.push(`better current form (${recommendedPlayer.form} vs ${currentPlayer.form})`);
  }
  
  // Check injury status
  if (currentPlayer.status !== 'a' && recommendedPlayer.status === 'a') {
    reasons.push("currently available to play (replacing injured/doubtful player)");
  }
  
  // Check points potential
  if (
    recommendedPlayer.points_per_game && 
    currentPlayer.points_per_game &&
    parseFloat(recommendedPlayer.points_per_game) > parseFloat(currentPlayer.points_per_game)
  ) {
    reasons.push(`higher points per game (${recommendedPlayer.points_per_game} vs ${currentPlayer.points_per_game})`);
  }
  
  // If no specific reasons, give a generic one
  if (reasons.length === 0) {
    reasons.push("potentially better option in this position");
  }
  
  return reasons.join(", ");
} 