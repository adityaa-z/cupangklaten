// Supabase & Admin Configuration
// NOTE: Update these values if you change .env
const env = {
    SUPABASE_URL: "https://mtbnbjimpsnozckxmqok.supabase.co",
    SUPABASE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10Ym5iamltcHNub3pja3htcW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNTY4NzUsImV4cCI6MjA5MTgzMjg3NX0.AUzIdzECbP_kz-ZtMVU4_2YD2Fh1vIIVFetI-9evCR8",
    ADMIN_USERNAME: "admin",
    ADMIN_PASSWORD: "Bekasi2004"
};

const supabaseClient = supabase.createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
