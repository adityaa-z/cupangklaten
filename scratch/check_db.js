const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

function loadEnv() {
    try {
        const env = fs.readFileSync('.env', 'utf8');
        env.split(/\r?\n/).forEach(line => {
            const index = line.indexOf('=');
            if (index > 0) {
                const key = line.substring(0, index).trim();
                const value = line.substring(index + 1).trim();
                process.env[key] = value;
            }
        });
    } catch (e) {}
}

loadEnv();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkReviews() {
    const { data, error } = await supabase.from('reviews').select('*').limit(5);
    console.log('Reviews count:', data?.length);
    console.log('Reviews error:', error);
}

checkReviews();
