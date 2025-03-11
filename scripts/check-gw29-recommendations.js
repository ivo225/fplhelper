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
    // Get transfer recommendations for gameweek 29
    const { data: transferRecs, error: transferError } = await supabase
      .from('transfer_recommendations')
      .select('*')
      .eq('gameweek', 29)
      .order('created_at', { ascending: false });
    
    if (transferError) {
      throw new Error(`Error fetching transfer recommendations: ${transferError.message}`);
    }
    
    console.log(`Found ${transferRecs.length} recommendations for gameweek 29`);
    
    // Group by type
    const buyRecs = transferRecs.filter(rec => rec.type === 'buy');
    const sellRecs = transferRecs.filter(rec => rec.type === 'sell');
    
    console.log(`Buy recommendations: ${buyRecs.length}`);
    console.log(`Sell recommendations: ${sellRecs.length}`);
    
    // Show the most recent recommendations
    console.log('\nRecent Buy Recommendations:');
    console.log('------------------------------');
    
    buyRecs.slice(0, 5).forEach(rec => {
      console.log(`Player ID: ${rec.player_id}`);
      console.log(`Confidence: ${rec.confidence_score}`);
      console.log(`Created: ${rec.created_at}`);
      console.log('------------------------------');
    });
    
    console.log('\nRecent Sell Recommendations:');
    console.log('------------------------------');
    
    sellRecs.slice(0, 5).forEach(rec => {
      console.log(`Player ID: ${rec.player_id}`);
      console.log(`Confidence: ${rec.confidence_score}`);
      console.log(`Created: ${rec.created_at}`);
      console.log('------------------------------');
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkRecommendations(); 