"use client";

import { Ban, RefreshCw, Shield, Shuffle } from "lucide-react";
import React from "react";
import type { CardColor } from "@/types/game";

interface AnimatedBackgroundProps {
  /** "vivid" for Landing & Lobby; "subtle" for the active Game Board so focus stays on real cards */
  variant?: "vivid" | "subtle";
  /** Active card color during a game — tints the table felt */
  tint?: CardColor;
}

const TINT_HEX: Record<CardColor, string> = {
  merah: "#ef4444",
  biru: "#3b82f6",
  kuning: "#facc15",
  hijau: "#22c55e",
};

type FloatingColor = CardColor | "wild" | "zswap" | "zshield";

const FLOATING_FILL: Record<FloatingColor, string> = {
  merah: "from-red-500 via-rose-500 to-red-700",
  biru: "from-blue-500 via-sky-500 to-blue-700",
  kuning: "from-amber-300 via-yellow-400 to-amber-500",
  hijau: "from-emerald-500 via-green-500 to-emerald-700",
  wild: "from-slate-800 via-slate-900 to-zinc-950",
  zswap: "from-fuchsia-600 via-purple-700 to-indigo-900",
  zshield: "from-cyan-500 via-teal-600 to-slate-900",
};

const FLOATING_TEX: Record<FloatingColor, string> = {
  merah: "card-tex-merah",
  biru: "card-tex-biru",
  kuning: "card-tex-kuning",
  hijau: "card-tex-hijau",
  wild: "card-tex-wild",
  zswap: "card-tex-wild",
  zshield: "card-tex-wild",
};

interface FloatingCardConfig {
  id: string;
  label: "+4" | "+2" | "reverse" | "skip" | "7" | "shield" | "swap" | "0";
  color: FloatingColor;
  positionClass: string;
  sizeClass: string;
  rotation: string;
  /** Depth-of-field: far cards are smaller, blurrier and dimmer */
  depthClass: string;
  driftClass: "animate-card-drift-a" | "animate-card-drift-b" | "animate-card-drift-c";
  duration: string;
  delay: string;
  hideOnMobile?: boolean;
}

const FLOATING_CARDS: FloatingCardConfig[] = [
  {
    id: "bg-c1",
    label: "+4",
    color: "wild",
    positionClass: "top-[7%] left-[3%] sm:left-[7%]",
    sizeClass: "w-20 h-28 sm:w-24 sm:h-36",
    rotation: "-18deg",
    depthClass: "blur-[1px] opacity-45 dark:opacity-40",
    driftClass: "animate-card-drift-a",
    duration: "17s",
    delay: "0s",
  },
  {
    id: "bg-c2",
    label: "reverse",
    color: "biru",
    positionClass: "top-[10%] right-[3%] sm:right-[8%]",
    sizeClass: "w-20 h-28 sm:w-24 sm:h-36",
    rotation: "16deg",
    depthClass: "blur-[1px] opacity-45 dark:opacity-40",
    driftClass: "animate-card-drift-b",
    duration: "19s",
    delay: "-3s",
  },
  {
    id: "bg-c3",
    label: "+2",
    color: "merah",
    positionClass: "top-[44%] -left-6 sm:left-[4%]",
    sizeClass: "w-24 h-34 sm:w-28 sm:h-40",
    rotation: "-11deg",
    depthClass: "blur-[0.5px] opacity-50 dark:opacity-45",
    driftClass: "animate-card-drift-c",
    duration: "21s",
    delay: "-6s",
  },
  {
    id: "bg-c4",
    label: "swap",
    color: "zswap",
    positionClass: "top-[40%] -right-6 sm:right-[5%]",
    sizeClass: "w-24 h-34 sm:w-28 sm:h-40",
    rotation: "14deg",
    depthClass: "blur-[0.5px] opacity-50 dark:opacity-45",
    driftClass: "animate-card-drift-a",
    duration: "18s",
    delay: "-8s",
  },
  {
    id: "bg-c5",
    label: "skip",
    color: "kuning",
    positionClass: "bottom-[9%] left-[5%] sm:left-[11%]",
    sizeClass: "w-20 h-28 sm:w-24 sm:h-36",
    rotation: "21deg",
    depthClass: "blur-[1px] opacity-45 dark:opacity-40",
    driftClass: "animate-card-drift-b",
    duration: "20s",
    delay: "-4s",
  },
  {
    id: "bg-c6",
    label: "shield",
    color: "zshield",
    positionClass: "bottom-[8%] right-[5%] sm:right-[12%]",
    sizeClass: "w-20 h-28 sm:w-24 sm:h-36",
    rotation: "-15deg",
    depthClass: "blur-[1px] opacity-45 dark:opacity-40",
    driftClass: "animate-card-drift-c",
    duration: "16s",
    delay: "-2s",
  },
  {
    id: "bg-c7",
    label: "7",
    color: "hijau",
    positionClass: "top-[24%] left-[21%]",
    sizeClass: "w-14 h-20 sm:w-16 sm:h-24",
    rotation: "9deg",
    depthClass: "blur-[3px] opacity-30 dark:opacity-25",
    driftClass: "animate-card-drift-b",
    duration: "23s",
    delay: "-11s",
    hideOnMobile: true,
  },
  {
    id: "bg-c8",
    label: "+2",
    color: "kuning",
    positionClass: "top-[22%] right-[21%]",
    sizeClass: "w-14 h-20 sm:w-16 sm:h-24",
    rotation: "-13deg",
    depthClass: "blur-[3px] opacity-30 dark:opacity-25",
    driftClass: "animate-card-drift-a",
    duration: "24s",
    delay: "-9s",
    hideOnMobile: true,
  },
  {
    id: "bg-c9",
    label: "0",
    color: "biru",
    positionClass: "bottom-[26%] left-[22%]",
    sizeClass: "w-14 h-20 sm:w-16 sm:h-24",
    rotation: "-22deg",
    depthClass: "blur-[3px] opacity-30 dark:opacity-25",
    driftClass: "animate-card-drift-c",
    duration: "22s",
    delay: "-5s",
    hideOnMobile: true,
  },
  {
    id: "bg-c10",
    label: "7",
    color: "merah",
    positionClass: "bottom-[24%] right-[22%]",
    sizeClass: "w-14 h-20 sm:w-16 sm:h-24",
    rotation: "18deg",
    depthClass: "blur-[3px] opacity-30 dark:opacity-25",
    driftClass: "animate-card-drift-a",
    duration: "25s",
    delay: "-13s",
    hideOnMobile: true,
  },
];

function FloatingCardGlyph({ label }: { label: FloatingCardConfig["label"] }) {
  const iconClass = "w-7 h-7 sm:w-9 sm:h-9 stroke-[2.6] card-icon-ink";
  switch (label) {
    case "reverse":
      return <RefreshCw className={iconClass} />;
    case "skip":
      return <Ban className={iconClass} />;
    case "shield":
      return <Shield className={iconClass} />;
    case "swap":
      return <Shuffle className={iconClass} />;
    default:
      return (
        <span className="card-ink font-display font-bold text-2xl sm:text-3xl leading-none">
          {label}
        </span>
      );
  }
}

export function AnimatedBackground({ variant = "vivid", tint }: AnimatedBackgroundProps) {
  const isGame = variant === "subtle";

  return (
    <div
      aria-hidden="true"
      className="bg-table-tint pointer-events-none fixed inset-0 -z-20 overflow-hidden select-none"
      style={{ "--table-tint": tint ? TINT_HEX[tint] : "#6366f1" } as React.CSSProperties}
    >
      {/* Base surface */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-indigo-50/60 to-slate-100 dark:from-[#0a0f22] dark:via-[#0b1024] dark:to-[#060914] transition-colors duration-500" />

      {/* Colored corner glows (one per card color) */}
      <div
        className={`absolute -top-32 -left-28 w-[24rem] h-[24rem] sm:w-[34rem] sm:h-[34rem] rounded-full blur-[110px] animate-orb-slow ${
          isGame ? "bg-red-500/10 dark:bg-red-600/14" : "bg-red-500/28 dark:bg-red-600/34"
        }`}
      />
      <div
        className={`absolute -top-24 -right-28 w-[24rem] h-[24rem] sm:w-[34rem] sm:h-[34rem] rounded-full blur-[110px] animate-orb-alt ${
          isGame ? "bg-blue-500/10 dark:bg-blue-600/14" : "bg-blue-500/28 dark:bg-blue-600/34"
        }`}
      />
      <div
        className={`absolute -bottom-32 -left-24 w-[24rem] h-[24rem] sm:w-[32rem] sm:h-[32rem] rounded-full blur-[110px] animate-orb-alt ${
          isGame ? "bg-emerald-500/10 dark:bg-emerald-500/12" : "bg-emerald-500/26 dark:bg-emerald-500/28"
        }`}
      />
      <div
        className={`absolute -bottom-28 -right-24 w-[22rem] h-[22rem] sm:w-[30rem] sm:h-[30rem] rounded-full blur-[110px] animate-orb-slow ${
          isGame ? "bg-amber-400/10 dark:bg-amber-500/10" : "bg-amber-400/30 dark:bg-amber-500/24"
        }`}
      />

      {/* Outlined suit-symbol wallpaper, faded toward the edges */}
      <div className="absolute inset-0 bg-symbol-pattern arcade-grid-mask opacity-50 dark:opacity-60" />

      {isGame ? (
        <>
          {/* Card-table felt glow, tinted with the active color */}
          <div className="absolute inset-0 bg-table-felt" />
          {/* Table rim */}
          <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 w-[46rem] max-w-[115vw] h-[28rem] max-h-[70vh] rounded-[50%] bg-table-ring" />
        </>
      ) : (
        <>
          {/* Slow-spinning sun rays behind the logo */}
          <div className="bg-sunrays absolute left-1/2 top-[22%] w-[60rem] h-[60rem] sm:w-[80rem] sm:h-[80rem]" />

          {/* Central warm halo behind logo & form */}
          <div
            className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[22rem] h-[22rem] sm:w-[30rem] sm:h-[30rem] rounded-full blur-[100px] opacity-60 dark:opacity-50 animate-orb-slow"
            style={{
              background:
                "radial-gradient(circle, rgba(250,204,21,0.4) 0%, rgba(236,72,153,0.25) 45%, rgba(59,130,246,0.22) 75%, transparent 100%)",
            }}
          />

          {/* Floating out-of-focus cards */}
          <div className="absolute inset-0">
            {FLOATING_CARDS.map((card) => (
              <div
                key={card.id}
                className={`absolute ${card.positionClass} ${card.sizeClass} ${card.depthClass} ${card.driftClass} ${
                  card.hideOnMobile ? "hidden md:flex" : "flex"
                } items-center justify-center rounded-2xl border-[3px] border-white/90 shadow-2xl shadow-black/40 bg-gradient-to-br ${FLOATING_FILL[card.color]} ${
                  card.color === "kuning" ? "text-amber-300" : "text-white"
                }`}
                style={
                  {
                    "--card-rot": card.rotation,
                    "--drift-dur": card.duration,
                    "--drift-delay": card.delay,
                  } as React.CSSProperties
                }
              >
                <div className={`absolute inset-0 rounded-[13px] ${FLOATING_TEX[card.color]}`} />
                <div className="absolute inset-[4px] rounded-xl border border-white/30" />
                <div className="relative"><FloatingCardGlyph label={card.label} /></div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Film grain to kill gradient banding & add tactility */}
      <div className="absolute inset-0 bg-grain opacity-[0.18] dark:opacity-[0.22] mix-blend-overlay" />

      {/* Edge vignette */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background:
            "radial-gradient(ellipse 85% 80% at 50% 45%, transparent 55%, rgba(203, 213, 225, 0.7) 100%)",
        }}
      />
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background:
            "radial-gradient(ellipse 85% 80% at 50% 45%, transparent 45%, rgba(2, 6, 18, 0.85) 100%)",
        }}
      />
    </div>
  );
}
