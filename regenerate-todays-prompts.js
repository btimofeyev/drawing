#!/usr/bin/env node

/**
 * Script to regenerate today's prompts
 * Run with: node regenerate-todays-prompts.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function regenerateTodaysPrompts() {
  try {
    // Get today's date in Eastern Time
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
    console.log(`Regenerating prompts for: ${today}`);

    // First, delete existing prompts for today
    const { error: deleteError } = await supabase
      .from('prompts')
      .delete()
      .eq('date', today);

    if (deleteError) {
      console.error('Error deleting existing prompts:', deleteError);
      return;
    }

    console.log('Deleted existing prompts for today');

    // Now generate new prompts using the admin API
    const baseUrl = 'http://localhost:3000'; // Change this if running on a different port
    
    const response = await fetch(`${baseUrl}/api/admin/generate-prompts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: today,
        ageGroups: ['preschoolers', 'kids', 'tweens'] // Generate for all age groups
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error generating prompts:', error);
      return;
    }

    const result = await response.json();
    console.log(`Successfully generated ${result.generated} prompts for ${result.date}`);
    
    // Display the new prompts
    console.log('\nNew prompts:');
    result.prompts.forEach(prompt => {
      console.log(`\n${prompt.age_group} - ${prompt.time_slot}:`);
      console.log(`  ${prompt.prompt_text}`);
      console.log(`  Difficulty: ${prompt.difficulty}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
regenerateTodaysPrompts();