// Load credentials from .env file
const env = {};
const xhr = new XMLHttpRequest();
xhr.open('GET', '.env', false);
xhr.send();
if (xhr.status === 200) {
    xhr.responseText.split('\n').forEach(line => {
        const idx = line.indexOf('=');
        if (idx > 0) {
            const key = line.substring(0, idx).trim();
            const val = line.substring(idx + 1).trim();
            if (key) env[key] = val;
        }
    });
}

const supabaseClient = supabase.createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
