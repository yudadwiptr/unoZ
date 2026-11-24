"use client";

import {
  AlertTriangle,
  ArrowRightCircle,
  BookOpen,
  Bot,
  LogOut,
  MessageCircle,
  RotateCcw,
  RotateCw,
  Shield,
  Sparkles,
  WifiOff,
  Zap,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { AvatarBadge, EmoteIcon } from "@/components/AvatarIcon";
import { ColorPickerModal } from "@/components/ColorPickerModal";
import { PlayerHandFan } from "@/components/PlayerHandFan";
import { SwapTargetModal } from "@/components/SwapTargetModal";
import { ColorSymbol, UnoCard, UnoCardBack } from "@/components/UnoCard";
import { WinnerPodiumModal } from "@/components/WinnerPodiumModal";
import {
  COLOR_META,
  MODE_LABEL,
  getCardDisplayName,
  QUICK_EMOTES,
} from "@/lib/constants";
import { isCardWild, UNOZ_GRACE_MS } from "@/lib/game-engine";
import { soundEngine } from "@/lib/sound";
import type {
  Card,
  CardColor,
  EmoteBubble,
  PublicGameState,
  PublicPlayerState,
} from "@/types/game";

interface GameBoardProps {
  gameState: PublicGameState;
  myHand: Card[];
  playerToken: string;
  isHost: boolean;
  isShaking: boolean;
  emotes: EmoteBubble[];
  onPlayCard: (cardId: string, chosenColor?: CardColor) => void;
  onDrawCard: () => void;
  onPassTurn: () => void;
  onChooseSwapTarget: (targetToken: string) => void;
  onCallUnoz: () => void;
  onTegurPlayer: (targetToken: string) => void;
  onSendEmote: (text: string) => void;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
  onOpenRules: () => void;
}

export function GameBoard({
  gameState,
  myHand,
  playerToken,
  isHost,
  isShaking,
  emotes,
  onPlayCard,
  onDrawCard,
  onPassTurn,
  onChooseSwapTarget,
  onCallUnoz,
  onTegurPlayer,
  onSendEmote,
  onPlayAgain,
  onBackToLobby,
  onOpenRules,
}: GameBoardProps) {
  const [pendingWildCard, setPendingWildCard] = useState<Card | null>(null);
  const [showEmoteBar, setShowEmoteBar] = useState<boolean>(true);
  const [nowTick, setNowTick] = useState<number>(() => Date.now());

  // Tick every 200ms while someone is in the 3-second unoZ! panic/tegur window
  const hasAnyVulnerable = gameState.players.some(
    (p) => p.cardCount === 1 && !p.unozCalled && p.unozVulnerableSince !== null
  );

  useEffect(() => {
    if (!hasAnyVulnerable) return;
    const id = window.setInterval(() => setNowTick(Date.now()), 200);
    return () => window.clearInterval(id);
  }, [hasAnyVulnerable]);

  const activePlayer = gameState.players[gameState.currentTurnIndex];
  const isMyTurn = activePlayer?.token === playerToken && gameState.status === "playing";
  const me = gameState.players.find((p) => p.token === playerToken);
  const opponents = useMemo(() => {
    const myIdx = gameState.players.findIndex((p) => p.token === playerToken);
    if (myIdx === -1) return gameState.players;
    // Arrange opponents clockwise starting after the current player
    const ordered: PublicPlayerState[] = [];
    for (let i = 1; i < gameState.players.length; i += 1) {
      ordered.push(gameState.players[(myIdx + i) % gameState.players.length]);
    }
    return ordered;
  }, [gameState.players, playerToken]);

  const topDiscard = gameState.discardPile[gameState.discardPile.length - 1];
  const activeColorMeta = COLOR_META[gameState.activeColor];

  // Check if I need to smash the randomized "unoZ!" Panic Button
  const showMyUnozPanic =
    gameState.status === "playing" &&
    Boolean(me && me.cardCount === 1 && !me.unozCalled && me.unozVulnerableSince);

  const myGraceRemainingSec =
    showMyUnozPanic && me?.unozVulnerableSince
      ? Math.max(0, (UNOZ_GRACE_MS - (nowTick - me.unozVulnerableSince)) / 1000)
      : 0;

  // Check opponents who forgot to press "unoZ!" past the 3-second grace period
  const tegurableOpponents = opponents.filter(
    (p) =>
      p.cardCount === 1 &&
      !p.unozCalled &&
      p.unozVulnerableSince !== null &&
      nowTick - p.unozVulnerableSince >= UNOZ_GRACE_MS
  );

  const mustChooseSwap =
    gameState.pendingAction?.type === "CHOOSE_SWAP_TARGET" &&
    gameState.pendingAction.playerToken === playerToken;

  const myLatestEmote = [...emotes]
    .reverse()
    .find((e) => e.senderToken === playerToken);

  const handleCardTap = (card: Card) => {
    // Playing Z-Shield to reflect an incoming penalty does NOT need color picker
    if (card.value === "z_shield" && gameState.pendingDraw > 0) {
      onPlayCard(card.id);
      return;
    }
    if (isCardWild(card)) {
      soundEngine.play("click");
      setPendingWildCard(card);
      return;
    }
    onPlayCard(card.id);
  };

  const canPassAfterDraw =
    isMyTurn &&
    gameState.drawnByToken === playerToken &&
    Boolean(gameState.drawnPlayableCardId);

  return (
    <div
      className={`relative w-full min-h-[calc(100dvh-56px)] flex flex-col justify-between overflow-hidden ${
        isShaking ? "animate-screen-shake" : ""
      }`}
    >
      {/* Ambient Color Glow synced to Active Card Color */}
      <div
        className={`pointer-events-none fixed inset-0 -z-10 opacity-20 dark:opacity-25 transition-colors duration-700 bg-radial ${
          gameState.activeColor === "merah"
            ? "from-red-500/70 via-transparent to-transparent"
            : gameState.activeColor === "biru"
            ? "from-blue-500/70 via-transparent to-transparent"
            : gameState.activeColor === "kuning"
            ? "from-amber-400/70 via-transparent to-transparent"
            : "from-emerald-500/70 via-transparent to-transparent"
        }`}
      />

      {/* TOP BAR: Compact Room Info & Quick Controls */}
      <div className="w-full max-w-5xl mx-auto px-3 pt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-xl glass-panel text-xs font-display font-bold tracking-wider text-slate-800 dark:text-slate-100">
            #{gameState.roomCode}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-200/70 dark:bg-white/10 text-[11px] font-bold text-slate-600 dark:text-slate-300">
            {MODE_LABEL[gameState.settings.mode] ?? "Klasik"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenRules}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel text-xs font-bold text-slate-700 dark:text-slate-200 hover:brightness-105 transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden xs:inline">Cara Main</span>
          </button>
          <button
            type="button"
            onClick={onBackToLobby}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-500/25 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lobby</span>
          </button>
        </div>
      </div>

      {/* OPPONENTS STRIP */}
      <div className="w-full max-w-5xl mx-auto px-3 pt-2">
        <div className="no-scrollbar flex items-start justify-start sm:justify-center gap-2.5 overflow-x-auto pb-2 pt-2">
          {opponents.map((opp) => {
            const isTurn =
              activePlayer?.token === opp.token && gameState.status === "playing";
            const canTegur =
              opp.cardCount === 1 &&
              !opp.unozCalled &&
              opp.unozVulnerableSince !== null &&
              nowTick - opp.unozVulnerableSince >= UNOZ_GRACE_MS;
            const oppEmote = [...emotes]
              .reverse()
              .find((e) => e.senderToken === opp.token);

            return (
              <div
                key={opp.token}
                className={`relative shrink-0 w-28 sm:w-32 rounded-2xl p-2.5 transition-all duration-300 ${
                  isTurn
                    ? "glass-panel shadow-lg shadow-amber-500/20 scale-[1.03]"
                    : "glass-panel opacity-90"
                }`}
              >
                {/* Running turn loader around the active player's chip */}
                {isTurn && (
                  <span
                    aria-hidden="true"
                    className="turn-loader pointer-events-none absolute -inset-[3px] rounded-[1.1rem]"
                  />
                )}

                {/* Floating Emote Bubble above Opponent */}
                {oppEmote && (
                  <div
                    key={oppEmote.id}
                    className="animate-float-bubble pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-extrabold text-[11px] shadow-xl border border-amber-400/60"
                  >
                    <EmoteIcon text={oppEmote.text} className="w-3 h-3 shrink-0" />
                    <span>{oppEmote.text}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <div className="relative shrink-0">
                    <AvatarBadge
                      avatarId={opp.avatar}
                      size="sm"
                      className={`w-9 h-9 ${isTurn ? "ring-2 ring-amber-400" : ""}`}
                    />
                    {!opp.isOnline && (
                      <span
                        title="Terputus"
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center"
                      >
                        <WifiOff className="w-2.5 h-2.5" />
                      </span>
                    )}
                    {opp.hasShield && (
                      <span
                        title="Tameng Z-Shield Aktif"
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow"
                      >
                        <Shield className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {opp.nickname}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {opp.isBot && (
                        <Bot className="w-3 h-3 text-sky-500 shrink-0" />
                      )}
                      <span
                        className={`text-[11px] font-extrabold ${
                          opp.cardCount === 1
                            ? "text-rose-500 dark:text-rose-400"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {opp.cardCount} kartu
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="mt-2 flex items-center justify-between gap-1">
                  {opp.cardCount === 1 && opp.unozCalled ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold">
                      unoZ! Aman
                    </span>
                  ) : isTurn ? (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-amber-600 dark:text-amber-300">
                      {opp.isBot ? "Mikir" : "Giliran"}
                      <span className="turn-dots inline-flex gap-0.5" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                      </span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {opp.isOnline ? "Menunggu" : "Terputus"}
                    </span>
                  )}

                  {canTegur && (
                    <button
                      type="button"
                      onClick={() => onTegurPlayer(opp.token)}
                      className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold shadow-md animate-bounce hover:bg-rose-600 cursor-pointer"
                    >
                      Tegur!
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CENTER TABLE AREA */}
      <div className="flex-1 flex flex-col items-center justify-center px-3 py-2 gap-3 relative">
        {/* Global Tegur Alert Bar if ANY opponent forgot to hit unoZ! */}
        {tegurableOpponents.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 animate-pop-in">
            {tegurableOpponents.map((target) => (
              <button
                key={target.token}
                type="button"
                onClick={() => onTegurPlayer(target.token)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-red-600 text-white font-display font-bold text-sm shadow-xl shadow-rose-500/35 hover:scale-105 active:scale-95 transition cursor-pointer animate-bounce"
              >
                <AlertTriangle className="w-4 h-4" />
                Tegur! {target.nickname} lupa unoZ (+2)
              </button>
            ))}
          </div>
        )}

        {/* Center Table */}
        <div className="relative flex items-center justify-center p-5 sm:p-7">

          {/* Center Piles: Draw Deck + Discard Stack */}
          <div className="relative z-10 flex items-center gap-5 sm:gap-7">
            <div className="flex flex-col items-center gap-1.5">
              <UnoCardBack
                size="lg"
                countBadge={gameState.drawPileCount}
                highlight={isMyTurn && !canPassAfterDraw}
                onClick={isMyTurn ? onDrawCard : undefined}
                label={
                  gameState.pendingDraw > 0
                    ? `Ambil ${gameState.pendingDraw} kartu hukuman`
                    : "Ambil 1 kartu dari tumpukan"
                }
              />
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                {gameState.pendingDraw > 0 && isMyTurn
                  ? `Ambil +${gameState.pendingDraw}`
                  : "Tumpukan"}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <div className="relative">
                {/* Underlying previous discard card peeking slightly */}
                {gameState.discardPile.length > 1 && (
                  <div className="pointer-events-none absolute inset-0 -rotate-6 opacity-65 scale-95">
                    <UnoCard
                      card={gameState.discardPile[gameState.discardPile.length - 2]}
                      size="lg"
                    />
                  </div>
                )}
                {topDiscard && (
                  <div key={topDiscard.id} className="relative animate-pop-in">
                    <UnoCard
                      card={topDiscard}
                      size="lg"
                      activeWildColor={gameState.activeColor}
                    />
                  </div>
                )}
              </div>

              {/* Active Color + Direction Pill */}
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold shadow-sm ${activeColorMeta.badgeBg}`}
                >
                  <ColorSymbol color={gameState.activeColor} className="w-3 h-3" />
                  {activeColorMeta.name}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-white/10 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  {gameState.direction === 1 ? (
                    <>
                      <RotateCw className="w-3 h-3" />
                      Searah
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3 h-3" />
                      Berbalik
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Penalty Stack Alert */}
        {gameState.pendingDraw > 0 && (
          <div className="px-4 py-1.5 rounded-full bg-rose-500 text-white font-display font-bold text-sm shadow-lg shadow-rose-500/35 inline-flex items-center gap-2 animate-bounce">
            <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
            Hukuman Aktif: +{gameState.pendingDraw} Kartu!
            {gameState.settings.z_cards && " (Bisa dibalas Z-Shield!)"}
          </div>
        )}

        {/* Live Action Notification Ticker */}
        {gameState.lastEvent && (
          <div
            key={gameState.lastEvent.id}
            className="max-w-md w-full px-4 py-2 rounded-2xl glass-panel text-center text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 animate-pop-in"
          >
            {gameState.lastEvent.message}
          </div>
        )}
      </div>

      {/* RANDOMIZED "unoZ!" PANIC BUTTON (when player has 1 card left!) */}
      {showMyUnozPanic && gameState.unozPanicPos && (
        <div
          className="fixed z-40 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${gameState.unozPanicPos.x}%`,
            top: `${gameState.unozPanicPos.y}%`,
          }}
        >
          <button
            type="button"
            onClick={onCallUnoz}
            className="animate-panic-pulse relative px-6 py-4 rounded-full bg-gradient-to-br from-red-500 via-amber-400 to-rose-600 text-slate-950 font-display font-extrabold text-2xl sm:text-3xl tracking-tight border-4 border-white shadow-2xl cursor-pointer active:scale-90 transition"
          >
            unoZ!
            <span className="block text-[11px] font-sans font-extrabold bg-slate-950/85 text-amber-300 px-2 py-0.5 rounded-full mt-0.5">
              {myGraceRemainingSec > 0
                ? `Cepat! ${myGraceRemainingSec.toFixed(1)} dtk`
                : "TEKAN SEKARANG!"}
            </span>
          </button>
        </div>
      )}

      {/* BOTTOM PLAYER AREA: Turn Status + Emote Bar + Swipeable Hand Fan */}
      <div className="w-full max-w-5xl mx-auto px-2 pb-3 pt-1 flex flex-col gap-1.5 relative">
        {/* My own floating emote bubble */}
        {myLatestEmote && (
          <div
            key={myLatestEmote.id}
            className="animate-float-bubble pointer-events-none self-center mb-1 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-extrabold text-xs shadow-xl"
          >
            <EmoteIcon text={myLatestEmote.text} className="w-3.5 h-3.5 !text-slate-950" />
            <span>Kamu: &ldquo;{myLatestEmote.text}&rdquo;</span>
          </div>
        )}

        {/* Turn Bar & Quick Thumb Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-2">
          <div className="flex items-center gap-2">
            <span
              className={`relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-extrabold transition ${
                isMyTurn
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/25"
                  : "glass-panel text-slate-700 dark:text-slate-200"
              }`}
            >
              {isMyTurn && (
                <span
                  aria-hidden="true"
                  className="turn-loader pointer-events-none absolute -inset-[4px] rounded-full"
                />
              )}
              {isMyTurn ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Giliran Kamu!
                </>
              ) : (
                <>Giliran: {activePlayer?.nickname ?? "..."}</>
              )}
            </span>

            {me?.hasShield && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-600 dark:text-cyan-300 text-[11px] font-extrabold">
                <Shield className="w-3.5 h-3.5" />
                Tameng Aktif
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {canPassAfterDraw ? (
              <button
                type="button"
                onClick={onPassTurn}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 dark:bg-white text-white dark:text-slate-950 text-xs font-extrabold shadow active:scale-95 transition cursor-pointer"
              >
                <ArrowRightCircle className="w-4 h-4" />
                Lewati Giliran
              </button>
            ) : isMyTurn ? (
              <button
                type="button"
                onClick={onDrawCard}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-500 text-white text-xs font-extrabold shadow hover:bg-sky-600 active:scale-95 transition cursor-pointer"
              >
                {gameState.pendingDraw > 0
                  ? `Terima +${gameState.pendingDraw} Kartu`
                  : "Ambil Kartu"}
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => setShowEmoteBar((v) => !v)}
              aria-label="Tampilkan atau sembunyikan reaksi cepat"
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                showEmoteBar
                  ? "bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-300 border border-fuchsia-400/40"
                  : "glass-panel text-slate-600 dark:text-slate-300"
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Reaksi</span>
            </button>
          </div>
        </div>

        {/* Quick Emote & Reaction Bar (6 Indonesian Banter Presets with SVG Icons) */}
        {showEmoteBar && (
          <div className="no-scrollbar flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto px-2 py-1">
            {QUICK_EMOTES.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onSendEmote(preset)}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-amber-400 hover:text-slate-950 active:scale-90 transition cursor-pointer"
              >
                <EmoteIcon text={preset} className="w-3.5 h-3.5 shrink-0" />
                <span>{preset}</span>
              </button>
            ))}
          </div>
        )}

        {/* Interactive Mobile-First Swipeable Fan Hand */}
        <PlayerHandFan
          hand={myHand}
          gameState={gameState}
          playerToken={playerToken}
          onCardClick={handleCardTap}
        />
      </div>

      {/* Wild / Z-Card Color Picker Modal */}
      <ColorPickerModal
        open={Boolean(pendingWildCard)}
        cardTitle={
          pendingWildCard ? getCardDisplayName(pendingWildCard.value) : ""
        }
        onSelect={(color) => {
          if (pendingWildCard) {
            onPlayCard(pendingWildCard.id, color);
          }
          setPendingWildCard(null);
        }}
        onCancel={() => setPendingWildCard(null)}
      />

      {/* Rule 7 Swap Target Modal */}
      <SwapTargetModal
        open={mustChooseSwap}
        candidates={opponents}
        onSelect={onChooseSwapTarget}
      />

      {/* Winner Podium + Confetti Modal */}
      <WinnerPodiumModal
        open={gameState.status === "finished"}
        podium={gameState.podium}
        myToken={playerToken}
        isHost={isHost}
        onPlayAgain={onPlayAgain}
        onBackToLobby={onBackToLobby}
      />
    </div>
  );
}
