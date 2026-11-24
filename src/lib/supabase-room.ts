import { generateRoomCode, getSupabaseClient } from "@/lib/supabase";
import type {
  PlayerInfo,
  PlayerRecord,
  RoomRecord,
  RoomSettings,
} from "@/types/game";

export interface RoomBundle {
  room: RoomRecord;
  players: PlayerInfo[];
}

function mapPlayerRecords(
  records: PlayerRecord[],
  hostToken: string,
  onlineTokens?: Set<string>
): PlayerInfo[] {
  return [...records]
    .sort((a, b) => a.seat_order - b.seat_order)
    .map((rec) => {
      const isBot = rec.player_token.startsWith("bot_");
      return {
        id: rec.id,
        token: rec.player_token,
        nickname: rec.nickname,
        avatar: rec.avatar,
        seatOrder: rec.seat_order,
        isBot,
        isHost: rec.player_token === hostToken,
        isOnline: isBot ? true : onlineTokens ? onlineTokens.has(rec.player_token) : true,
        isReady: rec.is_ready,
      };
    });
}

export async function createOnlineRoom(params: {
  hostToken: string;
  nickname: string;
  avatar: string;
  settings: RoomSettings;
}): Promise<{ data: RoomBundle | null; error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { data: null, error: "Supabase belum dikonfigurasi." };
  }

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const roomCode = generateRoomCode();
    const { data: roomData, error: roomErr } = await supabase
      .from("unoz_rooms")
      .insert({
        room_code: roomCode,
        host_id: params.hostToken,
        status: "waiting",
        settings: params.settings,
      })
      .select()
      .single();

    if (roomErr) {
      if (roomErr.code === "23505" && attempt < 3) continue;
      return {
        data: null,
        error: `Gagal membuat room online: ${roomErr.message}`,
      };
    }

    const room = roomData as RoomRecord;
    const { data: playerData, error: playerErr } = await supabase
      .from("unoz_players")
      .insert({
        room_id: room.id,
        player_token: params.hostToken,
        nickname: params.nickname,
        avatar: params.avatar,
        seat_order: 0,
        is_ready: true,
      })
      .select()
      .single();

    if (playerErr) {
      return {
        data: null,
        error: `Gagal menambahkan pembuat room: ${playerErr.message}`,
      };
    }

    return {
      data: {
        room,
        players: mapPlayerRecords([playerData as PlayerRecord], room.host_id),
      },
      error: null,
    };
  }

  return { data: null, error: "Gagal membuat kode room unik. Coba lagi ya!" };
}

export async function joinOnlineRoom(params: {
  roomCode: string;
  playerToken: string;
  nickname: string;
  avatar: string;
}): Promise<{ data: RoomBundle | null; error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { data: null, error: "Supabase belum dikonfigurasi." };
  }

  const normalizedCode = params.roomCode.trim().toUpperCase();
  const { data: roomData, error: roomErr } = await supabase
    .from("unoz_rooms")
    .select("*")
    .eq("room_code", normalizedCode)
    .single();

  if (roomErr || !roomData) {
    return {
      data: null,
      error: `Room dengan kode "${normalizedCode}" tidak ditemukan.`,
    };
  }

  const room = roomData as RoomRecord;
  const { data: existingPlayersData, error: listErr } = await supabase
    .from("unoz_players")
    .select("*")
    .eq("room_id", room.id)
    .order("seat_order", { ascending: true });

  if (listErr) {
    return {
      data: null,
      error: `Gagal memuat daftar pemain: ${listErr.message}`,
    };
  }

  const existingPlayers = (existingPlayersData ?? []) as PlayerRecord[];
  const alreadyJoined = existingPlayers.find(
    (p) => p.player_token === params.playerToken
  );

  if (alreadyJoined) {
    // Seamless rejoin without authentication — refresh nickname/avatar if waiting
    if (room.status === "waiting") {
      await supabase
        .from("unoz_players")
        .update({ nickname: params.nickname, avatar: params.avatar })
        .eq("id", alreadyJoined.id);
      alreadyJoined.nickname = params.nickname;
      alreadyJoined.avatar = params.avatar;
    }
    return {
      data: {
        room,
        players: mapPlayerRecords(existingPlayers, room.host_id),
      },
      error: null,
    };
  }

  if (room.status !== "waiting") {
    return {
      data: null,
      error: "Permainan di room ini sudah dimulai. Tunggu ronde berikutnya ya!",
    };
  }

  if (existingPlayers.length >= 8) {
    return {
      data: null,
      error: "Room sudah penuh (maksimal 8 pemain).",
    };
  }

  const nextSeat =
    existingPlayers.length > 0
      ? Math.max(...existingPlayers.map((p) => p.seat_order)) + 1
      : 0;

  const { data: inserted, error: joinErr } = await supabase
    .from("unoz_players")
    .insert({
      room_id: room.id,
      player_token: params.playerToken,
      nickname: params.nickname,
      avatar: params.avatar,
      seat_order: nextSeat,
      is_ready: true,
    })
    .select()
    .single();

  if (joinErr || !inserted) {
    return {
      data: null,
      error: `Gagal bergabung ke room: ${joinErr?.message ?? "Terjadi kesalahan"}`,
    };
  }

  return {
    data: {
      room,
      players: mapPlayerRecords(
        [...existingPlayers, inserted as PlayerRecord],
        room.host_id
      ),
    },
    error: null,
  };
}

export async function fetchOnlineRoomBundle(
  roomCode: string,
  onlineTokens?: Set<string>
): Promise<RoomBundle | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data: roomData } = await supabase
    .from("unoz_rooms")
    .select("*")
    .eq("room_code", roomCode)
    .single();
  if (!roomData) return null;

  const room = roomData as RoomRecord;
  const { data: playersData } = await supabase
    .from("unoz_players")
    .select("*")
    .eq("room_id", room.id)
    .order("seat_order", { ascending: true });

  return {
    room,
    players: mapPlayerRecords(
      (playersData ?? []) as PlayerRecord[],
      room.host_id,
      onlineTokens
    ),
  };
}

export async function updateOnlineRoomSettings(
  roomId: string,
  settings: RoomSettings
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await supabase.from("unoz_rooms").update({ settings }).eq("id", roomId);
}

export async function updateOnlineRoomStatus(
  roomId: string,
  status: "waiting" | "playing" | "finished"
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await supabase.from("unoz_rooms").update({ status }).eq("id", roomId);
}

export async function addOnlineBotPlayer(params: {
  roomId: string;
  botToken: string;
  nickname: string;
  avatar: string;
  seatOrder: number;
}): Promise<PlayerRecord | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("unoz_players")
    .insert({
      room_id: params.roomId,
      player_token: params.botToken,
      nickname: params.nickname,
      avatar: params.avatar,
      seat_order: params.seatOrder,
      is_ready: true,
    })
    .select()
    .single();

  return (data as PlayerRecord) ?? null;
}

export async function removeOnlinePlayer(
  roomId: string,
  playerToken: string
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await supabase
    .from("unoz_players")
    .delete()
    .eq("room_id", roomId)
    .eq("player_token", playerToken);
}
