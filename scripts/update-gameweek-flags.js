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

async function updateGameweekFlags() {
  try {
    console.log('Updating gameweek flags...');
    
    // Reset all gameweek flags
    console.log('Resetting all gameweek flags...');
    const { error: resetError } = await supabase
      .from('events')
      .update({
        is_current: false,
        is_next: false,
        is_previous: false
      })
      .neq('id', 0);
    
    if (resetError) {
      throw new Error(`Error resetting gameweek flags: ${resetError.message}`);
    }
    
    // Set gameweek 28 as previous
    console.log('Setting gameweek 28 as previous...');
    const { error: prevError } = await supabase
      .from('events')
      .update({ is_previous: true })
      .eq('id', 28);
    
    if (prevError) {
      throw new Error(`Error setting gameweek 28 as previous: ${prevError.message}`);
    }
    
    // Set gameweek 29 as current
    console.log('Setting gameweek 29 as current...');
    const { error: currentError } = await supabase
      .from('events')
      .update({ is_current: true })
      .eq('id', 29);
    
    if (currentError) {
      throw new Error(`Error setting gameweek 29 as current: ${currentError.message}`);
    }
    
    // Set gameweek 30 as next
    console.log('Setting gameweek 30 as next...');
    const { error: nextError } = await supabase
      .from('events')
      .update({ is_next: true })
      .eq('id', 30);
    
    if (nextError) {
      throw new Error(`Error setting gameweek 30 as next: ${nextError.message}`);
    }
    
    console.log('Gameweek flags updated successfully!');
    
    // Verify the changes
    const { data: gameweeks, error: verifyError } = await supabase
      .from('events')
      .select('id, is_current, is_next, is_previous')
      .order('id');
    
    if (verifyError) {
      throw new Error(`Error verifying gameweek flags: ${verifyError.message}`);
    }
    
    console.log('\nVerifying gameweek flags:');
    gameweeks.forEach(gw => {
      if (gw.is_current || gw.is_next || gw.is_previous) {
        console.log(`Gameweek ${gw.id}: ${
          gw.is_current ? 'CURRENT' : 
          gw.is_next ? 'NEXT' : 
          gw.is_previous ? 'PREVIOUS' : 
          'REGULAR'
        }`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateGameweekFlags(); 