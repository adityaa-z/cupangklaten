// Supabase Configuration
// Values are loaded from env.js
const supabaseClient = supabase.createClient(window.ENV.SUPABASE_URL, window.ENV.SUPABASE_KEY);
