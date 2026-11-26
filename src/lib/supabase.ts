import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    SUPABASE_URL.startsWith("http") &&
    !SUPABASE_URL.includes("your-project-id") &&
    !SUPABASE_ANON_KEY.includes("your-anon-public-key") &&
    !SUPABASE_ANON_KEY.includes("your_key_here")
);

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!cachedClient) {
    cachedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 15,
        },
        // Keep the heartbeat alive in a Web Worker so phones that background the
        // tab (or throttle timers on a weak network) don't silently drop the socket.
        worker: true,
        heartbeatIntervalMs: 15000,
      },
    });
  }
  return cachedClient;
}

/**
 * Open a Realtime channel, evicting any stale channel with the same topic first.
 * supabase-js reuses an existing channel for a topic until the server confirms the
 * previous leave — on a slow network that is seconds, and adding listeners to that
 * half-closed channel throws, which left rejoining players with no connection at all.
 */
export function openFreshChannel(
  client: SupabaseClient,
  topic: string,
  config?: Parameters<SupabaseClient["channel"]>[1]
) {
  const fullTopic = `realtime:${topic}`;
  for (const stale of client.getChannels()) {
    if (stale.topic === fullTopic) {
      void client.removeChannel(stale);
      (client.realtime as unknown as { _remove?: (c: unknown) => void })._remove?.(stale);
    }
  }
  return client.channel(topic, config);
}

const TOKEN_STORAGE_KEY = "unoz_player_token";

export function getOrCreatePlayerToken(): string {
  if (typeof window === "undefined") {
    return "ssr_token";
  }
  const existing = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  if (existing && existing.length >= 8) {
    return existing;
  }
  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "")
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 14)}`;
  const token = `pz_${randomPart.slice(0, 28)}`;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  return token;
}

export function generateRoomCode(): string {
  // 5-digit numeric room code (fits comfortably inside VARCHAR(6))
  return String(Math.floor(10000 + Math.random() * 90000));
}
