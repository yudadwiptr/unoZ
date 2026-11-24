"use client";

import { ArrowLeftRight } from "lucide-react";
import React from "react";
import { AvatarBadge } from "@/components/AvatarIcon";
import type { PublicPlayerState } from "@/types/game";

interface SwapTargetModalProps {
  open: boolean;
  candidates: PublicPlayerState[];
  onSelect: (targetToken: string) => void;
}

export function SwapTargetModal({
  open,
  candidates,
  onSelect,
}: SwapTargetModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-pop-in">
      <div className="w-full max-w-sm rounded-3xl glass-panel p-5 space-y-4">
        <div className="text-center space-y-1">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center shadow-lg">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white pt-1">
            Aturan Angka 7!
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pilih pemain yang ingin kamu tukar semua kartunya!
          </p>
        </div>

        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {candidates.map((player) => (
            <button
              key={player.token}
              type="button"
              onClick={() => onSelect(player.token)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-100/90 dark:bg-white/10 hover:bg-amber-400/20 border border-slate-200 dark:border-white/10 hover:border-amber-400 transition active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <AvatarBadge avatarId={player.avatar} size="md" />
                <div className="text-left">
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    {player.nickname}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sisa {player.cardCount} kartu
                  </p>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold">
                Tukar!
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
