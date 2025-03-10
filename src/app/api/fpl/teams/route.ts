import { NextResponse } from 'next/server';
import { getBootstrapStatic } from '../utils';

export async function GET() {
  try {
    // Fetch bootstrap static data
    const bootstrapData = await getBootstrapStatic();
    const { teams } = bootstrapData;

    // Sort teams alphabetically by name
    const sortedTeams = teams.sort((a: any, b: any) => 
      a.name.localeCompare(b.name)
    );

    return NextResponse.json(sortedTeams);
  } catch (error) {
    console.error('Error in teams API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams data' },
      { status: 500 }
    );
  }
} 