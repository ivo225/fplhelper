'use client';

export interface Player {
  id: number;
  first_name: string;
  second_name: string;
  web_name: string;
  team: number;
  position: number;
  now_cost: number;
  form: string;
  points_per_game: string;
  total_points: number;
  teams: {
    name: string;
    short_name: string;
  };
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
    now_cost: number;
    form: string;
    points_per_game: string;
    total_points: number;
    selected_by_percent: string;
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
