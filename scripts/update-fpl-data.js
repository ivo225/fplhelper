#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting FPL data update process...');

try {
  // Step 1: Sync FPL data
  console.log('\n📊 Step 1: Syncing FPL data...');
  execSync('node scripts/data/sync-fpl-data.js', { stdio: 'inherit' });
  
  // Step 2: Generate captain recommendations
  console.log('\n👑 Step 2: Generating captain recommendations...');
  execSync('node scripts/data/generate-captain-recommendations.js', { stdio: 'inherit' });
  
  // Step 3: Validate captain recommendations
  console.log('\n✅ Step 3: Validating captain recommendations...');
  execSync('node scripts/utils/validate-captain-recommendations.js', { stdio: 'inherit' });
  
  console.log('\n🎉 FPL data update completed successfully!');
  console.log(`⏰ Completed at: ${new Date().toLocaleString()}`);
} catch (error) {
  console.error('\n❌ Error during FPL data update process:');
  console.error(error.message);
  process.exit(1);
} 