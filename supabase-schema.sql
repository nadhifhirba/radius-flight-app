-- Radius: saved searches table
CREATE TABLE IF NOT EXISTS searches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    origin TEXT NOT NULL,
    max_price INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own searches" ON searches
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own searches" ON searches
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own searches" ON searches
    FOR DELETE USING (auth.uid() = user_id);
