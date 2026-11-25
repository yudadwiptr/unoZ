"use client";

import { Check, Palette } from "lucide-react";
import React from "react";
import { CARD_SKINS, useCardSkin } from "@/components/CardSkin";
import { UnoCard, UnoCardBack } from "@/components/UnoCard";
import { soundEngine } from "@/lib/sound";
import type { Card } from "@/types/game";

const PREVIEW: Card[] = [
  { id: "pv1", color: "merah", value: "7" },
  { id: "pv2", color: "biru", value: "reverse" },
  { id: "pv3", color: "wild", value: "wild4" },
];

/** Grid of card-skin tiles, each previewing a little fan of cards in that skin. */
export function SkinPicker({ layout = "grid" }: { layout?: "grid" | "grid2" | "row" }) {
  const { skin, setSkin } = useCardSkin();

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span
          id="skin-label"
          className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400"
        >
          <Palette className="w-3.5 h-3.5 text-fuchsia-500" />
          Skin Kartu
        </span>
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
          Hanya terlihat olehmu
        </span>
      </div>

      <div
        role="radiogroup"
        aria-labelledby="skin-label"
        className={
          layout === "row"
            ? "no-scrollbar -mx-1 px-1 pt-2 flex gap-2.5 overflow-x-auto snap-x pb-1"
            : layout === "grid2"
            ? "grid grid-cols-2 gap-3 pt-1.5"
            : "grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1.5"
        }
      >
        {CARD_SKINS.map((meta) => {
          const selected = meta.id === skin;
          return (
            <button
              key={meta.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                soundEngine.play("click");
                setSkin(meta.id);
              }}
              className={`group relative snap-start shrink-0 text-left rounded-2xl p-2.5 pb-2 transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                layout === "row" ? "w-[8.5rem]" : ""
              } ${
                selected
                  ? "bg-white dark:bg-white/[0.09] border-2 border-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.2),0_10px_24px_-10px_rgba(251,191,36,0.6)] -translate-y-0.5"
                  : "bg-slate-100/80 dark:bg-white/[0.04] border-2 border-transparent hover:border-slate-300 dark:hover:border-white/15 hover:-translate-y-0.5"
              }`}
            >
              {/* Mini fan preview */}
              <div className="relative h-[4.6rem] flex items-center justify-center pointer-events-none" aria-hidden="true">
                <div className="absolute -translate-x-7 rotate-[-14deg] scale-[0.82] transition-transform group-hover:-translate-x-8 group-hover:rotate-[-18deg]">
                  <UnoCardBack size="sm" skin={meta.id} />
                </div>
                <div className="absolute translate-x-7 rotate-[14deg] scale-[0.82] transition-transform group-hover:translate-x-8 group-hover:rotate-[18deg]">
                  <UnoCard card={PREVIEW[1]} size="xs" skin={meta.id} />
                </div>
                <div className="absolute -translate-y-0.5 transition-transform group-hover:-translate-y-2">
                  <UnoCard card={selected ? PREVIEW[0] : PREVIEW[2]} size="xs" skin={meta.id} />
                </div>
              </div>

              <div className="mt-1.5 flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${meta.swatch}`} />
                <span className="font-display font-bold text-sm text-slate-900 dark:text-white leading-none">
                  {meta.name}
                </span>
              </div>
              <p className="mt-0.5 text-[10px] font-semibold leading-snug text-slate-500 dark:text-slate-400 line-clamp-2">
                {meta.tagline}
              </p>

              {selected && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 border-2 border-white dark:border-slate-900 text-slate-950 flex items-center justify-center shadow">
                  <Check className="w-3 h-3 stroke-[3.5]" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
