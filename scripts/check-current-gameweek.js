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

async function checkGameweeks() {
  try {
    // Get all gameweeks
    const { data: gameweeks, error } = await supabase
      .from('events')
      .select('*')
      .order('id');
    
    if (error) {
      throw new Error(`Error fetching gameweeks: ${error.message}`);
    }
    
    console.log('Gameweek Status:');
    console.log('---------------');
    
    gameweeks.forEach(gw => {
      console.log(`Gameweek ${gw.id}: ${
        gw.is_current ? 'CURRENT' : 
        gw.is_next ? 'NEXT' : 
        gw.is_previous ? 'PREVIOUS' : 
        'REGULAR'
      }`);
    });
    
    const currentGW = gameweeks.find(gw => gw.is_current);
    const nextGW = gameweeks.find(gw => gw.is_next);
    
    console.log('\nSummary:');
    console.log(`Current Gameweek: ${currentGW ? currentGW.id : 'None'}`);
    console.log(`Next Gameweek: ${nextGW ? nextGW.id : 'None'}`);
    
    // Check transfer recommendations
    const { data: transferRecs, error: transferError } = await supabase
      .from('transfer_recommendations')
      .select('gameweek, type, count(*)')
      .group('gameweek, type');
    
    if (transferError) {
      console.error(`Error fetching transfer recommendations: ${transferError.message}`);
    } else {
      console.log('\nTransfer Recommendations:');
      transferRecs.forEach(rec => {
        console.log(`Gameweek ${rec.gameweek}, Type: ${rec.type}, Count: ${rec.count}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkGameweeks(); 