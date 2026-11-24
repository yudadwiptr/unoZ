-- Skema Database PostgreSQL Supabase untuk unoZ
-- Jalankan SQL ini di SQL Editor dashboard Supabase kamu.

-- Tabel Room Permainan
CREATE TABLE IF NOT EXISTS unoz_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(6) UNIQUE NOT NULL,
  host_id VARCHAR(64) NOT NULL,
  status VARCHAR(20) DEFAULT 'waiting', -- 'waiting', 'playing', 'finished'
  settings JSONB DEFAULT '{
    "mode": "chaos",
    "stacking": true,
    "seven_zero": true,
    "jump_in": true,
    "z_cards": true
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Pemain di dalam Room
CREATE TABLE IF NOT EXISTS unoz_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES unoz_rooms(id) ON DELETE CASCADE,
  player_token VARCHAR(64) NOT NULL, -- Simpan di localStorage browser
  nickname VARCHAR(30) NOT NULL,
  avatar VARCHAR(20) NOT NULL,
  seat_order INT NOT NULL,
  is_ready BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (room_id, player_token)
);

-- Index untuk pencarian kode room cepat
CREATE INDEX IF NOT EXISTS idx_unoz_room_code ON unoz_rooms(room_code);

-- Kebijakan akses publik untuk mode main cepat tanpa login (sesuaikan untuk produksi)
ALTER TABLE unoz_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE unoz_players ENABLE ROW LEVEL SECURITY;

-- Izin tabel untuk role anon (dipakai browser tanpa login)
GRANT SELECT, INSERT, UPDATE, DELETE ON unoz_rooms TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON unoz_players TO anon, authenticated;

DROP POLICY IF EXISTS "unoz_rooms_public_all" ON unoz_rooms;
CREATE POLICY "unoz_rooms_public_all" ON unoz_rooms
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "unoz_players_public_all" ON unoz_players;
CREATE POLICY "unoz_players_public_all" ON unoz_players
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
