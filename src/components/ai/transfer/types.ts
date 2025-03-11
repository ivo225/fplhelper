'use client';

export interface Player {
  id: number;
  first_name: string;
  second_name: string;
  web_name: string;
  team: number;
  position: number;
  element_type: number;
  now_cost: number;
  form: string;
  points_per_game: string;
  total_points: number;
  teams: {
    name: string;
    short_name: string;
  };
  status?: string;
  minutes?: number;
  goals_scored?: number;
  assists?: number;
  clean_sheets?: number;
  bonus?: number;
  bps?: number;
  ict_index?: number;
}

export interface Fixture {
  opponent: number;
  difficulty: number;
  isHome: boolean;
  event: number;
}

export interface TransferRecommendation {
  id: number;
  gameweek: number;
  player_id: number;
  type: 'buy' | 'sell';
  reasoning: string;
  confidence_score: number;
  created_at: string;
  players: Player;
  
  fixture_score?: number;
  position_fixture_bonus?: number;
  combined_score?: number;
  upcoming_fixtures?: Fixture[];
  position_priority?: boolean;
  replacing_player?: string;
  similarity_score?: number;
  recommendation_reason?: string;
  
  is_premium_asset?: boolean;
  adjusted_confidence?: number;
  transfer_in_rating?: number;
}

export interface TransferRecommendationsResponse {
  gameweek: number;
  buy_recommendations: TransferRecommendation[];
  sell_recommendations: TransferRecommendation[];
  updated_at: string;
  is_personalized: boolean;
  status?: 'success' | 'no_recommendations' | 'schema_issue' | 'error';
}

export interface TeamPlayer {
  player: {
    id: number;
    first_name: string;
    second_name: string;
    web_name: string;
    team: number;
    team_name: string;
    team_short_name: string;
    position: number;
    element_type?: number;
    now_cost: number;
    form: string;
    points_per_game: string;
    total_points: number;
    selected_by_percent: string;
    status?: string;
  };
  position: number;
  multiplier: number;
  is_captain: boolean;
  is_vice_captain: boolean;
}

export interface UserTeam {
  manager_id: string;
  gameweek: number;
  team: TeamPlayer[];
  team_by_position: Record<string, TeamPlayer[]>;
  positions: Record<string, string>;
  team_value: number;
  chips: string | null;
  entry_history: any;
}
