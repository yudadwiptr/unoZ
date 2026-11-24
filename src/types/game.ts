export type CardColor = "merah" | "biru" | "kuning" | "hijau";

export type CardValue =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "skip"
  | "reverse"
  | "draw2"
  | "wild"
  | "wild4"
  | "wild6"
  | "wild8"
  | "wild10"
  | "z_swap"
  | "z_shield";

export interface Card {
  id: string;
  color: CardColor | "wild";
  value: CardValue;
}

export type GameMode = "klasik" | "chaos" | "super_chaos";

export interface RoomSettings {
  mode: GameMode;
  stacking: boolean;
  seven_zero: boolean;
  jump_in: boolean;
  z_cards: boolean;
  /** Super draw cards (+6 / +8 / +10). Optional for rooms saved before it existed. */
  mega_draw?: boolean;
}

export interface PlayerInfo {
  id: string;
  token: string;
  nickname: string;
  avatar: string;
  seatOrder: number;
  isBot: boolean;
  isHost: boolean;
  isOnline: boolean;
  isReady: boolean;
}

export interface PublicPlayerState extends PlayerInfo {
  cardCount: number;
  hasShield: boolean;
  unozCalled: boolean;
  unozVulnerableSince: number | null;
}

export interface PendingSwapAction {
  type: "CHOOSE_SWAP_TARGET";
  playerToken: string;
}

export interface GameEffectEvent {
  id: string;
  type:
    | "play"
    | "draw"
    | "skip"
    | "reverse"
    | "draw_penalty"
    | "wild4"
    | "z_swap"
    | "z_shield_reflect"
    | "z_shield_arm"
    | "swap_seven"
    | "rotate_zero"
    | "jump_in"
    | "unoz_call"
    | "tegur"
    | "auto_skip"
    | "win"
    | "info";
  message: string;
  actorToken?: string;
  targetToken?: string;
  shake?: boolean;
  timestamp: number;
}

export interface PodiumEntry {
  token: string;
  nickname: string;
  avatar: string;
  cardCount: number;
  rank: number;
  isBot: boolean;
}

export interface PublicGameState {
  roomCode: string;
  status: "waiting" | "playing" | "finished";
  settings: RoomSettings;
  players: PublicPlayerState[];
  discardPile: Card[];
  drawPileCount: number;
  activeColor: CardColor;
  currentTurnIndex: number;
  direction: 1 | -1;
  pendingDraw: number;
  pendingDrawFromToken: string | null;
  pendingAction: PendingSwapAction | null;
  drawnPlayableCardId: string | null;
  drawnByToken: string | null;
  unozPanicPos: { x: number; y: number } | null;
  unozPanicTargetToken: string | null;
  lastEvent: GameEffectEvent | null;
  winnerToken: string | null;
  podium: PodiumEntry[];
  turnNumber: number;
}

export interface FullGameState extends Omit<PublicGameState, "drawPileCount"> {
  drawPile: Card[];
  hands: Record<string, Card[]>;
}

export interface EmoteBubble {
  id: string;
  senderToken: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface ToastMessage {
  id: string;
  text: string;
  variant: "info" | "success" | "warning" | "danger";
}

export interface RoomRecord {
  id: string;
  room_code: string;
  host_id: string;
  status: "waiting" | "playing" | "finished";
  settings: RoomSettings;
  created_at?: string;
}

export interface PlayerRecord {
  id: string;
  room_id: string;
  player_token: string;
  nickname: string;
  avatar: string;
  seat_order: number;
  is_ready: boolean;
  joined_at?: string;
}
