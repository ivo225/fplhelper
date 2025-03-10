// FPL API endpoints
const FPL_API_BASE_URL = 'https://fantasy.premierleague.com/api';
const BOOTSTRAP_STATIC_URL = `${FPL_API_BASE_URL}/bootstrap-static/`;
const FIXTURES_URL = `${FPL_API_BASE_URL}/fixtures/`;
const ELEMENT_SUMMARY_URL = `${FPL_API_BASE_URL}/element-summary/`;

// Fetch data from the FPL API
export async function fetchFplData(url: string) {
  try {
    console.log(`Fetching data from: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FPL-Analytics/1.0',
      },
      cache: 'no-store', // Disable caching to ensure fresh data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching FPL data:', error);
    throw error;
  }
}

// Get all bootstrap static data (players, teams, etc.)
export async function getBootstrapStatic() {
  return fetchFplData(BOOTSTRAP_STATIC_URL);
}

// Get all fixtures
export async function getFixtures() {
  return fetchFplData(FIXTURES_URL);
}

// Get player details
export async function getPlayerSummary(playerId: number) {
  return fetchFplData(`${ELEMENT_SUMMARY_URL}${playerId}/`);
}

// Calculate player form from history
export function calculatePlayerForm(history: any[]) {
  // Get the last 5 games or fewer if not available
  const recentGames = history.slice(-5);
  return recentGames.map(game => game.total_points);
} 