import { CARD_COLORS, getDrawAmount, isMegaDraw } from "@/lib/constants";
import { canJumpInCard, canPlayCard, isCardWild } from "@/lib/game-engine";
import type { Card, CardColor, FullGameState } from "@/types/game";

export type BotDecision =
  | { type: "PLAY_CARD"; cardId: string; chosenColor?: CardColor }
  | { type: "DRAW_CARD" }
  | { type: "PASS_TURN" }
  | { type: "CHOOSE_SWAP_TARGET"; targetToken: string };

function pickBestColor(hand: Card[]): CardColor {
  const counts: Record<CardColor, number> = {
    merah: 0,
    biru: 0,
    kuning: 0,
    hijau: 0,
  };
  for (const c of hand) {
    if (c.color !== "wild") {
      counts[c.color] += 1;
    }
  }
  let best: CardColor = CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)];
  let max = -1;
  for (const color of CARD_COLORS) {
    if (counts[color] > max) {
      max = counts[color];
      best = color;
    }
  }
  return best;
}

export function decideBotMove(
  state: FullGameState,
  botToken: string
): BotDecision {
  const hand = state.hands[botToken] ?? [];

  // Handle pending 7-swap decision
  if (
    state.pendingAction?.type === "CHOOSE_SWAP_TARGET" &&
    state.pendingAction.playerToken === botToken
  ) {
    const others = state.players
      .filter((p) => p.token !== botToken)
      .sort((a, b) => a.cardCount - b.cardCount);
    const target = others[0];
    return {
      type: "CHOOSE_SWAP_TARGET",
      targetToken: target.token,
    };
  }

  // Filter playable cards
  const playableCards = hand.filter(
    (card) => canPlayCard(state, botToken, card).playable
  );

  if (playableCards.length === 0) {
    if (state.drawnByToken === botToken && state.drawnPlayableCardId) {
      return { type: "PASS_TURN" };
    }
    return { type: "DRAW_CARD" };
  }

  // If facing incoming penalty, prioritize Z-Shield reflect, then +2, then Wild +4
  if (state.pendingDraw > 0) {
    const shield = playableCards.find((c) => c.value === "z_shield");
    if (shield) {
      return {
        type: "PLAY_CARD",
        cardId: shield.id,
        chosenColor: pickBestColor(hand),
      };
    }
    // Counter with the smallest penalty card that still stacks, save the big guns
    const counters = playableCards
      .filter((c) => getDrawAmount(c.value) > 0)
      .sort((a, b) => getDrawAmount(a.value) - getDrawAmount(b.value));
    if (counters.length > 0) {
      const counter = counters[0];
      return {
        type: "PLAY_CARD",
        cardId: counter.id,
        chosenColor: counter.color === "wild" ? pickBestColor(hand.filter((c) => c.id !== counter.id)) : undefined,
      };
    }
  }

  // If bot has many cards and holds Z-Swap while someone else is low, play Z-Swap!
  const minOpponentCards = Math.min(
    ...state.players
      .filter((p) => p.token !== botToken)
      .map((p) => p.cardCount)
  );
  if (hand.length >= 5 && minOpponentCards <= 2) {
    const zSwap = playableCards.find((c) => c.value === "z_swap");
    if (zSwap) {
      return {
        type: "PLAY_CARD",
        cardId: zSwap.id,
        chosenColor: pickBestColor(hand),
      };
    }
  }

  // Someone is about to win: drop the biggest Super draw card we hold
  if (minOpponentCards <= 2) {
    const mega = playableCards
      .filter((c) => isMegaDraw(c.value))
      .sort((a, b) => getDrawAmount(b.value) - getDrawAmount(a.value))[0];
    if (mega) {
      return {
        type: "PLAY_CARD",
        cardId: mega.id,
        chosenColor: pickBestColor(hand.filter((c) => c.id !== mega.id)),
      };
    }
  }

  // Prefer colored action cards when opponent is close to winning, otherwise save Wilds for last
  const nonWilds = playableCards.filter((c) => !isCardWild(c));
  if (nonWilds.length > 0) {
    const scored = [...nonWilds].sort((a, b) => {
      const score = (c: Card): number => {
        let s = 0;
        if (minOpponentCards <= 2) {
          if (c.value === "draw2") s += 30;
          if (c.value === "skip" || c.value === "reverse") s += 20;
          if (c.value === "7" && state.settings.seven_zero) s += 25;
        }
        // Prefer matching active color to keep options flexible
        if (c.color === state.activeColor) s += 5;
        if (/^[1-9]$/.test(c.value)) s += Number(c.value) * 0.5;
        return s;
      };
      return score(b) - score(a);
    });
    return { type: "PLAY_CARD", cardId: scored[0].id };
  }

  // Play wild card
  const chosen = playableCards[0];
  return {
    type: "PLAY_CARD",
    cardId: chosen.id,
    chosenColor: pickBestColor(hand.filter((c) => c.id !== chosen.id)),
  };
}

export function findBotJumpInMove(
  state: FullGameState
): { botToken: string; cardId: string } | null {
  if (!state.settings.jump_in || state.status !== "playing") return null;
  if (state.pendingDraw > 0 || state.pendingAction) return null;

  for (const player of state.players) {
    if (!player.isBot) continue;
    const hand = state.hands[player.token] ?? [];
    const match = hand.find((c) => canJumpInCard(state, player.token, c));
    if (match) {
      return { botToken: player.token, cardId: match.id };
    }
  }
  return null;
}
