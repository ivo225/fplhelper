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

async function checkRecommendations() {
  try {
    // Get transfer recommendations
    const { data: transferRecs, error: transferError } = await supabase
      .from('transfer_recommendations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (transferError) {
      throw new Error(`Error fetching transfer recommendations: ${transferError.message}`);
    }
    
    console.log('Recent Transfer Recommendations:');
    console.log('------------------------------');
    
    transferRecs.forEach(rec => {
      console.log(`ID: ${rec.id}`);
      console.log(`Gameweek: ${rec.gameweek}`);
      console.log(`Type: ${rec.type}`);
      console.log(`Player ID: ${rec.player_id}`);
      console.log(`Confidence: ${rec.confidence_score}`);
      console.log(`Created: ${rec.created_at}`);
      console.log('------------------------------');
    });
    
    // Count recommendations by gameweek
    const { data: countByGameweek, error: countError } = await supabase
      .from('transfer_recommendations')
      .select('gameweek, count(*)')
      .order('gameweek')
      .limit(100);
    
    if (countError) {
      console.error(`Error counting recommendations: ${countError.message}`);
    } else if (countByGameweek) {
      console.log('\nRecommendations by Gameweek:');
      countByGameweek.forEach(item => {
        console.log(`Gameweek ${item.gameweek}: ${item.count} recommendations`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkRecommendations(); 