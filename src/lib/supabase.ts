import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = 'https://swmhulpiceqcelyjyyzj.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3bWh1bHBpY2VxY2VseWp5eXpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MTgzNDAsImV4cCI6MjA1NzA5NDM0MH0.CPd5nsCXpHDSjKywELpVwAn3YG4iqs6GQcFqB3PWLa8';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Function to get a service role client (for server-side operations)
export function getServiceSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY || supabaseKey;
  return createClient(supabaseUrl, serviceKey);
}