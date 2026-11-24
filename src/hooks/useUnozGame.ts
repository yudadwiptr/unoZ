"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";
import { decideBotMove, findBotJumpInMove } from "@/lib/bot-ai";
import {
  BOT_PROFILES,
  DEFAULT_CHAOS_SETTINGS,
  DEFAULT_SUPER_CHAOS_SETTINGS,
  DEFAULT_KLASIK_SETTINGS,
  QUICK_EMOTES,
} from "@/lib/constants";
import {
  applyCallUnoz,
  applyDrawCard,
  applyPassTurn,
  applyPlayCard,
  applySwapTarget,
  applyTegurPlayer,
  createInitialGameState,
  toPublicGameState,
  UNOZ_GRACE_MS,
} from "@/lib/game-engine";
import { soundEngine } from "@/lib/sound";
import {
  generateRoomCode,
  getOrCreatePlayerToken,
  getSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase";
import {
  addOnlineBotPlayer,
  createOnlineRoom,
  fetchOnlineRoomBundle,
  joinOnlineRoom,
  removeOnlinePlayer,
  updateOnlineRoomSettings,
  updateOnlineRoomStatus,
} from "@/lib/supabase-room";
import type {
  Card,
  CardColor,
  EmoteBubble,
  FullGameState,
  GameMode,
  PlayerInfo,
  PublicGameState,
  RoomSettings,
  ToastMessage,
} from "@/types/game";

export type ScreenView = "landing" | "lobby" | "game";

interface RoomContextState {
  roomId: string | null;
  roomCode: string;
  hostToken: string;
  settings: RoomSettings;
  players: PlayerInfo[];
  isOnlineRoom: boolean;
}

const NICKNAME_KEY = "unoz_nickname";
const AVATAR_KEY = "unoz_avatar";

export function useUnozGame() {
  const [screen, setScreen] = useState<ScreenView>("landing");
  const [playerToken, setPlayerToken] = useState<string>("");
  const [nickname, setNicknameState] = useState<string>("");
  const [avatar, setAvatarState] = useState<string>("kucing");
  const [room, setRoom] = useState<RoomContextState | null>(null);
  const [publicState, setPublicState] = useState<PublicGameState | null>(null);
  const [myHand, setMyHand] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emotes, setEmotes] = useState<EmoteBubble[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [onlineTokens, setOnlineTokens] = useState<Set<string>>(new Set());

  // Host holds authoritative full state in a ref + mirrored public state
  const fullStateRef = useRef<FullGameState | null>(null);
  const roomRef = useRef<RoomContextState | null>(null);
  const mainChannelRef = useRef<RealtimeChannel | null>(null);
  const handChannelsRef = useRef<Map<string, RealtimeChannel>>(new Map());
  const myHandChannelRef = useRef<RealtimeChannel | null>(null);
  const lastSoundEventIdRef = useRef<string | null>(null);

  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  // Hydrate persistent player_token, nickname, and avatar from localStorage
  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      const token = getOrCreatePlayerToken();
      setPlayerToken(token);
      const savedName = window.localStorage.getItem(NICKNAME_KEY);
      const savedAvatar = window.localStorage.getItem(AVATAR_KEY);
      if (savedName) setNicknameState(savedName);
      if (savedAvatar) setAvatarState(savedAvatar);
    });
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  const setNickname = useCallback((value: string) => {
    setNicknameState(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(NICKNAME_KEY, value);
    }
  }, []);

  const setAvatar = useCallback((value: string) => {
    setAvatarState(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(AVATAR_KEY, value);
    }
  }, []);

  const pushToast = useCallback(
    (text: string, variant: ToastMessage["variant"] = "info") => {
      const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-3), { id, text, variant }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, 3200);
    },
    []
  );

  const triggerShake = useCallback(() => {
    window.setTimeout(() => setIsShaking(true), 0);
    window.setTimeout(() => setIsShaking(false), 560);
  }, []);

  const pushEmoteBubble = useCallback((bubble: EmoteBubble) => {
    soundEngine.play("emote");
    setEmotes((prev) => [...prev.slice(-6), bubble]);
    window.setTimeout(() => {
      setEmotes((prev) => prev.filter((item) => item.id !== bubble.id));
    }, 3400);
  }, []);

  // Trigger audio + shake reactions whenever publicState.lastEvent changes
  useEffect(() => {
    const ev = publicState?.lastEvent;
    if (!ev || ev.id === lastSoundEventIdRef.current) return;
    lastSoundEventIdRef.current = ev.id;

    if (ev.shake) {
      triggerShake();
    }

    switch (ev.type) {
      case "play":
        soundEngine.play("play");
        break;
      case "draw":
      case "draw_penalty":
      case "auto_skip":
        soundEngine.play("draw");
        break;
      case "skip":
      case "reverse":
      case "jump_in":
      case "swap_seven":
      case "rotate_zero":
        soundEngine.play("action");
        break;
      case "wild4":
        soundEngine.play("wild4");
        break;
      case "z_swap":
        soundEngine.play("z_swap");
        break;
      case "z_shield_reflect":
      case "z_shield_arm":
        soundEngine.play("shield");
        break;
      case "unoz_call":
        soundEngine.play("unoz");
        break;
      case "tegur":
        soundEngine.play("tegur");
        break;
      case "win":
        soundEngine.play("win");
        break;
      default:
        break;
    }
  }, [publicState?.lastEvent, triggerShake]);

  // Helper: sync authoritative host state locally & across Realtime (public counts + private hands)
  const publishHostState = useCallback(
    async (nextFull: FullGameState, isGameStartEvent = false) => {
      fullStateRef.current = nextFull;
      const pub = toPublicGameState(nextFull);
      setPublicState(pub);

      // Update host's own hand locally
      if (playerToken && nextFull.hands[playerToken]) {
        setMyHand(nextFull.hands[playerToken]);
      }

      const activeRoom = roomRef.current;
      if (!activeRoom?.isOnlineRoom) return;

      const mainChannel = mainChannelRef.current;
      if (mainChannel) {
        await mainChannel.send({
          type: "broadcast",
          event: isGameStartEvent ? "GAME_START" : "PUBLIC_STATE",
          payload: { state: pub },
        });
      }

      // Send each remote human player's hand over their private player-scoped channel
      const supabase = getSupabaseClient();
      if (!supabase) return;

      for (const player of nextFull.players) {
        if (player.isBot || player.token === playerToken) continue;
        const channelName = `room:${activeRoom.roomCode}:hand:${player.token}`;
        let targetChan = handChannelsRef.current.get(player.token);
        if (!targetChan) {
          targetChan = supabase.channel(channelName);
          handChannelsRef.current.set(player.token, targetChan);
          await new Promise<void>((resolve) => {
            targetChan!.subscribe((status) => {
              if (status === "SUBSCRIBED" || status === "CHANNEL_ERROR") {
                resolve();
              }
            });
          });
        }
        await targetChan.send({
          type: "broadcast",
          event: "HAND_SYNC",
          payload: {
            targetToken: player.token,
            hand: nextFull.hands[player.token] ?? [],
          },
        });
      }
    },
    [playerToken]
  );

  // Clean up all Realtime channels
  const cleanupChannels = useCallback(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    if (mainChannelRef.current) {
      void supabase.removeChannel(mainChannelRef.current);
      mainChannelRef.current = null;
    }
    if (myHandChannelRef.current) {
      void supabase.removeChannel(myHandChannelRef.current);
      myHandChannelRef.current = null;
    }
    for (const chan of handChannelsRef.current.values()) {
      void supabase.removeChannel(chan);
    }
    handChannelsRef.current.clear();
  }, []);

  // Host-authoritative action executor
  const executeAuthoritativeAction = useCallback(
    (
      action:
        | { type: "PLAY_CARD"; actorToken: string; cardId: string; chosenColor?: CardColor }
        | { type: "DRAW_CARD"; actorToken: string; forceAutoSkip?: boolean }
        | { type: "PASS_TURN"; actorToken: string }
        | { type: "CHOOSE_SWAP_TARGET"; actorToken: string; targetToken: string }
        | { type: "CALL_UNOZ"; actorToken: string }
        | { type: "TEGUR_PLAYER"; actorToken: string; targetToken: string }
    ) => {
      const current = fullStateRef.current;
      if (!current) return;

      let next: FullGameState = current;
      switch (action.type) {
        case "PLAY_CARD":
          next = applyPlayCard(
            current,
            action.actorToken,
            action.cardId,
            action.chosenColor
          );
          break;
        case "DRAW_CARD":
          next = applyDrawCard(current, action.actorToken, action.forceAutoSkip);
          break;
        case "PASS_TURN":
          next = applyPassTurn(current, action.actorToken);
          break;
        case "CHOOSE_SWAP_TARGET":
          next = applySwapTarget(current, action.actorToken, action.targetToken);
          break;
        case "CALL_UNOZ":
          next = applyCallUnoz(current, action.actorToken);
          break;
        case "TEGUR_PLAYER":
          next = applyTegurPlayer(current, action.actorToken, action.targetToken);
          break;
      }

      if (next !== current) {
        void publishHostState(next);
        if (next.status === "finished" && roomRef.current?.roomId && roomRef.current.isOnlineRoom) {
          void updateOnlineRoomStatus(roomRef.current.roomId, "finished");
        }
      }
    },
    [publishHostState]
  );

  // Subscribe to Supabase Realtime channel `room:${roomCode}` + private hand channel
  useEffect(() => {
    if (!room?.isOnlineRoom || !playerToken) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const roomCode = room.roomCode;
    const isHostNow = room.hostToken === playerToken;

    const channel = supabase.channel(`room:${roomCode}`, {
      config: {
        presence: { key: playerToken },
        broadcast: { self: false },
      },
    });

    mainChannelRef.current = channel;

    // Track Presence to monitor online status & auto-skip disconnected players
    channel.on("presence", { event: "sync" }, () => {
      const presenceState = channel.presenceState();
      const online = new Set<string>(Object.keys(presenceState));
      online.add(playerToken);
      setOnlineTokens(online);

      setRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map((p) => ({
            ...p,
            isOnline: p.isBot ? true : online.has(p.token),
          })),
        };
      });

      if (fullStateRef.current) {
        fullStateRef.current = {
          ...fullStateRef.current,
          players: fullStateRef.current.players.map((p) => ({
            ...p,
            isOnline: p.isBot ? true : online.has(p.token),
          })),
        };
        setPublicState(toPublicGameState(fullStateRef.current));
      }
    });

    // Public room sync (lobby updates, settings changes, player join/leave)
    channel.on("broadcast", { event: "ROOM_SYNC" }, async () => {
      const refreshed = await fetchOnlineRoomBundle(roomCode, onlineTokens);
      if (refreshed) {
        setRoom((prev) =>
          prev
            ? {
                ...prev,
                settings: refreshed.room.settings,
                players: refreshed.players,
              }
            : prev
        );
      }
    });

    // GAME_START & PUBLIC_STATE updates (for non-host clients)
    channel.on("broadcast", { event: "GAME_START" }, ({ payload }) => {
      const nextPub = payload?.state as PublicGameState | undefined;
      if (nextPub) {
        setPublicState(nextPub);
        setScreen("game");
      }
    });

    channel.on("broadcast", { event: "PUBLIC_STATE" }, ({ payload }) => {
      const nextPub = payload?.state as PublicGameState | undefined;
      if (nextPub) {
        setPublicState(nextPub);
        if (nextPub.status === "waiting") {
          setScreen("lobby");
        }
      }
    });

    // Quick Emotes
    channel.on("broadcast", { event: "SEND_EMOTE" }, ({ payload }) => {
      if (payload?.text && payload?.senderToken) {
        pushEmoteBubble({
          id: payload.id ?? `em_${Date.now()}`,
          senderToken: payload.senderToken,
          senderName: payload.senderName ?? "Pemain",
          text: payload.text,
          timestamp: Date.now(),
        });
      }
    });

    // Host listens to player action broadcasts and resolves them authoritatively
    if (isHostNow) {
      channel.on("broadcast", { event: "PLAY_CARD" }, ({ payload }) => {
        if (payload?.actorToken && payload?.cardId) {
          executeAuthoritativeAction({
            type: "PLAY_CARD",
            actorToken: payload.actorToken,
            cardId: payload.cardId,
            chosenColor: payload.chosenColor,
          });
        }
      });

      channel.on("broadcast", { event: "DRAW_CARD" }, ({ payload }) => {
        if (payload?.actorToken) {
          executeAuthoritativeAction({
            type: "DRAW_CARD",
            actorToken: payload.actorToken,
          });
        }
      });

      channel.on("broadcast", { event: "PASS_TURN" }, ({ payload }) => {
        if (payload?.actorToken) {
          executeAuthoritativeAction({
            type: "PASS_TURN",
            actorToken: payload.actorToken,
          });
        }
      });

      channel.on("broadcast", { event: "CHOOSE_SWAP_TARGET" }, ({ payload }) => {
        if (payload?.actorToken && payload?.targetToken) {
          executeAuthoritativeAction({
            type: "CHOOSE_SWAP_TARGET",
            actorToken: payload.actorToken,
            targetToken: payload.targetToken,
          });
        }
      });

      channel.on("broadcast", { event: "CALL_UNOZ" }, ({ payload }) => {
        if (payload?.actorToken) {
          executeAuthoritativeAction({
            type: "CALL_UNOZ",
            actorToken: payload.actorToken,
          });
        }
      });

      channel.on("broadcast", { event: "TEGUR_PLAYER" }, ({ payload }) => {
        if (payload?.actorToken && payload?.targetToken) {
          executeAuthoritativeAction({
            type: "TEGUR_PLAYER",
            actorToken: payload.actorToken,
            targetToken: payload.targetToken,
          });
        }
      });

      channel.on("broadcast", { event: "REQUEST_SYNC" }, () => {
        if (fullStateRef.current) {
          void publishHostState(fullStateRef.current);
        }
      });
    }

    // Subscribe to private per-player hand channel so other clients never see our hand
    const handChannel = supabase.channel(`room:${roomCode}:hand:${playerToken}`);
    myHandChannelRef.current = handChannel;
    handChannel.on("broadcast", { event: "HAND_SYNC" }, ({ payload }) => {
      if (payload?.targetToken === playerToken && Array.isArray(payload?.hand)) {
        setMyHand(payload.hand as Card[]);
      }
    });
    handChannel.subscribe();

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          player_token: playerToken,
          nickname,
          online_at: new Date().toISOString(),
        });
        if (!isHostNow) {
          await channel.send({
            type: "broadcast",
            event: "REQUEST_SYNC",
            payload: { requester: playerToken },
          });
        }
      }
    });

    return () => {
      cleanupChannels();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.roomCode, room?.isOnlineRoom, room?.hostToken, playerToken]);

  const isHost = Boolean(room && playerToken && room.hostToken === playerToken);

  // HOST LOOP 1: Smart AI Bot Turn & Pending 7-Swap Controller
  useEffect(() => {
    if (!isHost || screen !== "game" || !publicState || publicState.status !== "playing") {
      return;
    }

    const full = fullStateRef.current;
    if (!full) return;

    // Check if a bot must resolve pending 7-swap
    if (full.pendingAction?.type === "CHOOSE_SWAP_TARGET") {
      const pendingBot = full.players.find(
        (p) => p.token === full.pendingAction?.playerToken && p.isBot
      );
      if (pendingBot) {
        const timer = window.setTimeout(() => {
          const latest = fullStateRef.current;
          if (!latest) return;
          const decision = decideBotMove(latest, pendingBot.token);
          if (decision.type === "CHOOSE_SWAP_TARGET") {
            executeAuthoritativeAction({
              type: "CHOOSE_SWAP_TARGET",
              actorToken: pendingBot.token,
              targetToken: decision.targetToken,
            });
          }
        }, 900);
        return () => window.clearTimeout(timer);
      }
      return;
    }

    const activePlayer = full.players[full.currentTurnIndex];
    if (!activePlayer) return;

    // If active player is an AI Bot, schedule smart move
    if (activePlayer.isBot) {
      const delay = full.drawnByToken === activePlayer.token ? 650 : 1050;
      const timer = window.setTimeout(() => {
        const latest = fullStateRef.current;
        if (!latest || latest.status !== "playing") return;
        const curr = latest.players[latest.currentTurnIndex];
        if (!curr || curr.token !== activePlayer.token) return;

        const decision = decideBotMove(latest, activePlayer.token);
        if (decision.type === "PLAY_CARD") {
          executeAuthoritativeAction({
            type: "PLAY_CARD",
            actorToken: activePlayer.token,
            cardId: decision.cardId,
            chosenColor: decision.chosenColor,
          });
          // Occasional funny Indonesian bot banter
          if (Math.random() < 0.16) {
            const banter =
              QUICK_EMOTES[Math.floor(Math.random() * QUICK_EMOTES.length)];
            const bubble: EmoteBubble = {
              id: `bot_em_${Date.now()}`,
              senderToken: activePlayer.token,
              senderName: activePlayer.nickname,
              text: banter,
              timestamp: Date.now(),
            };
            pushEmoteBubble(bubble);
            if (roomRef.current?.isOnlineRoom && mainChannelRef.current) {
              void mainChannelRef.current.send({
                type: "broadcast",
                event: "SEND_EMOTE",
                payload: bubble,
              });
            }
          }
        } else if (decision.type === "DRAW_CARD") {
          executeAuthoritativeAction({
            type: "DRAW_CARD",
            actorToken: activePlayer.token,
          });
        } else if (decision.type === "PASS_TURN") {
          executeAuthoritativeAction({
            type: "PASS_TURN",
            actorToken: activePlayer.token,
          });
        }
      }, delay);

      return () => window.clearTimeout(timer);
    }

    // If active player is a disconnected online human player, auto-skip after 4.5s
    if (!activePlayer.isOnline && roomRef.current?.isOnlineRoom) {
      const timer = window.setTimeout(() => {
        const latest = fullStateRef.current;
        if (!latest || latest.status !== "playing") return;
        const curr = latest.players[latest.currentTurnIndex];
        if (curr && curr.token === activePlayer.token && !curr.isOnline) {
          executeAuthoritativeAction({
            type: "DRAW_CARD",
            actorToken: activePlayer.token,
            forceAutoSkip: true,
          });
        }
      }, 4500);
      return () => window.clearTimeout(timer);
    }
  }, [
    isHost,
    screen,
    publicState,
    executeAuthoritativeAction,
    pushEmoteBubble,
  ]);

  const publicTurnNumber = publicState?.turnNumber;
  const publicGameStatus = publicState?.status;

  // HOST LOOP 2: Bot Jump-In & Bot unoZ! / Tegur! reflexes
  useEffect(() => {
    if (!isHost || screen !== "game" || publicGameStatus !== "playing") {
      return;
    }

    const timers: number[] = [];
    const full = fullStateRef.current;
    if (!full) return;

    // Bot Jump-In chance (if enabled)
    const jumpCandidate = findBotJumpInMove(full);
    if (jumpCandidate && Math.random() < 0.55) {
      const t = window.setTimeout(() => {
        const latest = fullStateRef.current;
        if (!latest || latest.status !== "playing") return;
        executeAuthoritativeAction({
          type: "PLAY_CARD",
          actorToken: jumpCandidate.botToken,
          cardId: jumpCandidate.cardId,
        });
      }, 650);
      timers.push(t);
    }

    // Bot unoZ! panic reflex (~65% remembers quickly; ~35% forgets so player can press "Tegur!")
    for (const p of full.players) {
      if (p.cardCount === 1 && !p.unozCalled && p.unozVulnerableSince) {
        if (p.isBot) {
          const remembers = Math.random() < 0.65;
          if (remembers) {
            const t = window.setTimeout(() => {
              executeAuthoritativeAction({
                type: "CALL_UNOZ",
                actorToken: p.token,
              });
            }, 900 + Math.random() * 1400);
            timers.push(t);
          }
        } else {
          // If a human forgets to press unoZ!, an observant bot will Tegur after 3s + 1.8-3.2s
          const anyBot = full.players.find((b) => b.isBot);
          if (anyBot) {
            const elapsed = Date.now() - p.unozVulnerableSince;
            const waitMs = Math.max(0, UNOZ_GRACE_MS - elapsed) + 1800 + Math.random() * 1400;
            const t = window.setTimeout(() => {
              executeAuthoritativeAction({
                type: "TEGUR_PLAYER",
                actorToken: anyBot.token,
                targetToken: p.token,
              });
            }, waitMs);
            timers.push(t);
          }
        }
      }
    }

    return () => {
      for (const t of timers) window.clearTimeout(t);
    };
  }, [isHost, screen, publicTurnNumber, publicGameStatus, executeAuthoritativeAction]);

  // --- Lobby & Room Actions ---

  const createRoom = useCallback(async () => {
    const cleanName = nickname.trim();
    if (!cleanName) {
      pushToast("Isi Nama Panggilan dulu ya sebelum buat room!", "warning");
      return;
    }
    soundEngine.play("click");
    setIsLoading(true);

    try {
      if (isSupabaseConfigured) {
        const res = await createOnlineRoom({
          hostToken: playerToken,
          nickname: cleanName,
          avatar,
          settings: DEFAULT_CHAOS_SETTINGS,
        });
        if (res.data) {
          setRoom({
            roomId: res.data.room.id,
            roomCode: res.data.room.room_code,
            hostToken: res.data.room.host_id,
            settings: res.data.room.settings,
            players: res.data.players,
            isOnlineRoom: true,
          });
          setScreen("lobby");
          pushToast(
            `Room online #${res.data.room.room_code} berhasil dibuat!`,
            "success"
          );
          return;
        }
        // If Supabase tables aren't migrated yet, gracefully fall back to local mode with notice
        pushToast(
          `${res.error ?? "Koneksi Supabase gagal."} Beralih ke Mode Lokal (Bot AI).`,
          "warning"
        );
      }

      // Instant Local Mode (out-of-the-box playable with bots!)
      const localCode = generateRoomCode();
      const hostPlayer: PlayerInfo = {
        id: `local_${playerToken}`,
        token: playerToken,
        nickname: cleanName,
        avatar,
        seatOrder: 0,
        isBot: false,
        isHost: true,
        isOnline: true,
        isReady: true,
      };
      // Pre-add 2 fun AI bots in local mode so user can hit Mulai Main immediately (and still add/remove bots)
      const starterBots: PlayerInfo[] = BOT_PROFILES.slice(0, 2).map(
        (bot, idx) => ({
          id: `bot_${idx + 1}`,
          token: `bot_${idx + 1}_${Date.now().toString(36)}`,
          nickname: bot.nickname,
          avatar: bot.avatar,
          seatOrder: idx + 1,
          isBot: true,
          isHost: false,
          isOnline: true,
          isReady: true,
        })
      );

      setRoom({
        roomId: null,
        roomCode: localCode,
        hostToken: playerToken,
        settings: DEFAULT_CHAOS_SETTINGS,
        players: [hostPlayer, ...starterBots],
        isOnlineRoom: false,
      });
      setScreen("lobby");
      pushToast(`Room #${localCode} siap! Tambah bot atau langsung gas main.`, "success");
    } finally {
      setIsLoading(false);
    }
  }, [nickname, avatar, playerToken, pushToast]);

  const joinRoom = useCallback(
    async (rawCode: string) => {
      const cleanName = nickname.trim();
      const code = rawCode.trim().toUpperCase();
      if (!cleanName) {
        pushToast("Masukkan Nama Panggilan dulu ya!", "warning");
        return;
      }
      if (code.length < 4) {
        pushToast("Masukkan kode room 5 digit yang valid!", "warning");
        return;
      }
      soundEngine.play("click");

      if (!isSupabaseConfigured) {
        pushToast(
          "Mode Gabung Room Online butuh konfigurasi Supabase (.env.local). Kamu bisa klik Buat Room untuk mabar bareng Bot AI sekarang juga!",
          "warning"
        );
        return;
      }

      setIsLoading(true);
      try {
        const res = await joinOnlineRoom({
          roomCode: code,
          playerToken,
          nickname: cleanName,
          avatar,
        });
        if (res.error || !res.data) {
          pushToast(res.error ?? "Gagal gabung room.", "danger");
          return;
        }
        setRoom({
          roomId: res.data.room.id,
          roomCode: res.data.room.room_code,
          hostToken: res.data.room.host_id,
          settings: res.data.room.settings,
          players: res.data.players,
          isOnlineRoom: true,
        });
        setScreen(res.data.room.status === "playing" ? "game" : "lobby");
        pushToast(`Berhasil gabung ke Room #${res.data.room.room_code}!`, "success");

        // Notify everyone in the room to refresh lobby list
        window.setTimeout(() => {
          void mainChannelRef.current?.send({
            type: "broadcast",
            event: "ROOM_SYNC",
            payload: { roomCode: res.data!.room.room_code },
          });
        }, 450);
      } finally {
        setIsLoading(false);
      }
    },
    [nickname, avatar, playerToken, pushToast]
  );

  const updateSettings = useCallback(
    async (patch: Partial<RoomSettings>) => {
      if (!room || !isHost) return;
      soundEngine.play("click");
      let nextSettings: RoomSettings = { ...room.settings, ...patch };
      if (patch.mode === "klasik") {
        nextSettings = { ...DEFAULT_KLASIK_SETTINGS };
      } else if (patch.mode === "chaos") {
        nextSettings = { ...DEFAULT_CHAOS_SETTINGS };
      } else if (patch.mode === "super_chaos") {
        nextSettings = { ...DEFAULT_SUPER_CHAOS_SETTINGS };
      }

      setRoom((prev) => (prev ? { ...prev, settings: nextSettings } : prev));

      if (room.isOnlineRoom && room.roomId) {
        await updateOnlineRoomSettings(room.roomId, nextSettings);
        await mainChannelRef.current?.send({
          type: "broadcast",
          event: "ROOM_SYNC",
          payload: { settings: nextSettings },
        });
      }
    },
    [room, isHost]
  );

  const setGameMode = useCallback(
    (mode: GameMode) => {
      void updateSettings({ mode });
    },
    [updateSettings]
  );

  const addBot = useCallback(async () => {
    if (!room || !isHost) return;
    if (room.players.length >= 8) {
      pushToast("Maksimal 8 pemain dalam satu room!", "warning");
      return;
    }
    soundEngine.play("click");

    const usedNames = new Set(room.players.map((p) => p.nickname));
    const available = BOT_PROFILES.find((b) => !usedNames.has(b.nickname));
    const botIndex = room.players.filter((p) => p.isBot).length + 1;
    const botName = available?.nickname ?? `Bot Keren ${botIndex}`;
    const botAvatar = available?.avatar ?? "robot";
    const botToken = `bot_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 6)}`;
    const nextSeat =
      room.players.length > 0
        ? Math.max(...room.players.map((p) => p.seatOrder)) + 1
        : 1;

    if (room.isOnlineRoom && room.roomId) {
      const inserted = await addOnlineBotPlayer({
        roomId: room.roomId,
        botToken,
        nickname: botName,
        avatar: botAvatar,
        seatOrder: nextSeat,
      });
      if (inserted) {
        const refreshed = await fetchOnlineRoomBundle(room.roomCode, onlineTokens);
        if (refreshed) {
          setRoom((prev) => (prev ? { ...prev, players: refreshed.players } : prev));
        }
        await mainChannelRef.current?.send({
          type: "broadcast",
          event: "ROOM_SYNC",
          payload: { roomCode: room.roomCode },
        });
      }
    } else {
      const botPlayer: PlayerInfo = {
        id: botToken,
        token: botToken,
        nickname: botName,
        avatar: botAvatar,
        seatOrder: nextSeat,
        isBot: true,
        isHost: false,
        isOnline: true,
        isReady: true,
      };
      setRoom((prev) =>
        prev ? { ...prev, players: [...prev.players, botPlayer] } : prev
      );
    }
  }, [room, isHost, onlineTokens, pushToast]);

  const removeBot = useCallback(
    async (botToken: string) => {
      if (!room || !isHost) return;
      soundEngine.play("click");
      if (room.isOnlineRoom && room.roomId) {
        await removeOnlinePlayer(room.roomId, botToken);
        await mainChannelRef.current?.send({
          type: "broadcast",
          event: "ROOM_SYNC",
          payload: { roomCode: room.roomCode },
        });
      }
      setRoom((prev) =>
        prev
          ? { ...prev, players: prev.players.filter((p) => p.token !== botToken) }
          : prev
      );
    },
    [room, isHost]
  );

  const leaveRoom = useCallback(async () => {
    soundEngine.play("click");
    if (room?.isOnlineRoom && room.roomId && !isHost) {
      await removeOnlinePlayer(room.roomId, playerToken);
      await mainChannelRef.current?.send({
        type: "broadcast",
        event: "ROOM_SYNC",
        payload: { roomCode: room.roomCode },
      });
    }
    cleanupChannels();
    fullStateRef.current = null;
    setPublicState(null);
    setMyHand([]);
    setRoom(null);
    setScreen("landing");
    // Clean ?room= param from URL
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("room");
      window.history.replaceState({}, "", url.toString());
    }
  }, [room, isHost, playerToken, cleanupChannels]);

  // --- Gameplay Actions (Dispatched locally on Host or Broadcast to Host) ---

  const startGame = useCallback(async () => {
    if (!room || !isHost) return;
    if (room.players.length < 2) {
      pushToast("Minimal butuh 2 pemain! Klik Tambah Bot kalau mau solo tes.", "warning");
      return;
    }
    soundEngine.play("action");

    const initialFull = createInitialGameState(
      room.roomCode,
      room.players,
      room.settings
    );
    setScreen("game");
    if (room.isOnlineRoom && room.roomId) {
      await updateOnlineRoomStatus(room.roomId, "playing");
    }
    await publishHostState(initialFull, true);
  }, [room, isHost, pushToast, publishHostState]);

  const playCard = useCallback(
    async (cardId: string, chosenColor?: CardColor) => {
      if (!playerToken) return;
      if (isHost) {
        executeAuthoritativeAction({
          type: "PLAY_CARD",
          actorToken: playerToken,
          cardId,
          chosenColor,
        });
      } else {
        await mainChannelRef.current?.send({
          type: "broadcast",
          event: "PLAY_CARD",
          payload: { actorToken: playerToken, cardId, chosenColor },
        });
      }
    },
    [isHost, playerToken, executeAuthoritativeAction]
  );

  const drawCard = useCallback(async () => {
    if (!playerToken) return;
    if (isHost) {
      executeAuthoritativeAction({
        type: "DRAW_CARD",
        actorToken: playerToken,
      });
    } else {
      await mainChannelRef.current?.send({
        type: "broadcast",
        event: "DRAW_CARD",
        payload: { actorToken: playerToken },
      });
    }
  }, [isHost, playerToken, executeAuthoritativeAction]);

  const passTurn = useCallback(async () => {
    if (!playerToken) return;
    if (isHost) {
      executeAuthoritativeAction({
        type: "PASS_TURN",
        actorToken: playerToken,
      });
    } else {
      await mainChannelRef.current?.send({
        type: "broadcast",
        event: "PASS_TURN",
        payload: { actorToken: playerToken },
      });
    }
  }, [isHost, playerToken, executeAuthoritativeAction]);

  const chooseSwapTarget = useCallback(
    async (targetToken: string) => {
      if (!playerToken) return;
      if (isHost) {
        executeAuthoritativeAction({
          type: "CHOOSE_SWAP_TARGET",
          actorToken: playerToken,
          targetToken,
        });
      } else {
        await mainChannelRef.current?.send({
          type: "broadcast",
          event: "CHOOSE_SWAP_TARGET",
          payload: { actorToken: playerToken, targetToken },
        });
      }
    },
    [isHost, playerToken, executeAuthoritativeAction]
  );

  const callUnoz = useCallback(async () => {
    if (!playerToken) return;
    if (isHost) {
      executeAuthoritativeAction({
        type: "CALL_UNOZ",
        actorToken: playerToken,
      });
    } else {
      await mainChannelRef.current?.send({
        type: "broadcast",
        event: "CALL_UNOZ",
        payload: { actorToken: playerToken },
      });
    }
  }, [isHost, playerToken, executeAuthoritativeAction]);

  const tegurPlayer = useCallback(
    async (targetToken: string) => {
      if (!playerToken) return;
      if (isHost) {
        executeAuthoritativeAction({
          type: "TEGUR_PLAYER",
          actorToken: playerToken,
          targetToken,
        });
      } else {
        await mainChannelRef.current?.send({
          type: "broadcast",
          event: "TEGUR_PLAYER",
          payload: { actorToken: playerToken, targetToken },
        });
      }
    },
    [isHost, playerToken, executeAuthoritativeAction]
  );

  const sendEmote = useCallback(
    async (text: string) => {
      if (!playerToken) return;
      const bubble: EmoteBubble = {
        id: `em_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        senderToken: playerToken,
        senderName: nickname.trim() || "Pemain",
        text,
        timestamp: Date.now(),
      };
      pushEmoteBubble(bubble);
      if (room?.isOnlineRoom && mainChannelRef.current) {
        await mainChannelRef.current.send({
          type: "broadcast",
          event: "SEND_EMOTE",
          payload: bubble,
        });
      }
    },
    [playerToken, nickname, room?.isOnlineRoom, pushEmoteBubble]
  );

  const backToLobby = useCallback(async () => {
    soundEngine.play("click");
    if (isHost && room?.isOnlineRoom && room.roomId) {
      await updateOnlineRoomStatus(room.roomId, "waiting");
      if (fullStateRef.current) {
        const waitingState: PublicGameState = {
          ...toPublicGameState(fullStateRef.current),
          status: "waiting",
        };
        await mainChannelRef.current?.send({
          type: "broadcast",
          event: "PUBLIC_STATE",
          payload: { state: waitingState },
        });
      }
    }
    fullStateRef.current = null;
    setPublicState(null);
    setMyHand([]);
    setScreen("lobby");
  }, [isHost, room]);

  const copyRoomLink = useCallback(async () => {
    if (!room) return;
    const shareUrl = `${window.location.origin}/?room=${room.roomCode}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      soundEngine.play("click");
      pushToast("Link room berhasil disalin!", "success");
    } catch {
      // Fallback copy method
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      pushToast("Link room berhasil disalin!", "success");
    }
  }, [room, pushToast]);

  return {
    screen,
    playerToken,
    nickname,
    setNickname,
    avatar,
    setAvatar,
    room,
    isHost,
    isSupabaseConfigured,
    publicState,
    myHand,
    isLoading,
    emotes,
    toasts,
    isShaking,
    createRoom,
    joinRoom,
    updateSettings,
    setGameMode,
    addBot,
    removeBot,
    leaveRoom,
    startGame,
    playCard,
    drawCard,
    passTurn,
    chooseSwapTarget,
    callUnoz,
    tegurPlayer,
    sendEmote,
    backToLobby,
    copyRoomLink,
    pushToast,
  };
}
