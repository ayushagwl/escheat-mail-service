// Test script to verify Supabase connection
// Run this in browser console to debug connection issues

import { supabase } from './lib/supabase.js';

console.log('🔍 Testing Supabase connection...');

// Test 1: Check if supabase client is initialized
console.log('Supabase URL:', supabase.supabaseUrl);
console.log('Supabase Key exists:', !!supabase.supabaseKey);

// Test 2: Try to fetch templates
try {
  const { data, error } = await supabase.from('templates').select('*').limit(1);
  if (error) {
    console.error('❌ Templates fetch error:', error);
  } else {
    console.log('✅ Templates fetch successful:', data);
  }
} catch (err) {
  console.error('❌ Templates fetch exception:', err);
}

// Test 3: Try to fetch envelopes
try {
  const { data, error } = await supabase.from('envelopes').select('*').limit(1);
  if (error) {
    console.error('❌ Envelopes fetch error:', error);
  } else {
    console.log('✅ Envelopes fetch successful:', data);
  }
} catch (err) {
  console.error('❌ Envelopes fetch exception:', err);
}

// Test 4: Check auth status
try {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('❌ Auth session error:', error);
  } else {
    console.log('✅ Auth session:', session ? 'User logged in' : 'No user session');
  }
} catch (err) {
  console.error('❌ Auth session exception:', err);
}

console.log('🏁 Connection test complete!');
