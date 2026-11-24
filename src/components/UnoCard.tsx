"use client";

import { Ban, RefreshCw, Shield, Shuffle, Sparkles } from "lucide-react";
import React from "react";
import { type CardSkinId, useCardSkin } from "@/components/CardSkin";
import { COLOR_META, getCardDisplayName, getDrawAmount, isMegaDraw } from "@/lib/constants";
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


type CardSize = "xs" | "sm" | "md" | "lg";

/** Numeral / icon color printed on the white medallion */
const INK: Record<CardColor, string> = {
  merah: "text-red-500",
  biru: "text-blue-500",
  kuning: "text-amber-400",
  hijau: "text-emerald-500",
};

const TEXTURE: Record<CardColor | "wild", string> = {
  merah: "card-tex-merah",
  biru: "card-tex-biru",
  kuning: "card-tex-kuning",
  hijau: "card-tex-hijau",
  wild: "card-tex-wild",
};

const SIZE_STYLE: Record<
  CardSize,
  {
    dims: string;
    clipRadius: string;
    frameRadius: string;
    medallion: string;
    numeral: string;
    plus: string;
    mega10: string;
    icon: string;
    corner: string;
    cornerIcon: string;
    cornerSymbol: string;
  }
> = {
  xs: {
    dims: "w-12 h-[4.5rem] rounded-xl p-1",
    clipRadius: "rounded-[9px]",
    frameRadius: "rounded-[6px]",
    medallion: "w-7 h-7",
    numeral: "text-xl",
    plus: "text-base",
    mega10: "text-sm",
    icon: "w-4 h-4",
    corner: "text-[10px]",
    cornerIcon: "w-2.5 h-2.5",
    cornerSymbol: "w-2 h-2 mt-px",
  },
  sm: {
    dims: "w-16 h-24 rounded-2xl p-1.5",
    clipRadius: "rounded-[13px]",
    frameRadius: "rounded-[10px]",
    medallion: "w-9 h-9",
    numeral: "text-3xl",
    plus: "text-2xl",
    mega10: "text-xl",
    icon: "w-6 h-6",
    corner: "text-xs",
    cornerIcon: "w-3 h-3",
    cornerSymbol: "w-2.5 h-2.5 mt-0.5",
  },
  md: {
    dims: "w-[5.25rem] h-[7.6rem] sm:w-24 sm:h-36 rounded-2xl p-2",
    clipRadius: "rounded-[13px]",
    frameRadius: "rounded-[10px]",
    medallion: "w-12 h-12 sm:w-14 sm:h-14",
    numeral: "text-4xl sm:text-[2.75rem]",
    plus: "text-3xl sm:text-4xl",
    mega10: "text-2xl sm:text-3xl",
    icon: "w-8 h-8 sm:w-9 sm:h-9",
    corner: "text-xs sm:text-sm",
    cornerIcon: "w-3 h-3 sm:w-3.5 sm:h-3.5",
    cornerSymbol: "w-2.5 h-2.5 mt-0.5",
  },
  lg: {
    dims: "w-28 h-40 sm:w-32 sm:h-44 rounded-3xl p-2.5",
    clipRadius: "rounded-[21px]",
    frameRadius: "rounded-[18px]",
    medallion: "w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem]",
    numeral: "text-5xl sm:text-6xl",
    plus: "text-4xl sm:text-5xl",
    mega10: "text-3xl sm:text-4xl",
    icon: "w-10 h-10 sm:w-11 sm:h-11",
    corner: "text-base",
    cornerIcon: "w-4 h-4",
    cornerSymbol: "w-3.5 h-3.5 mt-0.5",
  },
};

interface UnoCardProps {
  card: Card;
  size?: CardSize;
  playable?: boolean;
  isJumpIn?: boolean;
  disabled?: boolean;
  selected?: boolean;
  activeWildColor?: CardColor;
  onClick?: () => void;
  className?: string;
  /** Force a skin (used by skin previews); defaults to the viewer's chosen skin */
  skin?: CardSkinId;
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
  skin: skinOverride,
}: UnoCardProps) {
  const { skin: contextSkin } = useCardSkin();
  const skin = skinOverride ?? contextSkin;
  const isWild = card.color === "wild";
  const isZCard = card.value === "z_swap" || card.value === "z_shield";
  const isMega = isMegaDraw(card.value);
  const s = SIZE_STYLE[size];
  const kind = isZCard
    ? card.value === "z_swap"
      ? "zswap"
      : "zshield"
    : isMega
    ? "mega"
    : card.color;

  const bgStyle = isMega
    ? "bg-gradient-to-br from-rose-600 via-red-800 to-zinc-950"
    : isZCard
    ? card.value === "z_swap"
      ? "bg-gradient-to-br from-fuchsia-500 via-purple-700 to-indigo-950"
      : "bg-gradient-to-br from-cyan-400 via-teal-600 to-slate-900"
    : isWild
    ? "bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-950"
    : `bg-gradient-to-br ${COLOR_META[card.color as CardColor].gradient}`;

  const textContrast = card.color === "kuning" ? "text-slate-950" : "text-white";
  const ink = isWild ? "text-white" : INK[card.color as CardColor];

  const renderCornerBadge = () => {
    if (card.value === "skip") {
      return <Ban className={`${s.cornerIcon} stroke-[3]`} aria-hidden="true" />;
    }
    if (card.value === "reverse") {
      return <RefreshCw className={`${s.cornerIcon} stroke-[3]`} aria-hidden="true" />;
    }
    const labelText = (() => {
      switch (card.value) {
        case "draw2":
          return "+2";
        case "wild":
          return "W";
        case "wild4":
          return "+4";
        case "wild6":
        case "wild8":
        case "wild10":
          return `+${getDrawAmount(card.value)}`;
        case "z_swap":
          return "ZS";
        case "z_shield":
          return "ZT";
        default:
          return card.value;
      }
    })();
    return (
      <span className={`uz-corner font-display font-bold ${s.corner} ${card.color === "kuning" ? "" : "card-corner-ink"}`}>
        {labelText}
      </span>
    );
  };

  const medallionSurface = isZCard
    ? "card-medallion-z"
    : isWild
    ? "card-medallion-wild"
    : "card-medallion";

  const renderCenterGlyph = () => {
    switch (card.value) {
      case "skip":
        return <Ban className={`${s.icon} ${ink} stroke-[3] card-icon-ink`} />;
      case "reverse":
        return <RefreshCw className={`${s.icon} ${ink} stroke-[3] card-icon-ink`} />;
      case "draw2":
        return <span className={`card-ink font-display font-bold leading-none ${s.plus} ${ink}`}>+2</span>;
      case "wild":
        return <Sparkles className={`${s.icon} text-white fill-white/90 stroke-[2] card-icon-ink`} />;
      case "wild4":
        return <span className={`card-ink font-display font-bold leading-none ${s.plus} text-white`}>+4</span>;
      case "wild6":
      case "wild8":
      case "wild10":
        return (
          <span
            className={`card-ink font-display font-bold leading-none text-white ${
              card.value === "wild10" ? s.mega10 : s.plus
            }`}
          >
            +{getDrawAmount(card.value)}
          </span>
        );
      case "z_swap":
        return <Shuffle className={`${s.icon} text-amber-300 stroke-[2.8] card-icon-ink`} />;
      case "z_shield":
        return <Shield className={`${s.icon} text-cyan-200 fill-cyan-400/40 stroke-[2.6] card-icon-ink`} />;
      default:
        return (
          <span className={`card-ink font-display font-bold leading-none ${s.numeral} ${ink}`}>
            {card.value}
          </span>
        );
    }
  };

  const subtitle =
    size === "md" || size === "lg"
      ? card.value === "skip" ||
        card.value === "reverse" ||
        card.value === "draw2" ||
        card.value === "wild" ||
        isZCard ||
        isMega
        ? getCardDisplayName(card.value)
        : null
      : null;

  const label =
    card.color === "wild"
      ? getCardDisplayName(card.value)
      : `${COLOR_META[card.color].name} ${getCardDisplayName(card.value)}`;

  // Decorative cards (no onClick) render as a div so they can sit inside other buttons
  const Root = onClick ? "button" : "div";
  const rootProps = onClick
    ? { type: "button" as const, onClick, disabled }
    : { role: "img" as const };

  return (
    <Root
      {...rootProps}
      aria-label={label}
      title={label}
      data-skin={skin}
      className={`uz-card uz-c-${kind} group relative select-none text-left transition-all duration-200 ${s.dims} ${bgStyle} ${textContrast} border-[3px] ${
        isJumpIn
          ? "border-amber-300 ring-4 ring-amber-400/70 shadow-xl shadow-amber-500/35"
          : playable
          ? "border-white ring-2 ring-white/80 shadow-[0_3px_0_rgba(15,23,42,0.35),0_14px_24px_-8px_rgba(0,0,0,0.55)] hover:-translate-y-4 active:scale-95 cursor-pointer"
          : "border-white shadow-[0_3px_0_rgba(15,23,42,0.3),0_10px_20px_-8px_rgba(0,0,0,0.5)]"
      } ${selected ? "-translate-y-5 ring-4 ring-amber-300" : ""} ${
        disabled && !playable ? "brightness-[0.62] saturate-[0.55] cursor-not-allowed" : ""
      } ${className}`}
    >
      {/* Art layers, clipped to the card face */}
      <div className={`uz-clip pointer-events-none absolute inset-0 overflow-hidden ${s.clipRadius}`}>
        {/* Colorblind-symbol watermark */}
        <div className={`uz-tex absolute inset-0 ${isZCard || isMega ? "card-tex-wild opacity-60" : TEXTURE[card.color]}`} />
        {/* Sunburst behind the medallion */}
        <div className="uz-rays absolute inset-0 card-rays" />
        {/* Danger pulse on Super draw cards */}
        {isMega && <div className="uz-mega absolute inset-0 card-mega-pulse" />}
        {/* Top gloss */}
        <div className="uz-gloss absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent" />
        {/* Bottom shade */}
        <div className="uz-shade absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
        {/* Holographic sweep on special cards */}
        {isZCard && <div className="uz-holo absolute inset-0 card-holo" />}
        {/* Printed inner frame */}
        <div className={`uz-frame absolute inset-[3px] ${s.frameRadius} border border-white/35`} />
      </div>

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
      <div
        className={`absolute z-10 flex flex-col items-center leading-none ${
          size === "xs" ? "top-1 left-1" : size === "lg" ? "top-2 left-2" : "top-1.5 left-1.5"
        }`}
      >
        {renderCornerBadge()}
        <ColorSymbol color={card.color} className={s.cornerSymbol} />
      </div>

      {/* Center diamond medallion + glyph */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <div className={`uz-medal absolute ${s.medallion} rotate-45 rounded-[28%] ${medallionSurface}`} />
        <div className="uz-glyph relative flex items-center justify-center">{renderCenterGlyph()}</div>
      </div>

      {/* Bottom-Right Corner (Mirrored) */}
      <div
        className={`absolute z-10 flex flex-col items-center leading-none rotate-180 ${
          size === "xs" ? "bottom-1 right-1" : size === "lg" ? "bottom-2 right-2" : "bottom-1.5 right-1.5"
        }`}
      >
        {renderCornerBadge()}
        <ColorSymbol color={card.color} className={s.cornerSymbol} />
      </div>

      {/* Indonesian card name ribbon on medium/large action cards */}
      {subtitle && (
        <span className="uz-ribbon pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 z-10 max-w-[62%] truncate px-1.5 py-px rounded-full bg-slate-950/55 text-white text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wide leading-tight backdrop-blur-sm">
          {subtitle}
        </span>
      )}
    </Root>
  );
}

export function UnoCardBack({
  size = "md",
  countBadge,
  highlight = false,
  onClick,
  label = "Ambil Kartu",
  skin: skinOverride,
}: {
  size?: "sm" | "md" | "lg";
  countBadge?: number;
  highlight?: boolean;
  onClick?: () => void;
  label?: string;
  skin?: CardSkinId;
}) {
  const { skin: contextSkin } = useCardSkin();
  const skin = skinOverride ?? contextSkin;
  const s = SIZE_STYLE[size];
  const showStack = typeof countBadge === "number" && countBadge > 1;

  const Root = onClick ? "button" : "div";
  const rootProps = onClick ? { type: "button" as const, onClick } : { role: "img" as const };

  return (
    <Root
      {...rootProps}
      aria-label={label}
      data-skin={skin}
      className={`uz-card uz-back relative select-none ${s.dims.replace(/\bp-[\d.]+\b/, "")} bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 border-[3px] ${
        highlight
          ? "border-amber-300 ring-4 ring-amber-400/50 hover:scale-105 active:scale-95 cursor-pointer"
          : "border-white"
      } ${
        showStack
          ? "shadow-[3px_3px_0_-1px_#e2e8f0,6px_6px_0_-2px_#94a3b8,9px_9px_0_-3px_#64748b,0_18px_28px_-10px_rgba(0,0,0,0.7)]"
          : "shadow-xl shadow-black/40"
      } transition-all duration-200 flex items-center justify-center`}
    >
      <div className={`uz-clip pointer-events-none absolute inset-0 overflow-hidden ${s.clipRadius}`}>
        <div className="uz-rays absolute inset-0 card-back-burst" />
        <div className="uz-tex absolute inset-0 card-tex-wild opacity-70" />
        <div className="uz-gloss absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
        <div className={`uz-frame absolute inset-[3px] ${s.frameRadius} border border-white/35`} />
        <div className={`uz-frame2 absolute inset-[7px] ${s.frameRadius} border border-dashed border-white/15`} />
      </div>

      <div className="relative z-10 flex items-center justify-center">
        <div className={`uz-medal absolute ${s.medallion} rotate-45 rounded-[28%] card-medallion-wild`} />
        <span
          className={`uz-glyph relative card-ink font-display font-bold leading-none text-white ${
            size === "lg" ? "text-4xl sm:text-5xl" : size === "sm" ? "text-2xl" : "text-3xl sm:text-4xl"
          }`}
        >
          Z
        </span>
      </div>

      <span
        className={`uz-wordmark pointer-events-none absolute left-1/2 -translate-x-1/2 z-10 font-display font-bold tracking-tight leading-none text-white card-corner-ink ${
          size === "lg" ? "top-3 text-base" : "top-2 text-xs"
        }`}
      >
        uno<span className="text-amber-300">Z</span>
      </span>

      {highlight && (
        <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-wide shadow animate-pulse">
          Ambil
        </span>
      )}
      {typeof countBadge === "number" && (
        <span className="absolute -top-2 -right-2 z-20 min-w-6 px-1.5 py-0.5 rounded-full bg-slate-950 border-2 border-white text-white text-[10px] font-extrabold shadow-md text-center">
          {countBadge}
        </span>
      )}
    </Root>
  );
}
