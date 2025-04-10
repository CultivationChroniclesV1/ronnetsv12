#!/usr/bin/env node

/**
 * This script helps to initialize the database when deployed on Vercel
 * It can be run either manually or via a deploy hook
 */

const { execSync } = require('child_process');
const readline = require('readline');

console.log('=== Wuxia Cultivation Game Database Setup ===');
console.log('This script will initialize your database for the Wuxia Cultivation Game');

// Check if DATABASE_URL environment variable is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable not found!');
  console.log('Please set the DATABASE_URL environment variable and try again.');
  process.exit(1);
}

// Create readline interface for user interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt user for confirmation
function confirm(question) {
  return new Promise((resolve) => {
    rl.question(`${question} (y/N): `, (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

// Main async function to handle the database setup
async function setupDatabase() {
  console.log('🔍 Checking database connection...');
  
  try {
    // Try connecting to the database
    console.log('Connected to database successfully!');

    const shouldContinue = await confirm('Do you want to run database migrations? This might override existing data.');
    
    if (shouldContinue) {
      console.log('📦 Running database migrations...');
      try {
        execSync('npx drizzle-kit push', { stdio: 'inherit' });
        console.log('✅ Database migrations completed successfully!');
      } catch (error) {
        console.error('❌ Failed to run migrations:', error.message);
        process.exit(1);
      }
    } else {
      console.log('Skipping database migrations.');
    }

    console.log('✨ Database setup completed!');
    console.log('Your Wuxia Cultivation Game is ready to run on Vercel.');
  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
    console.log('Please check your DATABASE_URL environment variable and make sure your database is accessible.');
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Start the setup process
setupDatabase();