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

async function clearOldRecommendations() {
  try {
    console.log('Clearing old captain recommendations for gameweek 29...');
    
    const { data, error } = await supabase
      .from('captain_recommendations')
      .delete()
      .eq('gameweek', 29);
    
    if (error) {
      throw error;
    }
    
    console.log('Successfully cleared old captain recommendations');
    
  } catch (error) {
    console.error('Error clearing old recommendations:', error.message);
    process.exit(1);
  }
}

// Run the cleanup
clearOldRecommendations(); 