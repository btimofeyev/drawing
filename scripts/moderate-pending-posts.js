#!/usr/bin/env node

// Script to moderate all pending posts
// Run with: node scripts/moderate-pending-posts.js

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const CRON_SECRET = process.env.CRON_SECRET || 'your_secure_cron_secret_here'

async function moderatePendingPosts() {
  console.log('Starting bulk moderation of pending posts...')
  
  try {
    const response = await fetch(`${SITE_URL}/api/admin/moderate-pending`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to moderate: ${response.status} - ${error}`)
    }

    const result = await response.json()
    
    console.log('\nModeration Results:')
    console.log('==================')
    console.log(`Total posts processed: ${result.results.total}`)
    console.log(`✅ Approved: ${result.results.approved}`)
    console.log(`❌ Rejected: ${result.results.rejected}`)
    console.log(`⚠️  Failed: ${result.results.failed}`)
    
    if (result.results.failed > 0) {
      console.log('\nSome posts failed to moderate. Check the logs for details.')
    }
    
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

// Run the moderation
moderatePendingPosts()