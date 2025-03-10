#!/usr/bin/env node

/**
 * This script triggers the Next.js API route to generate AI recommendations.
 * It can be run from the command line with:
 * node scripts/trigger-ai-recommendations.js [type]
 */

require('dotenv').config({ path: '.env.local' });

// API details
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_KEY = process.env.API_KEY || 'your-api-key';

// Function to trigger the API route
async function triggerAIRecommendations(type = 'all') {
  try {
    console.log(`Triggering API route to generate ${type} recommendations...`);
    
    const url = `${API_URL}/api/ai-recommendations/generate?type=${type}`;
    console.log(`Accessing URL: ${url}`);
    console.log(`Using API key: ${API_KEY.substring(0, 5)}...`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Response status: ${response.status}`);
      console.error(`Response text: ${errorText.substring(0, 200)}...`);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(`Failed to trigger API route: ${JSON.stringify(errorData)}`);
      } catch (parseError) {
        throw new Error(`Failed to trigger API route: Non-JSON response received`);
      }
    }
    
    const data = await response.json();
    
    console.log('API route triggered successfully!');
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('Error triggering API route:', error);
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

// Trigger the API route
triggerAIRecommendations(type); 