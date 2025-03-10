#!/usr/bin/env node

/**
 * This script inserts sample data for testing.
 * It can be run from the command line with:
 * node scripts/insert-sample-data.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertSampleCaptainRecommendations() {
  console.log('Inserting sample captain recommendations...');
  
  const { error } = await supabase
    .from('captain_recommendations')
    .upsert([
      {
        gameweek: 1,
        player_id: 1, // Assuming player with ID 1 exists
        rank: 1,
        points_prediction: 12.5,
        confidence_score: 0.85,
        reasoning: 'Strong home fixture against a weak defensive team. Has been in excellent form and is on penalties.',
        created_at: new Date().toISOString()
      },
      {
        gameweek: 1,
        player_id: 2, // Assuming player with ID 2 exists
        rank: 2,
        points_prediction: 10.2,
        confidence_score: 0.75,
        reasoning: 'Consistent performer with a favorable fixture. Has returned in 4 of the last 5 gameweeks.',
        created_at: new Date().toISOString()
      },
      {
        gameweek: 1,
        player_id: 3, // Assuming player with ID 3 exists
        rank: 3,
        points_prediction: 9.8,
        confidence_score: 0.7,
        reasoning: 'Playing against a team that has conceded multiple goals in recent matches. On set pieces and has good goal threat.',
        created_at: new Date().toISOString()
      }
    ]);
  
  if (error) {
    console.error('Error inserting sample captain recommendations:', error);
    return false;
  }
  
  console.log('Sample captain recommendations inserted successfully!');
  return true;
}

async function insertSampleTransferRecommendations() {
  console.log('Inserting sample transfer recommendations...');
  
  // Insert buy recommendations
  const { error: buyError } = await supabase
    .from('transfer_recommendations')
    .upsert([
      {
        gameweek: 1,
        player_id: 4, // Assuming player with ID 4 exists
        type: 'buy',
        reasoning: 'Great upcoming fixtures and has been in excellent form. Expected to rise in price soon.',
        expected_points: 25.5,
        confidence_score: 0.8,
        created_at: new Date().toISOString()
      },
      {
        gameweek: 1,
        player_id: 5, // Assuming player with ID 5 exists
        type: 'buy',
        reasoning: 'Returned from injury and looks sharp. Fixtures turn favorable from GW2 onwards.',
        expected_points: 22.3,
        confidence_score: 0.75,
        created_at: new Date().toISOString()
      }
    ]);
  
  if (buyError) {
    console.error('Error inserting sample buy recommendations:', buyError);
    return false;
  }
  
  // Insert sell recommendations
  const { error: sellError } = await supabase
    .from('transfer_recommendations')
    .upsert([
      {
        gameweek: 1,
        player_id: 6, // Assuming player with ID 6 exists
        type: 'sell',
        reasoning: 'Difficult upcoming fixtures and has been out of form. Expected to drop in price.',
        confidence_score: 0.85,
        created_at: new Date().toISOString()
      },
      {
        gameweek: 1,
        player_id: 7, // Assuming player with ID 7 exists
        type: 'sell',
        reasoning: 'Injury concern and team has been struggling to create chances.',
        confidence_score: 0.8,
        created_at: new Date().toISOString()
      }
    ]);
  
  if (sellError) {
    console.error('Error inserting sample sell recommendations:', sellError);
    return false;
  }
  
  console.log('Sample transfer recommendations inserted successfully!');
  return true;
}

async function insertSampleDifferentialRecommendations() {
  console.log('Inserting sample differential recommendations...');
  
  const { error } = await supabase
    .from('differential_recommendations')
    .upsert([
      {
        gameweek: 1,
        player_id: 8, // Assuming player with ID 8 exists
        rank: 1,
        predicted_points: 15.2,
        reasoning: 'Low ownership but has great underlying stats. Fixtures are turning favorable.',
        confidence_score: 0.75,
        created_at: new Date().toISOString()
      },
      {
        gameweek: 1,
        player_id: 9, // Assuming player with ID 9 exists
        rank: 2,
        predicted_points: 12.8,
        reasoning: 'New signing who has impressed in training. Expected to start and has good goal threat.',
        confidence_score: 0.7,
        created_at: new Date().toISOString()
      },
      {
        gameweek: 1,
        player_id: 10, // Assuming player with ID 10 exists
        rank: 3,
        predicted_points: 11.5,
        reasoning: 'Returned from injury and looks sharp. Low ownership due to previous absence.',
        confidence_score: 0.65,
        created_at: new Date().toISOString()
      }
    ]);
  
  if (error) {
    console.error('Error inserting sample differential recommendations:', error);
    return false;
  }
  
  console.log('Sample differential recommendations inserted successfully!');
  return true;
}

async function insertSamplePlayers() {
  console.log('Inserting sample players...');
  
  const { error } = await supabase
    .from('players')
    .upsert([
      {
        id: 1,
        code: 1001,
        first_name: 'Mohamed',
        second_name: 'Salah',
        web_name: 'Salah',
        team: 1, // Assuming team with ID 1 exists
        position: 3, // Midfielder
        now_cost: 130, // £13.0m
        selected_by_percent: 45.2,
        form: '8.5',
        points_per_game: '7.2',
        total_points: 220,
        minutes: 2700,
        goals_scored: 22,
        assists: 12,
        clean_sheets: 10,
        goals_conceded: 30,
        own_goals: 0,
        penalties_saved: 0,
        penalties_missed: 1,
        yellow_cards: 2,
        red_cards: 0,
        saves: 0,
        bonus: 25,
        bps: 850,
        influence: '1200.5',
        creativity: '950.2',
        threat: '1100.8',
        ict_index: '325.5',
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        code: 1002,
        first_name: 'Erling',
        second_name: 'Haaland',
        web_name: 'Haaland',
        team: 2, // Assuming team with ID 2 exists
        position: 4, // Forward
        now_cost: 140, // £14.0m
        selected_by_percent: 65.8,
        form: '9.2',
        points_per_game: '8.5',
        total_points: 250,
        minutes: 2500,
        goals_scored: 30,
        assists: 5,
        clean_sheets: 8,
        goals_conceded: 25,
        own_goals: 0,
        penalties_saved: 0,
        penalties_missed: 0,
        yellow_cards: 3,
        red_cards: 0,
        saves: 0,
        bonus: 30,
        bps: 900,
        influence: '1300.5',
        creativity: '450.2',
        threat: '1400.8',
        ict_index: '350.5',
        updated_at: new Date().toISOString()
      },
      {
        id: 3,
        code: 1003,
        first_name: 'Kevin',
        second_name: 'De Bruyne',
        web_name: 'De Bruyne',
        team: 2, // Assuming team with ID 2 exists
        position: 3, // Midfielder
        now_cost: 105, // £10.5m
        selected_by_percent: 25.3,
        form: '7.8',
        points_per_game: '6.5',
        total_points: 180,
        minutes: 2200,
        goals_scored: 8,
        assists: 18,
        clean_sheets: 8,
        goals_conceded: 25,
        own_goals: 0,
        penalties_saved: 0,
        penalties_missed: 0,
        yellow_cards: 2,
        red_cards: 0,
        saves: 0,
        bonus: 20,
        bps: 800,
        influence: '950.5',
        creativity: '1200.2',
        threat: '800.8',
        ict_index: '300.5',
        updated_at: new Date().toISOString()
      },
      {
        id: 4,
        code: 1004,
        first_name: 'Bukayo',
        second_name: 'Saka',
        web_name: 'Saka',
        team: 3, // Assuming team with ID 3 exists
        position: 3, // Midfielder
        now_cost: 95, // £9.5m
        selected_by_percent: 35.7,
        form: '8.1',
        points_per_game: '6.8',
        total_points: 200,
        minutes: 2600,
        goals_scored: 15,
        assists: 10,
        clean_sheets: 12,
        goals_conceded: 28,
        own_goals: 0,
        penalties_saved: 0,
        penalties_missed: 0,
        yellow_cards: 1,
        red_cards: 0,
        saves: 0,
        bonus: 22,
        bps: 820,
        influence: '1000.5',
        creativity: '900.2',
        threat: '950.8',
        ict_index: '290.5',
        updated_at: new Date().toISOString()
      },
      {
        id: 5,
        code: 1005,
        first_name: 'Son',
        second_name: 'Heung-min',
        web_name: 'Son',
        team: 4, // Assuming team with ID 4 exists
        position: 3, // Midfielder
        now_cost: 100, // £10.0m
        selected_by_percent: 28.4,
        form: '7.5',
        points_per_game: '6.2',
        total_points: 190,
        minutes: 2500,
        goals_scored: 18,
        assists: 8,
        clean_sheets: 9,
        goals_conceded: 32,
        own_goals: 0,
        penalties_saved: 0,
        penalties_missed: 0,
        yellow_cards: 2,
        red_cards: 0,
        saves: 0,
        bonus: 18,
        bps: 780,
        influence: '980.5',
        creativity: '850.2',
        threat: '1050.8',
        ict_index: '295.5',
        updated_at: new Date().toISOString()
      },
      {
        id: 6,
        code: 1006,
        first_name: 'Bruno',
        second_name: 'Fernandes',
        web_name: 'Fernandes',
        team: 5, // Assuming team with ID 5 exists
        position: 3, // Midfielder
        now_cost: 85, // £8.5m
        selected_by_percent: 22.1,
        form: '6.2',
        points_per_game: '5.8',
        total_points: 170,
        minutes: 2700,
        goals_scored: 10,
        assists: 12,
        clean_sheets: 8,
        goals_conceded: 35,
        own_goals: 0,
        penalties_saved: 0,
        penalties_missed: 1,
        yellow_cards: 5,
        red_cards: 0,
        saves: 0,
        bonus: 15,
        bps: 750,
        influence: '920.5',
        creativity: '1100.2',
        threat: '850.8',
        ict_index: '285.5',
        updated_at: new Date().toISOString()
      },
      {
        id: 7,
        code: 1007,
        first_name: 'Trent',
        second_name: 'Alexander-Arnold',
        web_name: 'Alexander-Arnold',
        team: 1, // Assuming team with ID 1 exists
        position: 2, // Defender
        now_cost: 80, // £8.0m
        selected_by_percent: 18.5,
        form: '5.8',
        points_per_game: '5.2',
        total_points: 160,
        minutes: 2600,
        goals_scored: 2,
        assists: 12,
        clean_sheets: 12,
        goals_conceded: 25,
        own_goals: 0,
        penalties_saved: 0,
        penalties_missed: 0,
        yellow_cards: 3,
        red_cards: 0,
        saves: 0,
        bonus: 16,
        bps: 760,
        influence: '850.5',
        creativity: '1050.2',
        threat: '450.8',
        ict_index: '235.5',
        updated_at: new Date().toISOString()
      },
      {
        id: 8,
        code: 1008,
        first_name: 'Cole',
        second_name: 'Palmer',
        web_name: 'Palmer',
        team: 6, // Assuming team with ID 6 exists
        position: 3, // Midfielder
        now_cost: 55, // £5.5m
        selected_by_percent: 8.2,
        form: '7.2',
        points_per_game: '5.5',
        total_points: 120,
        minutes: 1800,
        goals_scored: 8,
        assists: 6,
        clean_sheets: 5,
        goals_conceded: 20,
        own_goals: 0,
        penalties_saved: 0,
        penalties_missed: 0,
        yellow_cards: 2,
        red_cards: 0,
        saves: 0,
        bonus: 10,
        bps: 600,
        influence: '750.5',
        creativity: '680.2',
        threat: '720.8',
        ict_index: '215.5',
        updated_at: new Date().toISOString()
      },
      {
        id: 9,
        code: 1009,
        first_name: 'Dominic',
        second_name: 'Solanke',
        web_name: 'Solanke',
        team: 7, // Assuming team with ID 7 exists
        position: 4, // Forward
        now_cost: 65, // £6.5m
        selected_by_percent: 5.8,
        form: '6.5',
        points_per_game: '4.8',
        total_points: 110,
        minutes: 2000,
        goals_scored: 12,
        assists: 3,
        clean_sheets: 4,
        goals_conceded: 25,
        own_goals: 0,
        penalties_saved: 0,
        penalties_missed: 1,
        yellow_cards: 4,
        red_cards: 0,
        saves: 0,
        bonus: 8,
        bps: 550,
        influence: '680.5',
        creativity: '320.2',
        threat: '850.8',
        ict_index: '185.5',
        updated_at: new Date().toISOString()
      },
      {
        id: 10,
        code: 1010,
        first_name: 'Eberechi',
        second_name: 'Eze',
        web_name: 'Eze',
        team: 8, // Assuming team with ID 8 exists
        position: 3, // Midfielder
        now_cost: 60, // £6.0m
        selected_by_percent: 4.2,
        form: '6.8',
        points_per_game: '4.5',
        total_points: 100,
        minutes: 1700,
        goals_scored: 6,
        assists: 5,
        clean_sheets: 4,
        goals_conceded: 18,
        own_goals: 0,
        penalties_saved: 0,
        penalties_missed: 0,
        yellow_cards: 1,
        red_cards: 0,
        saves: 0,
        bonus: 7,
        bps: 520,
        influence: '620.5',
        creativity: '580.2',
        threat: '650.8',
        ict_index: '175.5',
        updated_at: new Date().toISOString()
      }
    ]);
  
  if (error) {
    console.error('Error inserting sample players:', error);
    return false;
  }
  
  console.log('Sample players inserted successfully!');
  return true;
}

async function insertSampleTeams() {
  console.log('Inserting sample teams...');
  
  const { error } = await supabase
    .from('teams')
    .upsert([
      {
        id: 1,
        name: 'Liverpool',
        short_name: 'LIV',
        strength: 4,
        strength_attack_home: 5,
        strength_attack_away: 4,
        strength_defence_home: 4,
        strength_defence_away: 3,
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Manchester City',
        short_name: 'MCI',
        strength: 5,
        strength_attack_home: 5,
        strength_attack_away: 5,
        strength_defence_home: 4,
        strength_defence_away: 4,
        updated_at: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Arsenal',
        short_name: 'ARS',
        strength: 4,
        strength_attack_home: 4,
        strength_attack_away: 4,
        strength_defence_home: 5,
        strength_defence_away: 4,
        updated_at: new Date().toISOString()
      },
      {
        id: 4,
        name: 'Tottenham',
        short_name: 'TOT',
        strength: 3,
        strength_attack_home: 4,
        strength_attack_away: 3,
        strength_defence_home: 3,
        strength_defence_away: 3,
        updated_at: new Date().toISOString()
      },
      {
        id: 5,
        name: 'Manchester United',
        short_name: 'MUN',
        strength: 3,
        strength_attack_home: 4,
        strength_attack_away: 3,
        strength_defence_home: 3,
        strength_defence_away: 2,
        updated_at: new Date().toISOString()
      },
      {
        id: 6,
        name: 'Chelsea',
        short_name: 'CHE',
        strength: 3,
        strength_attack_home: 3,
        strength_attack_away: 3,
        strength_defence_home: 3,
        strength_defence_away: 3,
        updated_at: new Date().toISOString()
      },
      {
        id: 7,
        name: 'Bournemouth',
        short_name: 'BOU',
        strength: 2,
        strength_attack_home: 3,
        strength_attack_away: 2,
        strength_defence_home: 2,
        strength_defence_away: 2,
        updated_at: new Date().toISOString()
      },
      {
        id: 8,
        name: 'Crystal Palace',
        short_name: 'CRY',
        strength: 2,
        strength_attack_home: 3,
        strength_attack_away: 2,
        strength_defence_home: 3,
        strength_defence_away: 2,
        updated_at: new Date().toISOString()
      }
    ]);
  
  if (error) {
    console.error('Error inserting sample teams:', error);
    return false;
  }
  
  console.log('Sample teams inserted successfully!');
  return true;
}

async function main() {
  console.log('Inserting sample data for testing...');
  
  try {
    // Insert sample teams first (for foreign key references)
    await insertSampleTeams();
    
    // Insert sample players
    await insertSamplePlayers();
    
    // Insert sample recommendations
    await insertSampleCaptainRecommendations();
    await insertSampleTransferRecommendations();
    await insertSampleDifferentialRecommendations();
    
    console.log('All sample data inserted successfully!');
  } catch (error) {
    console.error('Error inserting sample data:', error);
    process.exit(1);
  }
}

main(); 