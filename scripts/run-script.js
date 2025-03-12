#!/usr/bin/env node

/**
 * Helper script to run other scripts with the correct environment variables.
 * Usage: node scripts/run-script.js <script-path>
 * Example: node scripts/run-script.js migrations/create-tables.js
 */

require('dotenv').config({ path: '.env.local' });
const { spawn } = require('child_process');
const path = require('path');

// Get the script path from command line arguments
const scriptArg = process.argv[2];

if (!scriptArg) {
  console.error('Error: No script specified');
  console.error('Usage: node scripts/run-script.js <script-path>');
  console.error('Example: node scripts/run-script.js migrations/create-tables.js');
  process.exit(1);
}

// Resolve the script path
const scriptPath = path.resolve(__dirname, scriptArg);

console.log(`Running script: ${scriptPath}`);

// Spawn the script process with the current environment
const scriptProcess = spawn('node', [scriptPath], {
  stdio: 'inherit',
  env: process.env
});

// Handle process exit
scriptProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`Script exited with code ${code}`);
    process.exit(code);
  }
  console.log('Script completed successfully');
});

// Handle process errors
scriptProcess.on('error', (err) => {
  console.error('Failed to start script process:', err);
  process.exit(1);
}); 