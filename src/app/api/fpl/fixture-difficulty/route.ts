import { NextResponse } from 'next/server';
import { getBootstrapStatic, getFixtures } from '../utils';

export async function GET() {
  try {
    // Fetch bootstrap static data and fixtures
    const bootstrapData = await getBootstrapStatic();
    const fixturesData = await getFixtures();
    const { teams } = bootstrapData;

    console.log(`Fetched ${fixturesData.length} fixtures`);

    // Filter for future fixtures only
    const futureFixtures = fixturesData.filter((fixture: any) => 
      fixture.finished === false && 
      fixture.event !== null // Ensure the fixture is assigned to a gameweek
    );

    console.log(`Found ${futureFixtures.length} future fixtures`);

    // If no future fixtures are found, use all fixtures as a fallback
    const fixtures = futureFixtures.length > 0 
      ? futureFixtures 
      : fixturesData;

    // Calculate fixture difficulty for each team
    const teamFixtures = teams.map((team: any) => {
      // Get next 5 fixtures for this team
      const teamFutureFixtures = fixtures
        .filter((fixture: any) => fixture.team_h === team.id || fixture.team_a === team.id)
        .sort((a: any, b: any) => {
          // Sort by event (gameweek) if available
          if (a.event && b.event) return a.event - b.event;
          return 0;
        })
        .slice(0, 5)
        .map((fixture: any) => {
          const isHome = fixture.team_h === team.id;
          const opponentId = isHome ? fixture.team_a : fixture.team_h;
          
          // Get the difficulty from the fixture
          // FPL API provides team_h_difficulty and team_a_difficulty
          const difficulty = isHome ? fixture.team_h_difficulty : fixture.team_a_difficulty;
          
          return {
            opponent: opponentId,
            difficulty: difficulty || 3, // Default to medium difficulty if not specified
            isHome,
            event: fixture.event,
          };
        });
      
      // Calculate average difficulty
      const totalDifficulty = teamFutureFixtures.reduce((sum: number, fixture: any) => {
        return sum + (fixture.difficulty || 3);
      }, 0);
      
      const avgDifficulty = teamFutureFixtures.length > 0
        ? totalDifficulty / teamFutureFixtures.length
        : 3; // Default to medium difficulty if no fixtures
      
      // Map opponent IDs to team short names
      const mappedFixtures = teamFutureFixtures.map((fixture: any) => {
        const opponentTeam = teams.find((t: any) => t.id === fixture.opponent);
        return {
          opponent: opponentTeam ? opponentTeam.short_name : 'UNK',
          difficulty: fixture.difficulty,
          isHome: fixture.isHome,
          event: fixture.event,
        };
      });

      // Pad with placeholder fixtures if we have fewer than 5
      while (mappedFixtures.length < 5) {
        mappedFixtures.push({
          opponent: 'TBD',
          difficulty: 3,
          isHome: false,
          event: null,
        });
      }

      return {
        id: team.id,
        team: team.short_name,
        nextFiveFixtures: mappedFixtures,
        averageDifficulty: avgDifficulty,
      };
    });

    // Sort by average difficulty (easiest first)
    const sortedTeamFixtures = teamFixtures.sort((a: any, b: any) => a.averageDifficulty - b.averageDifficulty);

    return NextResponse.json(sortedTeamFixtures);
  } catch (error) {
    console.error('Error in fixture-difficulty API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fixture difficulty data' },
      { status: 500 }
    );
  }
} 