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

async function checkTableSchema() {
  try {
    // Get a sample row to check the schema
    const { data, error } = await supabase
      .from('transfer_recommendations')
      .select('*')
      .limit(1);
    
    if (error) {
      throw new Error(`Error fetching from transfer_recommendations: ${error.message}`);
    }
    
    if (data && data.length > 0) {
      console.log('Transfer Recommendations Table Schema:');
      console.log('-----------------------------------');
      
      const sampleRow = data[0];
      Object.keys(sampleRow).forEach(key => {
        console.log(`${key}: ${typeof sampleRow[key]} (${sampleRow[key]})`);
      });
    } else {
      console.log('No data found in transfer_recommendations table');
    }
    
    // Try to insert a test buy recommendation
    console.log('\nTrying to insert a test buy recommendation...');
    const { data: insertData, error: insertError } = await supabase
      .from('transfer_recommendations')
      .insert({
        gameweek: 29,
        type: 'buy',
        player_id: 1,
        reasoning: 'Test buy recommendation',
        confidence_score: 99,
        created_at: new Date().toISOString()
      })
      .select();
    
    if (insertError) {
      console.error(`Error inserting test buy recommendation: ${insertError.message}`);
    } else {
      console.log('Test buy recommendation inserted successfully!');
      console.log(insertData);
      
      // Clean up the test data
      await supabase
        .from('transfer_recommendations')
        .delete()
        .eq('id', insertData[0].id);
      
      console.log('Test data cleaned up');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkTableSchema(); 