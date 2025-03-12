#!/usr/bin/env node

/**
 * This script triggers the Supabase Edge Function to generate AI recommendations.
 * It can be run from the command line with:
 * node scripts/trigger-edge-function.js
 */

require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

// Supabase project details
const SUPABASE_PROJECT_ID = 'swmhulpiceqcelyjyyzj';
const API_KEY = process.env.API_KEY || 'your-api-key';

// Function to trigger the Edge Function
async function triggerEdgeFunction(type = 'all') {
  try {
    console.log(`Triggering Edge Function to generate ${type} recommendations...`);
    
    const url = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/generate-recommendations?type=${type}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to trigger Edge Function: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    
    console.log('Edge Function triggered successfully!');
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('Error triggering Edge Function:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const type = args[0] || 'all';

// Validate type
const validTypes = ['all', 'captains', 'transfers', 'differentials'];
if (!validTypes.includes(type)) {
  console.error(`Invalid type: ${type}. Valid types are: ${validTypes.join(', ')}`);
  process.exit(1);
}

// Trigger the Edge Function
triggerEdgeFunction(type); 