/**
 * Utility functions for fetching data from the Fantasy Premier League API
 */

const FPL_API_BASE_URL = 'https://fantasy.premierleague.com/api/';

/**
 * Fetches data from the FPL API
 * @param endpoint - The API endpoint to fetch data from
 * @returns The JSON response from the API
 */
export async function fetchFplData(endpoint: string) {
  try {
    const response = await fetch(`${FPL_API_BASE_URL}${endpoint}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      // Add cache: 'no-store' to disable caching for real-time data
      // or use { next: { revalidate: 3600 } } to revalidate every hour
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data from FPL API: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching FPL data:', error);
    throw error;
  }
}

/**
 * Calculates the difficulty rating for a team
 * @param teamId - The ID of the team
 * @param isHome - Whether the team is playing at home
 * @param teams - The list of teams from the FPL API
 * @returns The difficulty rating (1-5)
 */
export function calculateTeamDifficulty(teamId: number, isHome: boolean, teams: any[]) {
  const team = teams.find(t => t.id === teamId);
  if (!team) return 3; // Default to medium difficulty
  
  if (isHome) {
    return Math.round((team.strength_attack_home + team.strength_defence_home) / 2);
  } else {
    return Math.round((team.strength_attack_away + team.strength_defence_away) / 2);
  }
}

/**
 * Maps a difficulty rating to a text representation
 * @param difficulty - The difficulty rating (1-5)
 * @returns The text representation of the difficulty
 */
export function getDifficultyText(difficulty: number): string {
  switch (difficulty) {
    case 1:
      return 'Very Easy';
    case 2:
      return 'Easy';
    case 3:
      return 'Medium';
    case 4:
      return 'Hard';
    case 5:
      return 'Very Hard';
    default:
      return 'Unknown';
  }
}

/**
 * Gets the color class for a difficulty rating
 * @param difficulty - The difficulty rating (1-5)
 * @returns The Tailwind CSS color class
 */
export function getDifficultyColorClass(difficulty: number): string {
  switch (difficulty) {
    case 1:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 2:
      return 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200';
    case 3:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 4:
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 5:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
} 