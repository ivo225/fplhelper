import { NextResponse } from 'next/server';
import { getBootstrapStatic, getPlayerSummary, calculatePlayerForm } from '../utils';

export async function GET() {
  try {
    // Fetch bootstrap static data
    const bootstrapData = await getBootstrapStatic();
    const { elements: players, teams } = bootstrapData;

    // Sort players by total points
    const topPlayers = players
      .sort((a: any, b: any) => b.total_points - a.total_points)
      .slice(0, 10);

    // Get detailed data for each player
    const topPlayersWithDetails = await Promise.all(
      topPlayers.map(async (player: any) => {
        try {
          const playerDetails = await getPlayerSummary(player.id);
          const team = teams.find((t: any) => t.id === player.team);
          
          // Calculate form from history
          const form = calculatePlayerForm(playerDetails.history || []);
          
          return {
            id: player.id,
            name: `${player.first_name} ${player.second_name}`,
            team: team ? team.short_name : 'Unknown',
            position: getPositionAbbreviation(player.element_type),
            points: player.total_points,
            xG: parseFloat(player.expected_goals) || 0,
            xA: parseFloat(player.expected_assists) || 0,
            form,
          };
        } catch (error) {
          console.error(`Error fetching details for player ${player.id}:`, error);
          // Return basic data if detailed fetch fails
          const team = teams.find((t: any) => t.id === player.team);
          return {
            id: player.id,
            name: `${player.first_name} ${player.second_name}`,
            team: team ? team.short_name : 'Unknown',
            position: getPositionAbbreviation(player.element_type),
            points: player.total_points,
            xG: 0,
            xA: 0,
            form: [0, 0, 0, 0, 0],
          };
        }
      })
    );

    return NextResponse.json(topPlayersWithDetails);
  } catch (error) {
    console.error('Error in top-players API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top players data' },
      { status: 500 }
    );
  }
}

// Helper function to convert element_type to position abbreviation
function getPositionAbbreviation(elementType: number) {
  switch (elementType) {
    case 1: return 'GK';
    case 2: return 'DEF';
    case 3: return 'MID';
    case 4: return 'FWD';
    default: return 'UNK';
  }
} 