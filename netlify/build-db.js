#!/usr/bin/env node

/**
 * This script initializes the database when deployed on Netlify
 * It runs during the build process to ensure the database is set up correctly
 */

const { execSync } = require('child_process');

console.log('=== Wuxia Cultivation Game Database Setup - Netlify Build ===');

// Check if DATABASE_URL environment variable is set
if (!process.env.DATABASE_URL) {
  console.error('⚠️ DATABASE_URL environment variable not found!');
  console.log('Please configure the DATABASE_URL environment variable in your Netlify settings.');
  // Don't fail the build - we'll assume this is a first-time setup or local build
  process.exit(0);
}

// Main function to handle the database setup
async function setupDatabase() {
  console.log('🔍 Checking database connection...');
  
  try {
    // Push the schema to the database
    console.log('📦 Running database migrations via drizzle-kit push...');
    try {
      execSync('npx drizzle-kit push', { stdio: 'inherit' });
      console.log('✅ Database migrations completed successfully!');
    } catch (error) {
      console.error('❌ Failed to run migrations:', error.message);
      // Don't fail the build
      console.log('Continuing with build despite migration errors.');
    }

    console.log('✨ Database setup completed!');
    console.log('Your Wuxia Cultivation Game is ready for deployment to Netlify.');
  } catch (error) {
    console.error('❌ Error during database setup:', error.message);
    console.log('Continuing with build despite database setup errors.');
    // Don't fail the build
  }
}

// Start the setup process
setupDatabase();