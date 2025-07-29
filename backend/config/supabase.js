const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

// Check if Supabase credentials are configured
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not configured!')
  console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file')
  process.exit(1)
}

// Validate URL format
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  console.error('❌ Invalid Supabase URL format!')
  console.error('URL should be like: https://your-project-id.supabase.co')
  process.exit(1)
}

// Client for general operations
const supabase = createClient(supabaseUrl, supabaseKey)

// Admin client for service operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseKey)

console.log('✅ Supabase client initialized')

module.exports = { supabase, supabaseAdmin }