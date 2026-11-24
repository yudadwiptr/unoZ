"use client";

import React from "react";
import { ColorSymbol } from "@/components/UnoCard";
import { CARD_COLORS, COLOR_META } from "@/lib/constants";
import type { CardColor } from "@/types/game";

interface ColorPickerModalProps {
  open: boolean;
  cardTitle: string;
  onSelect: (color: CardColor) => void;
  onCancel: () => void;
}

export function ColorPickerModal({
  open,
  cardTitle,
  onSelect,
  onCancel,
}: ColorPickerModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-pop-in"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-3xl glass-panel p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center space-y-1">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-300 text-xs font-bold">
            {cardTitle}
          </span>
          <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
            Pilih Warna Baru!
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ketuk warna yang kamu inginkan untuk giliran berikutnya.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {CARD_COLORS.map((color) => {
            const meta = COLOR_META[color];
            return (
              <button
                key={color}
                type="button"
                onClick={() => onSelect(color)}
                className={`group flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-gradient-to-br ${meta.gradient} ${
                  color === "kuning" ? "text-slate-950" : "text-white"
                } font-display font-bold text-lg shadow-lg hover:scale-[1.03] active:scale-95 transition cursor-pointer border-2 border-white/60`}
              >
                <ColorSymbol color={color} className="w-8 h-8 drop-shadow" />
                <span>{meta.name}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="w-full py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-200/70 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 transition cursor-pointer"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
