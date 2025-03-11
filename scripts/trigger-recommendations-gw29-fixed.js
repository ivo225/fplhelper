require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertRecommendations() {
  try {
    console.log('Inserting buy recommendations for gameweek 29...');
    
    // Hardcoded buy recommendations
    const buyRecommendations = [
      {
        player_id: 328,
        reasoning: "Mohamed Salah has exceptional form, high points per game, and favorable upcoming fixtures against teams with low defensive difficulty.",
        confidence_score: 95
      },
      {
        player_id: 447,
        reasoning: "Chris Wood is in good form, has a reasonable price, and faces teams with low defensive difficulty in the next fixtures, making him a valuable forward option.",
        confidence_score: 85
      },
      {
        player_id: 401,
        reasoning: "Alexander Isak has a strong goal-scoring record, is in decent form, and has favorable fixtures ahead, especially against teams with low defensive difficulty.",
        confidence_score: 80
      },
      {
        player_id: 71,
        reasoning: "Justin Kluivert offers great value for his price, is in good form, and has upcoming fixtures against teams with low defensive difficulty, making him a smart buy.",
        confidence_score: 75
      },
      {
        player_id: 541,
        reasoning: "Matheus Santos Carneiro Da Cunha is in good form, has a low price, and faces teams with low defensive difficulty in the next fixtures, offering potential for high returns.",
        confidence_score: 70
      }
    ];
    
    // Insert buy recommendations
    for (const rec of buyRecommendations) {
      const { data, error } = await supabase
        .from('transfer_recommendations')
        .insert({
          gameweek: 29,
          type: 'buy',
          player_id: rec.player_id,
          reasoning: rec.reasoning,
          confidence_score: rec.confidence_score,
          created_at: new Date().toISOString()
        })
        .select();
      
      if (error) {
        console.error(`Error inserting buy recommendation for player ${rec.player_id}:`, error);
      } else {
        console.log(`Successfully inserted buy recommendation for player ${rec.player_id}`);
      }
    }
    
    console.log('All buy recommendations inserted successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

insertRecommendations(); 