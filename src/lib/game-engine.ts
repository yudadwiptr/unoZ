import { CARD_COLORS, COLOR_META, getCardDisplayName } from "@/lib/constants";
import type {
  Card,
  CardColor,
  CardValue,
  FullGameState,
  GameEffectEvent,
  PlayerInfo,
  PodiumEntry,
  PublicGameState,
  PublicPlayerState,
  RoomSettings,
} from "@/types/game";

export const UNOZ_GRACE_MS = 3000;
const INITIAL_HAND_SIZE = 7;

let uidCounter = 0;
function makeId(prefix: string): string {
  uidCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${uidCounter}_${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

export function shuffleCards<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createDeck(includeZCards: boolean): Card[] {
  const deck: Card[] = [];

  for (const color of CARD_COLORS) {
    deck.push({ id: makeId("c"), color, value: "0" });
    const doubledValues: CardValue[] = [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "skip",
      "reverse",
      "draw2",
    ];
    for (const value of doubledValues) {
      deck.push({ id: makeId("c"), color, value });
      deck.push({ id: makeId("c"), color, value });
    }
  }

  for (let i = 0; i < 4; i += 1) {
    deck.push({ id: makeId("w"), color: "wild", value: "wild" });
    deck.push({ id: makeId("w4"), color: "wild", value: "wild4" });
  }

  if (includeZCards) {
    for (let i = 0; i < 2; i += 1) {
      deck.push({ id: makeId("zs"), color: "wild", value: "z_swap" });
      deck.push({ id: makeId("zhl"), color: "wild", value: "z_shield" });
    }
  }

  return shuffleCards(deck);
}

function drawFromPile(
  drawPile: Card[],
  discardPile: Card[],
  count: number
): { drawn: Card[]; nextDrawPile: Card[]; nextDiscardPile: Card[] } {
  let pool = [...drawPile];
  let discard = [...discardPile];
  const drawn: Card[] = [];

  for (let i = 0; i < count; i += 1) {
    if (pool.length === 0) {
      if (discard.length <= 1) {
        // Emergency refill if players hold almost every card
        pool = createDeck(false);
      } else {
        const top = discard[discard.length - 1];
        const recycled = discard.slice(0, -1);
        pool = shuffleCards(recycled);
        discard = [top];
      }
    }
    const next = pool.pop();
    if (next) drawn.push(next);
  }

  return { drawn, nextDrawPile: pool, nextDiscardPile: discard };
}

function randomPanicPosition(): { x: number; y: number } {
  // Keep well inside mobile & desktop safe screen bounds
  const x = Math.floor(20 + Math.random() * 58);
  const y = Math.floor(24 + Math.random() * 38);
  return { x, y };
}

function makeEvent(
  type: GameEffectEvent["type"],
  message: string,
  extra?: Partial<GameEffectEvent>
): GameEffectEvent {
  return {
    id: makeId("ev"),
    type,
    message,
    timestamp: Date.now(),
    ...extra,
  };
}

export function getNextTurnIndex(
  currentIndex: number,
  direction: 1 | -1,
  playerCount: number,
  steps = 1
): number {
  const offset = (currentIndex + direction * steps) % playerCount;
  return (offset + playerCount) % playerCount;
}

export function createInitialGameState(
  roomCode: string,
  players: PlayerInfo[],
  settings: RoomSettings
): FullGameState {
  const sortedPlayers = [...players].sort((a, b) => a.seatOrder - b.seatOrder);
  const deck = createDeck(settings.z_cards);
  const hands: Record<string, Card[]> = {};

  for (const player of sortedPlayers) {
    hands[player.token] = deck.splice(0, INITIAL_HAND_SIZE);
  }

  // Pick a clean numbered colored starter card so the first turn is always fair
  let starterIndex = deck.findIndex(
    (card) => card.color !== "wild" && /^[0-9]$/.test(card.value)
  );
  if (starterIndex === -1) starterIndex = 0;
  const [starterCard] = deck.splice(starterIndex, 1);
  const activeColor: CardColor =
    starterCard.color === "wild" ? "merah" : starterCard.color;

  const publicPlayers: PublicPlayerState[] = sortedPlayers.map((p) => ({
    ...p,
    cardCount: hands[p.token].length,
    hasShield: false,
    unozCalled: false,
    unozVulnerableSince: null,
  }));

  return {
    roomCode,
    status: "playing",
    settings,
    players: publicPlayers,
    hands,
    drawPile: deck,
    discardPile: [starterCard],
    activeColor,
    currentTurnIndex: 0,
    direction: 1,
    pendingDraw: 0,
    pendingDrawFromToken: null,
    pendingAction: null,
    drawnPlayableCardId: null,
    drawnByToken: null,
    unozPanicPos: null,
    unozPanicTargetToken: null,
    lastEvent: makeEvent(
      "info",
      `Permainan dimulai! Giliran pertama: ${publicPlayers[0]?.nickname ?? "Pemain"}.`
    ),
    winnerToken: null,
    podium: [],
    turnNumber: 1,
  };
}

export function isCardWild(card: Card): boolean {
  return (
    card.color === "wild" ||
    card.value === "wild" ||
    card.value === "wild4" ||
    card.value === "z_swap" ||
    card.value === "z_shield"
  );
}

export function canJumpInCard(
  state: Pick<
    PublicGameState,
    | "status"
    | "settings"
    | "players"
    | "currentTurnIndex"
    | "pendingDraw"
    | "pendingAction"
    | "discardPile"
  >,
  playerToken: string,
  card: Card
): boolean {
  if (state.status !== "playing") return false;
  if (!state.settings.jump_in) return false;
  if (state.pendingDraw > 0 || state.pendingAction) return false;

  const currentPlayer = state.players[state.currentTurnIndex];
  if (!currentPlayer || currentPlayer.token === playerToken) return false;

  const topCard = state.discardPile[state.discardPile.length - 1];
  if (!topCard) return false;

  // Jump-In requires exact color & exact value match on non-wild cards
  return (
    card.color !== "wild" &&
    topCard.color !== "wild" &&
    card.color === topCard.color &&
    card.value === topCard.value
  );
}

export function canPlayCard(
  state: Pick<
    PublicGameState,
    | "status"
    | "settings"
    | "players"
    | "currentTurnIndex"
    | "activeColor"
    | "pendingDraw"
    | "pendingAction"
    | "discardPile"
    | "drawnPlayableCardId"
    | "drawnByToken"
  >,
  playerToken: string,
  card: Card
): { playable: boolean; isJumpIn: boolean } {
  if (state.status !== "playing") return { playable: false, isJumpIn: false };
  if (state.pendingAction) return { playable: false, isJumpIn: false };

  const currentPlayer = state.players[state.currentTurnIndex];
  if (!currentPlayer) return { playable: false, isJumpIn: false };

  const topCard = state.discardPile[state.discardPile.length - 1];
  if (!topCard) return { playable: false, isJumpIn: false };

  // Out-of-turn Jump-In check
  if (currentPlayer.token !== playerToken) {
    const jumpable = canJumpInCard(state, playerToken, card);
    return { playable: jumpable, isJumpIn: jumpable };
  }

  // If the player just drew a playable card this turn, only that card can be played
  if (state.drawnByToken === playerToken && state.drawnPlayableCardId) {
    return {
      playable: card.id === state.drawnPlayableCardId,
      isJumpIn: false,
    };
  }

  // Facing an incoming +2 or +4 penalty stack
  if (state.pendingDraw > 0) {
    if (card.value === "z_shield" && state.settings.z_cards) {
      return { playable: true, isJumpIn: false };
    }
    if (!state.settings.stacking) {
      return { playable: false, isJumpIn: false };
    }
    if (topCard.value === "draw2") {
      return {
        playable: card.value === "draw2" || card.value === "wild4",
        isJumpIn: false,
      };
    }
    if (topCard.value === "wild4") {
      return { playable: card.value === "wild4", isJumpIn: false };
    }
    return { playable: false, isJumpIn: false };
  }

  // Normal turn play
  if (isCardWild(card)) {
    return { playable: true, isJumpIn: false };
  }

  if (card.color === state.activeColor || card.value === topCard.value) {
    return { playable: true, isJumpIn: false };
  }

  return { playable: false, isJumpIn: false };
}

function buildPodium(
  players: PublicPlayerState[],
  hands: Record<string, Card[]>,
  winnerToken: string
): PodiumEntry[] {
  const sorted = [...players].sort((a, b) => {
    if (a.token === winnerToken) return -1;
    if (b.token === winnerToken) return 1;
    return (hands[a.token]?.length ?? 0) - (hands[b.token]?.length ?? 0);
  });

  return sorted.map((p, idx) => ({
    token: p.token,
    nickname: p.nickname,
    avatar: p.avatar,
    cardCount: hands[p.token]?.length ?? 0,
    rank: idx + 1,
    isBot: p.isBot,
  }));
}

function syncPlayerCounts(
  players: PublicPlayerState[],
  hands: Record<string, Card[]>
): PublicPlayerState[] {
  return players.map((p) => {
    const count = hands[p.token]?.length ?? 0;
    return {
      ...p,
      cardCount: count,
      // Reset unoZ flags if player no longer has 1 card
      unozCalled: count === 1 ? p.unozCalled : false,
      unozVulnerableSince: count === 1 ? p.unozVulnerableSince : null,
    };
  });
}

function syncUnozPanicTarget(
  players: PublicPlayerState[],
  prevTarget: string | null,
  prevPos: { x: number; y: number } | null
): {
  unozPanicTargetToken: string | null;
  unozPanicPos: { x: number; y: number } | null;
} {
  const vulnerable = players.find(
    (p) => p.cardCount === 1 && !p.unozCalled && p.unozVulnerableSince !== null
  );
  if (!vulnerable) {
    return { unozPanicTargetToken: null, unozPanicPos: null };
  }
  if (vulnerable.token === prevTarget && prevPos) {
    return { unozPanicTargetToken: prevTarget, unozPanicPos: prevPos };
  }
  return {
    unozPanicTargetToken: vulnerable.token,
    unozPanicPos: randomPanicPosition(),
  };
}

export function applyPlayCard(
  state: FullGameState,
  playerToken: string,
  cardId: string,
  chosenColor?: CardColor
): FullGameState {
  const hand = state.hands[playerToken];
  if (!hand) return state;

  const cardIndex = hand.findIndex((c) => c.id === cardId);
  if (cardIndex === -1) return state;
  const card = hand[cardIndex];

  const { playable, isJumpIn } = canPlayCard(state, playerToken, card);
  if (!playable) return state;

  const actorIndex = state.players.findIndex((p) => p.token === playerToken);
  if (actorIndex === -1) return state;
  const actor = state.players[actorIndex];

  // Deep-ish clones for immutable update
  const nextHands: Record<string, Card[]> = {};
  for (const [k, v] of Object.entries(state.hands)) {
    nextHands[k] = [...v];
  }
  nextHands[playerToken].splice(cardIndex, 1);

  const nextDiscardPile = [...state.discardPile, card];
  const nextDrawPile = [...state.drawPile];
  let nextDirection = state.direction;
  const nextActiveColor: CardColor =
    card.color === "wild" ? chosenColor ?? state.activeColor : card.color;
  let nextPendingDraw = state.pendingDraw;
  let nextPendingFrom = state.pendingDrawFromToken;
  let nextPendingAction = state.pendingAction;
  let nextPlayers: PublicPlayerState[] = state.players.map((p) => ({ ...p }));
  let stepCount = 1;
  let overrideTurnIndex: number | null = null;
  let event: GameEffectEvent = makeEvent(
    isJumpIn ? "jump_in" : "play",
    isJumpIn
      ? `${actor.nickname} POTONG GILIRAN dengan ${COLOR_META[nextActiveColor].name} ${getCardDisplayName(card.value)}!`
      : `${actor.nickname} mainkan ${
          card.color === "wild"
            ? getCardDisplayName(card.value)
            : `${COLOR_META[card.color].name} ${getCardDisplayName(card.value)}`
        }.`,
    { actorToken: playerToken }
  );

  // Check immediate win BEFORE special 7-swap modal (if last card is 7 or anything else, player wins immediately)
  const remainingAfterPlay = nextHands[playerToken].length;

  // Handle special card effects
  if (card.value === "skip") {
    stepCount = 2;
    const skippedIdx = getNextTurnIndex(
      actorIndex,
      nextDirection,
      nextPlayers.length,
      1
    );
    const skippedPlayer = nextPlayers[skippedIdx];
    event = makeEvent(
      "skip",
      `${actor.nickname} mainkan Lewat! Giliran ${skippedPlayer.nickname} dilompati.`,
      { actorToken: playerToken, targetToken: skippedPlayer.token }
    );
  } else if (card.value === "reverse") {
    if (nextPlayers.length === 2) {
      stepCount = 2;
      event = makeEvent(
        "reverse",
        `${actor.nickname} mainkan Putar Balik! Karena 2 pemain, giliran lanjut ke ${actor.nickname} lagi.`,
        { actorToken: playerToken }
      );
    } else {
      nextDirection = (nextDirection * -1) as 1 | -1;
      event = makeEvent(
        "reverse",
        `${actor.nickname} membalik arah permainan!`,
        { actorToken: playerToken }
      );
    }
  } else if (card.value === "draw2") {
    nextPendingDraw = state.pendingDraw + 2;
    nextPendingFrom = playerToken;
    event = makeEvent(
      "draw_penalty",
      `${actor.nickname} lempar Ambil 2! Total tumpukan sekarang +${nextPendingDraw}.`,
      { actorToken: playerToken }
    );
  } else if (card.value === "wild") {
    event = makeEvent(
      "play",
      `${actor.nickname} ganti warna jadi ${COLOR_META[nextActiveColor].name}!`,
      { actorToken: playerToken }
    );
  } else if (card.value === "wild4") {
    nextPendingDraw = state.pendingDraw + 4;
    nextPendingFrom = playerToken;
    event = makeEvent(
      "wild4",
      `${actor.nickname} jatuhkan Wild +4 ke warna ${COLOR_META[nextActiveColor].name}! Total hukuman +${nextPendingDraw}!`,
      { actorToken: playerToken, shake: true }
    );
  } else if (card.value === "z_shield") {
    if (state.pendingDraw > 0 && state.pendingDrawFromToken) {
      // Reflect the incoming penalty straight back to the sender!
      const attackerIndex = nextPlayers.findIndex(
        (p) => p.token === state.pendingDrawFromToken
      );
      const attacker =
        attackerIndex !== -1 ? nextPlayers[attackerIndex] : null;
      if (attacker && attacker.token !== playerToken) {
        overrideTurnIndex = attackerIndex;
        nextPendingDraw = state.pendingDraw;
        nextPendingFrom = playerToken;
        event = makeEvent(
          "z_shield_reflect",
          `TAMENG Z-SHIELD! ${actor.nickname} memantulkan +${state.pendingDraw} balik ke ${attacker.nickname}!`,
          { actorToken: playerToken, targetToken: attacker.token, shake: true }
        );
      } else {
        nextPendingDraw = 0;
        nextPendingFrom = null;
        event = makeEvent(
          "z_shield_reflect",
          `${actor.nickname} menangkis hukuman dengan Z-Shield!`,
          { actorToken: playerToken }
        );
      }
    } else {
      // Arm personal protective shield for next incoming +2 / +4
      nextPlayers[actorIndex].hasShield = true;
      event = makeEvent(
        "z_shield_arm",
        `${actor.nickname} mengaktifkan Tameng Z-Shield & memilih warna ${COLOR_META[nextActiveColor].name}!`,
        { actorToken: playerToken }
      );
    }
  } else if (card.value === "z_swap") {
    if (remainingAfterPlay > 0) {
      // Collect EVERY player's cards, shuffle together, and redistribute evenly
      const allCards: Card[] = [];
      for (const p of nextPlayers) {
        allCards.push(...nextHands[p.token]);
        nextHands[p.token] = [];
      }
      const shuffledPool = shuffleCards(allCards);
      let cursor = actorIndex;
      for (const pooledCard of shuffledPool) {
        const recipient = nextPlayers[cursor];
        nextHands[recipient.token].push(pooledCard);
        cursor = (cursor + 1) % nextPlayers.length;
      }
      event = makeEvent(
        "z_swap",
        `Z-SWAP KOCOK ULANG! ${actor.nickname} mencampur semua kartu & membaginya rata. Warna jadi ${COLOR_META[nextActiveColor].name}!`,
        { actorToken: playerToken, shake: true }
      );
    }
  } else if (
    card.value === "0" &&
    state.settings.seven_zero &&
    remainingAfterPlay > 0
  ) {
    // Rotate everyone's hands in the current direction of play!
    const snapshot: Record<string, Card[]> = {};
    for (const p of nextPlayers) {
      snapshot[p.token] = [...nextHands[p.token]];
    }
    for (let i = 0; i < nextPlayers.length; i += 1) {
      const targetIdx = getNextTurnIndex(i, nextDirection, nextPlayers.length, 1);
      nextHands[nextPlayers[targetIdx].token] = snapshot[nextPlayers[i].token];
    }
    event = makeEvent(
      "rotate_zero",
      `Aturan 0! ${actor.nickname} menggeser kartu semua pemain searah giliran!`,
      { actorToken: playerToken }
    );
  } else if (
    card.value === "7" &&
    state.settings.seven_zero &&
    remainingAfterPlay > 0 &&
    nextPlayers.length > 1
  ) {
    if (nextPlayers.length === 2) {
      // Auto-swap with the only other player
      const otherPlayer = nextPlayers.find((p) => p.token !== playerToken)!;
      const temp = nextHands[playerToken];
      nextHands[playerToken] = nextHands[otherPlayer.token];
      nextHands[otherPlayer.token] = temp;
      event = makeEvent(
        "swap_seven",
        `Aturan 7! ${actor.nickname} menukar seluruh kartunya dengan ${otherPlayer.nickname}!`,
        { actorToken: playerToken, targetToken: otherPlayer.token }
      );
    } else {
      // Wait for player to pick swap target
      nextPendingAction = {
        type: "CHOOSE_SWAP_TARGET",
        playerToken,
      };
      event = makeEvent(
        "swap_seven",
        `Aturan 7! ${actor.nickname} sedang memilih lawan untuk tukar kartu...`,
        { actorToken: playerToken }
      );
    }
  }

  // Auto-reflect if the next target has an armed Z-Shield and faces a +2 / +4 penalty!
  let nextTurnIndex =
    overrideTurnIndex !== null
      ? overrideTurnIndex
      : nextPendingAction
      ? actorIndex
      : getNextTurnIndex(actorIndex, nextDirection, nextPlayers.length, stepCount);

  if (
    remainingAfterPlay > 0 &&
    nextPendingDraw > 0 &&
    (card.value === "draw2" || card.value === "wild4")
  ) {
    const targetPlayer = nextPlayers[nextTurnIndex];
    if (targetPlayer && targetPlayer.hasShield && targetPlayer.token !== playerToken) {
      targetPlayer.hasShield = false;
      nextTurnIndex = actorIndex;
      nextPendingFrom = targetPlayer.token;
      event = makeEvent(
        "z_shield_reflect",
        `TAMENG AKTIF! Z-Shield milik ${targetPlayer.nickname} otomatis memantulkan +${nextPendingDraw} balik ke ${actor.nickname}!`,
        {
          actorToken: targetPlayer.token,
          targetToken: actor.token,
          shake: true,
        }
      );
    }
  }

  // Update card counts & mark newly vulnerable 1-card players
  nextPlayers = syncPlayerCounts(nextPlayers, nextHands);
  for (const p of nextPlayers) {
    if (p.cardCount === 1 && !p.unozCalled && p.unozVulnerableSince === null) {
      p.unozVulnerableSince = Date.now();
    }
  }

  // Check win condition (any player at 0 cards — e.g. actor or via 0/7 swap)
  const winner = nextPlayers.find((p) => p.cardCount === 0);
  if (winner) {
    const podium = buildPodium(nextPlayers, nextHands, winner.token);
    return {
      ...state,
      status: "finished",
      players: nextPlayers,
      hands: nextHands,
      drawPile: nextDrawPile,
      discardPile: nextDiscardPile,
      activeColor: nextActiveColor,
      currentTurnIndex: nextTurnIndex,
      direction: nextDirection,
      pendingDraw: 0,
      pendingDrawFromToken: null,
      pendingAction: null,
      drawnPlayableCardId: null,
      drawnByToken: null,
      unozPanicPos: null,
      unozPanicTargetToken: null,
      winnerToken: winner.token,
      podium,
      lastEvent: makeEvent(
        "win",
        `SELAMAT! ${winner.nickname} menghabiskan semua kartu dan menjadi PEMENANG!`,
        { actorToken: winner.token }
      ),
      turnNumber: state.turnNumber + 1,
    };
  }

  const panic = syncUnozPanicTarget(
    nextPlayers,
    state.unozPanicTargetToken,
    state.unozPanicPos
  );

  return {
    ...state,
    players: nextPlayers,
    hands: nextHands,
    drawPile: nextDrawPile,
    discardPile: nextDiscardPile,
    activeColor: nextActiveColor,
    currentTurnIndex: nextTurnIndex,
    direction: nextDirection,
    pendingDraw: nextPendingDraw,
    pendingDrawFromToken: nextPendingFrom,
    pendingAction: nextPendingAction,
    drawnPlayableCardId: null,
    drawnByToken: null,
    unozPanicPos: panic.unozPanicPos,
    unozPanicTargetToken: panic.unozPanicTargetToken,
    lastEvent: event,
    turnNumber: state.turnNumber + 1,
  };
}

export function applySwapTarget(
  state: FullGameState,
  playerToken: string,
  targetToken: string
): FullGameState {
  if (
    !state.pendingAction ||
    state.pendingAction.type !== "CHOOSE_SWAP_TARGET" ||
    state.pendingAction.playerToken !== playerToken
  ) {
    return state;
  }
  if (playerToken === targetToken) return state;

  const actorIndex = state.players.findIndex((p) => p.token === playerToken);
  const targetPlayer = state.players.find((p) => p.token === targetToken);
  if (actorIndex === -1 || !targetPlayer) return state;
  const actor = state.players[actorIndex];

  const nextHands: Record<string, Card[]> = {};
  for (const [k, v] of Object.entries(state.hands)) {
    nextHands[k] = [...v];
  }
  const temp = nextHands[playerToken];
  nextHands[playerToken] = nextHands[targetToken];
  nextHands[targetToken] = temp;

  const nextPlayers = syncPlayerCounts(
    state.players.map((p) => ({ ...p })),
    nextHands
  );
  for (const p of nextPlayers) {
    if (p.cardCount === 1 && !p.unozCalled && p.unozVulnerableSince === null) {
      p.unozVulnerableSince = Date.now();
    }
  }

  const nextTurnIndex = getNextTurnIndex(
    actorIndex,
    state.direction,
    nextPlayers.length,
    1
  );

  const panic = syncUnozPanicTarget(
    nextPlayers,
    state.unozPanicTargetToken,
    state.unozPanicPos
  );

  return {
    ...state,
    players: nextPlayers,
    hands: nextHands,
    pendingAction: null,
    currentTurnIndex: nextTurnIndex,
    unozPanicPos: panic.unozPanicPos,
    unozPanicTargetToken: panic.unozPanicTargetToken,
    lastEvent: makeEvent(
      "swap_seven",
      `Tukar Kartu 7! ${actor.nickname} bertukar kartu dengan ${targetPlayer.nickname}!`,
      { actorToken: playerToken, targetToken }
    ),
    turnNumber: state.turnNumber + 1,
  };
}

export function applyDrawCard(
  state: FullGameState,
  playerToken: string,
  forceAutoSkip = false
): FullGameState {
  if (state.status !== "playing" || state.pendingAction) return state;
  const currentPlayer = state.players[state.currentTurnIndex];
  if (!currentPlayer || currentPlayer.token !== playerToken) return state;

  // Prevent double draw in same turn when player already drew a playable card
  if (state.drawnByToken === playerToken && state.drawnPlayableCardId && !forceAutoSkip) {
    return applyPassTurn(state, playerToken);
  }

  const nextHands: Record<string, Card[]> = {};
  for (const [k, v] of Object.entries(state.hands)) {
    nextHands[k] = [...v];
  }

  const drawAmount = state.pendingDraw > 0 ? state.pendingDraw : 1;
  const { drawn, nextDrawPile, nextDiscardPile } = drawFromPile(
    state.drawPile,
    state.discardPile,
    drawAmount
  );

  nextHands[playerToken].push(...drawn);
  const nextPlayers = syncPlayerCounts(
    state.players.map((p) => ({ ...p })),
    nextHands
  );
  const panic = syncUnozPanicTarget(
    nextPlayers,
    state.unozPanicTargetToken,
    state.unozPanicPos
  );

  // If facing a penalty draw (+2/+4) or auto-skipping disconnected player, turn advances immediately
  if (state.pendingDraw > 0 || forceAutoSkip) {
    const nextTurnIndex = getNextTurnIndex(
      state.currentTurnIndex,
      state.direction,
      nextPlayers.length,
      1
    );
    return {
      ...state,
      players: nextPlayers,
      hands: nextHands,
      drawPile: nextDrawPile,
      discardPile: nextDiscardPile,
      pendingDraw: 0,
      pendingDrawFromToken: null,
      drawnPlayableCardId: null,
      drawnByToken: null,
      currentTurnIndex: nextTurnIndex,
      unozPanicPos: panic.unozPanicPos,
      unozPanicTargetToken: panic.unozPanicTargetToken,
      lastEvent: makeEvent(
        forceAutoSkip ? "auto_skip" : "draw_penalty",
        forceAutoSkip
          ? `${currentPlayer.nickname} sedang terputus — otomatis ambil ${drawAmount} kartu & lewati giliran.`
          : `${currentPlayer.nickname} mengambil ${drawAmount} kartu hukuman!`,
        { actorToken: playerToken }
      ),
      turnNumber: state.turnNumber + 1,
    };
  }

  // Normal single card draw: check if the drawn card is immediately playable
  const drawnCard = drawn[0];
  const checkState: FullGameState = {
    ...state,
    players: nextPlayers,
    hands: nextHands,
    drawPile: nextDrawPile,
    discardPile: nextDiscardPile,
    drawnPlayableCardId: null,
    drawnByToken: null,
  };

  if (drawnCard && canPlayCard(checkState, playerToken, drawnCard).playable) {
    return {
      ...checkState,
      drawnPlayableCardId: drawnCard.id,
      drawnByToken: playerToken,
      unozPanicPos: panic.unozPanicPos,
      unozPanicTargetToken: panic.unozPanicTargetToken,
      lastEvent: makeEvent(
        "draw",
        `${currentPlayer.nickname} ambil 1 kartu — kartu bisa langsung dimainkan!`,
        { actorToken: playerToken }
      ),
    };
  }

  // Otherwise advance turn right away
  const nextTurnIndex = getNextTurnIndex(
    state.currentTurnIndex,
    state.direction,
    nextPlayers.length,
    1
  );
  return {
    ...checkState,
    currentTurnIndex: nextTurnIndex,
    unozPanicPos: panic.unozPanicPos,
    unozPanicTargetToken: panic.unozPanicTargetToken,
    lastEvent: makeEvent(
      "draw",
      `${currentPlayer.nickname} ambil 1 kartu & giliran berpindah.`,
      { actorToken: playerToken }
    ),
    turnNumber: state.turnNumber + 1,
  };
}

export function applyPassTurn(
  state: FullGameState,
  playerToken: string
): FullGameState {
  if (state.status !== "playing") return state;
  const currentPlayer = state.players[state.currentTurnIndex];
  if (!currentPlayer || currentPlayer.token !== playerToken) return state;
  if (state.drawnByToken !== playerToken) return state;

  const nextTurnIndex = getNextTurnIndex(
    state.currentTurnIndex,
    state.direction,
    state.players.length,
    1
  );
  return {
    ...state,
    currentTurnIndex: nextTurnIndex,
    drawnPlayableCardId: null,
    drawnByToken: null,
    lastEvent: makeEvent("info", `${currentPlayer.nickname} memilih lewati giliran.`, {
      actorToken: playerToken,
    }),
    turnNumber: state.turnNumber + 1,
  };
}

export function applyCallUnoz(
  state: FullGameState,
  playerToken: string
): FullGameState {
  if (state.status !== "playing") return state;
  const idx = state.players.findIndex((p) => p.token === playerToken);
  if (idx === -1) return state;

  const target = state.players[idx];
  if (target.cardCount !== 1 || target.unozCalled) return state;

  const nextPlayers = state.players.map((p, i) =>
    i === idx ? { ...p, unozCalled: true, unozVulnerableSince: null } : p
  );
  const panic = syncUnozPanicTarget(
    nextPlayers,
    state.unozPanicTargetToken,
    state.unozPanicPos
  );

  return {
    ...state,
    players: nextPlayers,
    unozPanicPos: panic.unozPanicPos,
    unozPanicTargetToken: panic.unozPanicTargetToken,
    lastEvent: makeEvent(
      "unoz_call",
      `${target.nickname} teriak "unoZ!" tepat waktu! Aman!`,
      { actorToken: playerToken }
    ),
  };
}

export function applyTegurPlayer(
  state: FullGameState,
  callerToken: string,
  targetToken: string,
  now = Date.now()
): FullGameState {
  if (state.status !== "playing") return state;
  if (callerToken === targetToken) return state;

  const caller = state.players.find((p) => p.token === callerToken);
  const targetIdx = state.players.findIndex((p) => p.token === targetToken);
  if (!caller || targetIdx === -1) return state;

  const target = state.players[targetIdx];
  if (
    target.cardCount !== 1 ||
    target.unozCalled ||
    target.unozVulnerableSince === null
  ) {
    return state;
  }

  // Enforce the 3-second window before others can call out
  if (now - target.unozVulnerableSince < UNOZ_GRACE_MS) {
    return state;
  }

  const nextHands: Record<string, Card[]> = {};
  for (const [k, v] of Object.entries(state.hands)) {
    nextHands[k] = [...v];
  }

  const { drawn, nextDrawPile, nextDiscardPile } = drawFromPile(
    state.drawPile,
    state.discardPile,
    2
  );
  nextHands[targetToken].push(...drawn);

  const nextPlayers = syncPlayerCounts(
    state.players.map((p) => ({ ...p })),
    nextHands
  );
  const panic = syncUnozPanicTarget(
    nextPlayers,
    state.unozPanicTargetToken,
    state.unozPanicPos
  );

  return {
    ...state,
    players: nextPlayers,
    hands: nextHands,
    drawPile: nextDrawPile,
    discardPile: nextDiscardPile,
    unozPanicPos: panic.unozPanicPos,
    unozPanicTargetToken: panic.unozPanicTargetToken,
    lastEvent: makeEvent(
      "tegur",
      `KETAHUAN! ${caller.nickname} menegur ${target.nickname} yang lupa teriak unoZ! Hukuman +2 kartu!`,
      { actorToken: callerToken, targetToken, shake: true }
    ),
  };
}

export function toPublicGameState(state: FullGameState): PublicGameState {
  return {
    roomCode: state.roomCode,
    status: state.status,
    settings: state.settings,
    players: state.players,
    discardPile: state.discardPile.slice(-6),
    drawPileCount: state.drawPile.length,
    activeColor: state.activeColor,
    currentTurnIndex: state.currentTurnIndex,
    direction: state.direction,
    pendingDraw: state.pendingDraw,
    pendingDrawFromToken: state.pendingDrawFromToken,
    pendingAction: state.pendingAction,
    drawnPlayableCardId: state.drawnPlayableCardId,
    drawnByToken: state.drawnByToken,
    unozPanicPos: state.unozPanicPos,
    unozPanicTargetToken: state.unozPanicTargetToken,
    lastEvent: state.lastEvent,
    winnerToken: state.winnerToken,
    podium: state.podium,
    turnNumber: state.turnNumber,
  };
}
