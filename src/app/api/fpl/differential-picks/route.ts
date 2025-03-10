import { NextResponse } from 'next/server';
import { getBootstrapStatic, getFixtures } from '../utils';

export async function GET() {
  try {
    // Fetch bootstrap static data and fixtures
    const bootstrapData = await getBootstrapStatic();
    const fixturesData = await getFixtures();
    const { elements: players, teams } = bootstrapData;

    // Filter for future fixtures only
    const futureFixtures = fixturesData.filter((fixture: any) => 
      fixture.finished === false && 
      fixture.event !== null // Ensure the fixture is assigned to a gameweek
    );

    // If no future fixtures are found, use the next fixtures regardless of status
    const fixtures = futureFixtures.length > 0 
      ? futureFixtures 
      : fixturesData.slice(0, 100); // Take a reasonable number of fixtures

    // Find differential picks (low ownership, high expected points)
    const differentialPicks = players
      .filter((player: any) => {
        // Filter for players with less than 10% ownership
        let ownership = 0;
        try {
          ownership = parseFloat(player.selected_by_percent) || 0;
        } catch (e) {
          console.warn(`Could not parse ownership for player ${player.id}:`, e);
        }
        return ownership < 10 && ownership > 0.5 && player.minutes > 270; // At least played 3 full matches
      })
      .sort((a: any, b: any) => {
        // Sort by points per game (higher first)
        return b.points_per_game - a.points_per_game;
      })
      .slice(0, 10)
      .map((player: any) => {
        const team = teams.find((t: any) => t.id === player.team);
        
        // Find next fixture for the player's team
        const nextFixture = fixtures
          .filter((f: any) => f.team_h === player.team || f.team_a === player.team)
          .sort((a: any, b: any) => {
            // Sort by event (gameweek) if available
            if (a.event && b.event) return a.event - b.event;
            return 0;
          })[0]; // Take the first fixture
        
        let nextFixtureString = 'No fixture';
        
        if (nextFixture) {
          const isHome = nextFixture.team_h === player.team;
          const opponentId = isHome ? nextFixture.team_a : nextFixture.team_h;
          const opponentTeam = teams.find((t: any) => t.id === opponentId);
          
          nextFixtureString = `${opponentTeam ? opponentTeam.short_name : 'UNK'} (${isHome ? 'H' : 'A'})`;
          
          // Add gameweek if available
          if (nextFixture.event) {
            nextFixtureString += ` GW${nextFixture.event}`;
          }
        }
        
        // Calculate expected points based on form and fixture difficulty
        const expectedPoints = parseFloat(player.points_per_game) * 1.1; // Simple estimation
        
        // Ensure ownership is a number
        let ownership = 0;
        try {
          ownership = parseFloat(player.selected_by_percent) || 0;
        } catch (e) {
          console.warn(`Could not parse ownership for player ${player.id}:`, e);
        }
        
        return {
          id: player.id,
          name: `${player.first_name} ${player.second_name}`,
          team: team ? team.short_name : 'Unknown',
          position: getPositionAbbreviation(player.element_type),
          price: player.now_cost / 10,
          ownership,
          expectedPoints,
          nextFixture: nextFixtureString,
        };
      });

    return NextResponse.json(differentialPicks);
  } catch (error) {
    console.error('Error in differential-picks API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch differential picks data' },
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