import { NextResponse } from 'next/server';
import { getBootstrapStatic, getFixtures } from '../../utils';

export async function GET() {
  try {
    // Fetch bootstrap static data and fixtures
    const bootstrapData = await getBootstrapStatic();
    const fixturesData = await getFixtures();
    const { teams } = bootstrapData;

    // Filter for future fixtures only
    const futureFixtures = fixturesData.filter((fixture: any) => 
      fixture.finished === false && 
      fixture.event !== null // Ensure the fixture is assigned to a gameweek
    );

    // If no future fixtures are found, use all fixtures as a fallback
    const fixtures = futureFixtures.length > 0 
      ? futureFixtures 
      : fixturesData;

    // Sort fixtures by event (gameweek) and kickoff time
    const sortedFixtures = fixtures.sort((a: any, b: any) => {
      // First sort by event (gameweek)
      if (a.event !== b.event) {
        if (a.event === null) return 1;
        if (b.event === null) return -1;
        return a.event - b.event;
      }
      
      // Then sort by kickoff time
      if (a.kickoff_time === null) return 1;
      if (b.kickoff_time === null) return -1;
      return new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime();
    });

    // Get all available gameweeks
    const gameweeks = Array.from(
      new Set(
        sortedFixtures
          .filter((fixture: any) => fixture.event !== null)
          .map((fixture: any) => fixture.event)
      )
    ).sort((a: any, b: any) => a - b);

    // Map team IDs to team names
    const matchesWithTeamNames = sortedFixtures.map((fixture: any) => {
      const homeTeam = teams.find((team: any) => team.id === fixture.team_h);
      const awayTeam = teams.find((team: any) => team.id === fixture.team_a);
      
      return {
        id: fixture.id,
        event: fixture.event,
        kickoff_time: fixture.kickoff_time,
        team_h: fixture.team_h,
        team_a: fixture.team_a,
        team_h_name: homeTeam ? homeTeam.name : `Team ${fixture.team_h}`,
        team_a_name: awayTeam ? awayTeam.name : `Team ${fixture.team_a}`,
        team_h_difficulty: fixture.team_h_difficulty || 3,
        team_a_difficulty: fixture.team_a_difficulty || 3,
      };
    });

    return NextResponse.json({
      matches: matchesWithTeamNames,
      gameweeks,
    });
  } catch (error) {
    console.error('Error in upcoming fixtures API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upcoming fixtures data' },
      { status: 500 }
    );
  }
} 