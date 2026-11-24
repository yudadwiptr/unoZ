"use client";

import React, { useRef } from "react";
import { UnoCard } from "@/components/UnoCard";
import { canPlayCard } from "@/lib/game-engine";
import type { Card, PublicGameState } from "@/types/game";

interface PlayerHandFanProps {
  hand: Card[];
  gameState: PublicGameState;
  playerToken: string;
  onCardClick: (card: Card) => void;
}

export function PlayerHandFan({
  hand,
  gameState,
  playerToken,
  onCardClick,
}: PlayerHandFanProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Sort hand neatly by color & value for easy one-thumb scanning
  const colorOrder: Record<string, number> = {
    merah: 0,
    biru: 1,
    kuning: 2,
    hijau: 3,
    wild: 4,
  };
  const sortedHand = [...hand].sort((a, b) => {
    const cDiff = (colorOrder[a.color] ?? 5) - (colorOrder[b.color] ?? 5);
    if (cDiff !== 0) return cDiff;
    return a.value.localeCompare(b.value);
  });

  const total = sortedHand.length;
  const overlapClass =
    total <= 5
      ? "-ml-2 first:ml-0"
      : total <= 9
      ? "-ml-6 sm:-ml-5 first:ml-0"
      : "-ml-9 sm:-ml-7 first:ml-0";

  return (
    <div className="relative w-full">
      {/* Subtle swipe hint when holding many cards on narrow mobile screens */}
      {total > 6 && (
        <div className="flex justify-center mb-1">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Geser kiri/kanan untuk melihat semua {total} kartumu
          </span>
        </div>
      )}

      <div
        ref={scrollRef}
        className="no-scrollbar flex items-end justify-start sm:justify-center overflow-x-auto overflow-y-visible px-6 pt-8 pb-3 snap-x snap-proximity touch-pan-x"
      >
        <div className="inline-flex items-end mx-auto">
          {sortedHand.map((card, idx) => {
            const { playable, isJumpIn } = canPlayCard(gameState, playerToken, card);
            const mid = (total - 1) / 2;
            const ratio = total > 1 ? (idx - mid) / Math.max(mid, 1) : 0;
            // Gentle mobile-friendly fan angle (bounded so cards stay super readable)
            const maxAngle = total <= 7 ? 10 : 7;
            const angle = Math.max(-maxAngle, Math.min(maxAngle, ratio * maxAngle));
            const arcDrop = Math.abs(ratio) * (total <= 7 ? 12 : 7);

            return (
              <div
                key={card.id}
                className={`relative shrink-0 snap-center transition-transform duration-200 ${overlapClass} ${
                  playable ? "z-20 hover:z-40" : "z-10 hover:z-30"
                }`}
                style={{
                  transform: `translateY(${playable ? arcDrop - 10 : arcDrop}px) rotate(${angle}deg)`,
                }}
              >
                <UnoCard
                  card={card}
                  size="md"
                  playable={playable}
                  isJumpIn={isJumpIn}
                  disabled={!playable}
                  onClick={playable ? () => onCardClick(card) : undefined}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
