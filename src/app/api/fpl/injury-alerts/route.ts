import { NextResponse } from 'next/server';
import { getBootstrapStatic } from '../utils';

export async function GET() {
  try {
    // Fetch bootstrap static data
    const bootstrapData = await getBootstrapStatic();
    const { elements: players, teams } = bootstrapData;

    // Find players with injuries or suspensions
    const injuredPlayers = players
      .filter((player: any) => player.chance_of_playing_next_round !== null && player.chance_of_playing_next_round < 100)
      .sort((a: any, b: any) => {
        // Sort by ownership percentage (higher first)
        const ownershipA = parseFloat(a.selected_by_percent) || 0;
        const ownershipB = parseFloat(b.selected_by_percent) || 0;
        return ownershipB - ownershipA;
      })
      .slice(0, 10)
      .map((player: any) => {
        const team = teams.find((t: any) => t.id === player.team);
        
        // Determine status based on chance of playing
        let status: 'Injured' | 'Doubtful' | 'Suspended' = 'Injured';
        if (player.status === 's') {
          status = 'Suspended';
        } else if (player.chance_of_playing_next_round >= 50) {
          status = 'Doubtful';
        }
        
        // Calculate return date (approximate)
        const today = new Date();
        let returnDate = 'Unknown';
        
        if (status === 'Suspended') {
          // Assume suspension is for 1 match
          const oneWeekLater = new Date(today);
          oneWeekLater.setDate(today.getDate() + 7);
          returnDate = oneWeekLater.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        } else if (player.news && player.news.includes('Expected back')) {
          // Try to extract return date from news
          const match = player.news.match(/Expected back (\d+[a-zA-Z]+ [a-zA-Z]+)/);
          if (match) {
            returnDate = match[1];
          }
        } else if (status === 'Doubtful') {
          // Assume doubtful players might return next gameweek
          const oneWeekLater = new Date(today);
          oneWeekLater.setDate(today.getDate() + 7);
          returnDate = oneWeekLater.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        } else {
          // For injured players with no specific return date, assume 3 weeks
          const threeWeeksLater = new Date(today);
          threeWeeksLater.setDate(today.getDate() + 21);
          returnDate = threeWeeksLater.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        }
        
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
          status,
          returnDate,
          ownership,
          info: player.news || `${status} - no further information`,
        };
      });

    return NextResponse.json(injuredPlayers);
  } catch (error) {
    console.error('Error in injury-alerts API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch injury alerts data' },
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