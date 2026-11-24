"use client";

import { Ban, RefreshCw, Shield, Shuffle, Sparkles } from "lucide-react";
import React from "react";
import { COLOR_META, getCardDisplayName } from "@/lib/constants";
import type { Card, CardColor } from "@/types/game";

/** Colorblind-friendly corner symbol:
 *  Merah -> Star, Biru -> Circle, Kuning -> Triangle, Hijau -> Square
 */
export function ColorSymbol({
  color,
  className = "w-3.5 h-3.5",
}: {
  color: CardColor | "wild";
  className?: string;
}) {
  if (color === "merah") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z" />
      </svg>
    );
  }
  if (color === "biru") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
      </svg>
    );
  }
  if (color === "kuning") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M12 3L22 20H2L12 3z" />
      </svg>
    );
  }
  if (color === "hijau") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="2.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7z" />
    </svg>
  );
}

interface UnoCardProps {
  card: Card;
  size?: "xs" | "sm" | "md" | "lg";
  playable?: boolean;
  isJumpIn?: boolean;
  disabled?: boolean;
  selected?: boolean;
  activeWildColor?: CardColor;
  onClick?: () => void;
  className?: string;
}

export function UnoCard({
  card,
  size = "md",
  playable = false,
  isJumpIn = false,
  disabled = false,
  selected = false,
  activeWildColor,
  onClick,
  className = "",
}: UnoCardProps) {
  const isWild = card.color === "wild";
  const isZCard = card.value === "z_swap" || card.value === "z_shield";

  const dims =
    size === "xs"
      ? "w-12 h-[4.5rem] rounded-xl p-1"
      : size === "sm"
      ? "w-16 h-24 rounded-2xl p-1.5"
      : size === "lg"
      ? "w-28 h-40 sm:w-32 sm:h-44 rounded-3xl p-2.5"
      : "w-[5.25rem] h-[7.6rem] sm:w-24 sm:h-36 rounded-2xl p-2";

  const bgStyle = isZCard
    ? card.value === "z_swap"
      ? "bg-gradient-to-br from-fuchsia-600 via-purple-700 to-indigo-900"
      : "bg-gradient-to-br from-cyan-500 via-teal-600 to-slate-900"
    : isWild
    ? "bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-950"
    : `bg-gradient-to-br ${COLOR_META[card.color as CardColor].gradient}`;

  const renderCornerBadge = () => {
    const cornerIconClass =
      size === "lg" ? "w-4 h-4" : size === "xs" ? "w-2.5 h-2.5" : "w-3 h-3";
    if (card.value === "skip") {
      return <Ban className={`${cornerIconClass} stroke-[2.8]`} aria-hidden="true" />;
    }
    if (card.value === "reverse") {
      return <RefreshCw className={`${cornerIconClass} stroke-[2.8]`} aria-hidden="true" />;
    }
    const labelText = (() => {
      switch (card.value) {
        case "draw2":
          return "+2";
        case "wild":
          return "W";
        case "wild4":
          return "+4";
        case "z_swap":
          return "ZS";
        case "z_shield":
          return "ZT";
        default:
          return card.value;
      }
    })();
    return (
      <span
        className={`font-display font-bold ${
          size === "lg" ? "text-base" : size === "xs" ? "text-[10px]" : "text-xs"
        }`}
      >
        {labelText}
      </span>
    );
  };

  const textContrast =
    card.color === "kuning" ? "text-slate-950" : "text-white";

  const renderCenterArt = () => {
    const iconClass =
      size === "lg"
        ? "w-11 h-11"
        : size === "sm"
        ? "w-6 h-6"
        : size === "xs"
        ? "w-5 h-5"
        : "w-9 h-9";

    switch (card.value) {
      case "skip":
        return <Ban className={`${iconClass} stroke-[2.6] drop-shadow`} />;
      case "reverse":
        return <RefreshCw className={`${iconClass} stroke-[2.6] drop-shadow`} />;
      case "draw2":
        return (
          <span
            className={`font-display font-bold leading-none drop-shadow ${
              size === "lg" ? "text-5xl" : size === "sm" ? "text-2xl" : "text-4xl"
            }`}
          >
            +2
          </span>
        );
      case "wild":
        return (
          <div className="relative flex items-center justify-center">
            <div
              className={`grid grid-cols-2 gap-0.5 rotate-12 rounded-xl overflow-hidden shadow-inner ${
                size === "lg" ? "w-14 h-14" : size === "sm" ? "w-8 h-8" : "w-11 h-11"
              }`}
            >
              <div className="bg-red-500" />
              <div className="bg-blue-500" />
              <div className="bg-amber-400" />
              <div className="bg-emerald-500" />
            </div>
            <Sparkles className="w-5 h-5 text-white absolute drop-shadow-md" />
          </div>
        );
      case "wild4":
        return (
          <div className="flex flex-col items-center">
            <div className="flex -space-x-2 mb-0.5">
              <span className="w-3.5 h-5 rounded-sm bg-red-500 border border-white/80 -rotate-12 inline-block" />
              <span className="w-3.5 h-5 rounded-sm bg-blue-500 border border-white/80 -rotate-3 inline-block" />
              <span className="w-3.5 h-5 rounded-sm bg-amber-400 border border-white/80 rotate-6 inline-block" />
              <span className="w-3.5 h-5 rounded-sm bg-emerald-500 border border-white/80 rotate-12 inline-block" />
            </div>
            <span
              className={`font-display font-bold leading-none text-white drop-shadow ${
                size === "lg" ? "text-4xl" : size === "sm" ? "text-xl" : "text-3xl"
              }`}
            >
              +4
            </span>
          </div>
        );
      case "z_swap":
        return (
          <div className="flex flex-col items-center gap-0.5">
            <Shuffle className={`${iconClass} text-amber-300 stroke-[2.5] drop-shadow`} />
            {size !== "xs" && (
              <span className="font-display font-bold text-[10px] sm:text-xs tracking-wider uppercase text-amber-200">
                Z-Swap
              </span>
            )}
          </div>
        );
      case "z_shield":
        return (
          <div className="flex flex-col items-center gap-0.5">
            <Shield className={`${iconClass} text-cyan-200 stroke-[2.5] drop-shadow`} />
            {size !== "xs" && (
              <span className="font-display font-bold text-[10px] sm:text-xs tracking-wider uppercase text-cyan-100">
                Z-Shield
              </span>
            )}
          </div>
        );
      default:
        return (
          <span
            className={`font-display font-bold leading-none drop-shadow-sm ${
              size === "lg"
                ? "text-6xl"
                : size === "sm"
                ? "text-3xl"
                : size === "xs"
                ? "text-xl"
                : "text-5xl"
            }`}
          >
            {card.value}
          </span>
        );
    }
  };

  const label =
    card.color === "wild"
      ? getCardDisplayName(card.value)
      : `${COLOR_META[card.color].name} ${getCardDisplayName(card.value)}`;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !onClick}
      aria-label={label}
      title={label}
      className={`group relative select-none text-left transition-all duration-200 ${dims} ${bgStyle} ${textContrast} border-[3px] ${
        isJumpIn
          ? "border-amber-300 ring-4 ring-amber-400/70 shadow-xl shadow-amber-500/35"
          : playable
          ? "border-white ring-2 ring-white/80 shadow-xl shadow-black/30 hover:-translate-y-4 active:scale-95 cursor-pointer"
          : "border-white/85 shadow-lg shadow-black/25"
      } ${selected ? "-translate-y-5 ring-4 ring-amber-300" : ""} ${
        disabled && !playable ? "opacity-55 saturate-75 cursor-not-allowed" : ""
      } ${className}`}
    >
      {/* Glossy diagonal sheen */}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-tr from-black/15 via-transparent to-white/25" />

      {/* Center oval emblem */}
      <div className="pointer-events-none absolute inset-2.5 rounded-[45%] border border-white/25 bg-white/12 -rotate-12" />

      {/* Active color halo if this wild is on the discard pile */}
      {activeWildColor && isWild && (
        <span
          className={`absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md border border-white/70 ${COLOR_META[activeWildColor].badgeBg}`}
        >
          <ColorSymbol color={activeWildColor} className="w-2.5 h-2.5" />
          {COLOR_META[activeWildColor].name}
        </span>
      )}

      {/* Jump-In badge */}
      {isJumpIn && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold text-[10px] uppercase tracking-wide shadow-md whitespace-nowrap animate-bounce">
          Potong!
        </span>
      )}

      {/* Top-Left Corner: Value + Colorblind Symbol */}
      <div className="relative z-10 flex flex-col items-center w-fit leading-none">
        {renderCornerBadge()}
        <ColorSymbol
          color={card.color}
          className={size === "lg" ? "w-3.5 h-3.5 mt-0.5" : "w-2.5 h-2.5 mt-0.5"}
        />
      </div>

      {/* Center Value / Graphic */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        {renderCenterArt()}
      </div>

      {/* Bottom-Right Corner (Mirrored) */}
      <div className="absolute bottom-1.5 right-1.5 z-10 flex flex-col items-center leading-none rotate-180">
        {renderCornerBadge()}
        <ColorSymbol
          color={card.color}
          className={size === "lg" ? "w-3.5 h-3.5 mt-0.5" : "w-2.5 h-2.5 mt-0.5"}
        />
      </div>

      {/* Subtle Indonesian card subtitle on medium/large cards */}
      {(size === "md" || size === "lg") &&
        (card.value === "skip" ||
          card.value === "reverse" ||
          card.value === "draw2" ||
          card.value === "wild") && (
          <span className="pointer-events-none absolute bottom-1.5 left-2 z-10 text-[9px] font-bold uppercase tracking-tight opacity-85">
            {getCardDisplayName(card.value)}
          </span>
        )}
    </button>
  );
}

export function UnoCardBack({
  size = "md",
  countBadge,
  highlight = false,
  onClick,
  label = "Ambil Kartu",
}: {
  size?: "sm" | "md" | "lg";
  countBadge?: number;
  highlight?: boolean;
  onClick?: () => void;
  label?: string;
}) {
  const dims =
    size === "sm"
      ? "w-14 h-20 rounded-xl"
      : size === "lg"
      ? "w-28 h-40 sm:w-32 sm:h-44 rounded-3xl"
      : "w-[5.25rem] h-[7.6rem] sm:w-24 sm:h-36 rounded-2xl";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      aria-label={label}
      className={`relative select-none ${dims} bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border-[3px] ${
        highlight
          ? "border-amber-300 ring-4 ring-amber-400/50 shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 cursor-pointer"
          : "border-white/80 shadow-xl shadow-black/40"
      } transition-all duration-200 flex items-center justify-center overflow-hidden`}
    >
      {/* Decorative stacked illusion */}
      <div className="pointer-events-none absolute inset-2 rounded-[45%] bg-gradient-to-br from-rose-500/30 via-amber-400/25 to-blue-500/30 border border-white/20 -rotate-12" />
      <div className="relative z-10 flex flex-col items-center">
        <span className="font-display font-bold text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-red-400 via-amber-300 to-sky-400 bg-clip-text text-transparent drop-shadow">
          unoZ
        </span>
        {highlight && (
          <span className="mt-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-wide shadow">
            Ambil
          </span>
        )}
      </div>
      {typeof countBadge === "number" && (
        <span className="absolute bottom-1.5 right-1.5 z-10 px-1.5 py-0.5 rounded-md bg-white/15 text-white text-[10px] font-bold backdrop-blur">
          {countBadge}
        </span>
      )}
    </button>
  );
}
