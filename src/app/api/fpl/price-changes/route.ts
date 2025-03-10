import { NextResponse } from 'next/server';
import { getBootstrapStatic } from '../utils';

export async function GET() {
  try {
    // Fetch bootstrap static data
    const bootstrapData = await getBootstrapStatic();
    const { elements: players, teams } = bootstrapData;

    // Find players with price changes
    const playersWithPriceChanges = players.filter((player: any) => 
      player.cost_change_event !== 0
    );

    // Process price rises and falls
    const priceRises = playersWithPriceChanges
      .filter((player: any) => player.cost_change_event > 0)
      .sort((a: any, b: any) => b.cost_change_event - a.cost_change_event)
      .slice(0, 5)
      .map((player: any) => processPlayer(player, teams));

    const priceFalls = playersWithPriceChanges
      .filter((player: any) => player.cost_change_event < 0)
      .sort((a: any, b: any) => a.cost_change_event - b.cost_change_event)
      .slice(0, 5)
      .map((player: any) => processPlayer(player, teams));

    return NextResponse.json({
      priceRises,
      priceFalls,
    });
  } catch (error) {
    console.error('Error in price-changes API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price changes data' },
      { status: 500 }
    );
  }
}

// Helper function to process player data
function processPlayer(player: any, teams: any[]) {
  const team = teams.find((t: any) => t.id === player.team);
  const newPrice = player.now_cost / 10;
  const oldPrice = (player.now_cost - player.cost_change_event) / 10;
  
  // Ensure ownership is a number
  let ownership = 0;
  try {
    ownership = parseFloat(player.selected_by_percent);
  } catch (e) {
    console.warn(`Could not parse ownership for player ${player.id}:`, e);
  }
  
  return {
    id: player.id,
    name: `${player.first_name} ${player.second_name}`,
    team: team ? team.short_name : 'Unknown',
    position: getPositionAbbreviation(player.element_type),
    oldPrice,
    newPrice,
    ownership,
  };
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