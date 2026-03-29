// Supabase client — loaded via CDN, SUPABASE_URL and SUPABASE_ANON_KEY
// injected as window globals from /api/config.js
const _supabase = supabase.createClient(
    window.SUPABASE_URL || '',
    window.SUPABASE_ANON_KEY || ''
);

window._supabase = _supabase;
