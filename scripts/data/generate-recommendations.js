#!/usr/bin/env node

/**
 * This script manually triggers the data sync and recommendation generation.
 * It can be run from the command line with:
 * node scripts/generate-recommendations.js
 */

const https = require('https');

// Base URL - replace with your actual deployment URL in production
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

async function main() {
  console.log('Starting FPL data sync and recommendation generation...');
  
  try {
    // Step 1: Sync FPL data
    console.log('Step 1: Syncing FPL data...');
    const syncResult = await makeRequest(`${BASE_URL}/api/cron/sync-fpl-data`);
    
    if (syncResult.status !== 200) {
      throw new Error(`Failed to sync FPL data: ${JSON.stringify(syncResult)}`);
    }
    
    console.log('FPL data sync completed successfully.');
    console.log(`Current gameweek: ${syncResult.data.currentGameweek}`);
    console.log(`Timestamp: ${syncResult.data.timestamp}`);
    
    // Step 2: Generate recommendations
    console.log('\nStep 2: Generating AI recommendations...');
    const recommendationsResult = await makeRequest(`${BASE_URL}/api/cron/generate-recommendations`);
    
    if (recommendationsResult.status !== 200) {
      throw new Error(`Failed to generate recommendations: ${JSON.stringify(recommendationsResult)}`);
    }
    
    console.log('AI recommendations generated successfully.');
    console.log(`Current gameweek: ${recommendationsResult.data.currentGameweek}`);
    console.log(`Timestamp: ${recommendationsResult.data.timestamp}`);
    
    console.log('\nProcess completed successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main(); 