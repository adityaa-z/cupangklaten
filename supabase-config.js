// Supabase Configuration
// Ganti URL dan KEY dengan yang ada di Dashboard Supabase Anda (Project Settings > API)
const SUPABASE_URL = 'https://mtbnbjimpsnozckxmqok.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10Ym5iamltcHNub3pja3htcW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNTY4NzUsImV4cCI6MjA5MTgzMjg3NX0.AUzIdzECbP_kz-ZtMVU4_2YD2Fh1vIIVFetI-9evCR8';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
