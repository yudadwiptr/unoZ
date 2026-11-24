"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import type { Card } from "@/types/game";
import { UnoCard } from "@/components/UnoCard";

const SPLASH_CARDS: Array<{ card: Card; x: string; y: string; r: string; delay: string }> = [
  { card: { id: "s1", color: "merah", value: "7" }, x: "-150%", y: "12%", r: "-24deg", delay: "0s" },
  { card: { id: "s2", color: "biru", value: "reverse" }, x: "-76%", y: "-4%", r: "-12deg", delay: "0.06s" },
  { card: { id: "s3", color: "wild", value: "wild4" }, x: "0%", y: "-10%", r: "0deg", delay: "0.12s" },
  { card: { id: "s4", color: "kuning", value: "skip" }, x: "76%", y: "-4%", r: "12deg", delay: "0.18s" },
  { card: { id: "s5", color: "hijau", value: "draw2" }, x: "150%", y: "12%", r: "24deg", delay: "0.24s" },
];

const TIPS = [
  "Mengocok kartu…",
  "Membagikan 7 kartu…",
  "Membangunkan Bot Budi…",
  "Menyiapkan meja mabar…",
];

/** Full-screen opening loader: logo pop, card fan shuffle, progress bar & rotating tips. */
export function SplashScreen({ leaving = false }: { leaving?: boolean }) {
  const [tip, setTip] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTip((t) => (t + 1) % TIPS.length), 650);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Memuat unoZ"
      className={`splash-root fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#070b17] text-white transition-opacity duration-500 ${
        leaving ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Spinning rays + glow */}
      <div className="bg-sunrays absolute left-1/2 top-1/2 w-[70rem] h-[70rem]" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] rounded-full blur-[110px] opacity-60"
        style={{
          background:
            "radial-gradient(circle, rgba(250,204,21,0.45) 0%, rgba(16,185,129,0.25) 45%, rgba(59,130,246,0.2) 70%, transparent 100%)",
        }}
      />
      <div className="absolute inset-0 bg-grain opacity-25 mix-blend-overlay" aria-hidden="true" />

      {/* Logo */}
      <div className="splash-logo relative w-40 h-40 sm:w-48 sm:h-48 drop-shadow-[0_18px_40px_rgba(16,185,129,0.45)]">
        <Image src="/unoz-logo.png" alt="unoZ" fill priority sizes="192px" className="object-contain" />
      </div>

      {/* Card fan shuffle */}
      <div className="relative mt-6 h-28 w-full max-w-xs" aria-hidden="true">
        {SPLASH_CARDS.map((c) => (
          <div
            key={c.card.id}
            className="splash-card absolute left-1/2 top-1/2"
            style={
              {
                "--fx": c.x,
                "--fy": c.y,
                "--fr": c.r,
                animationDelay: c.delay,
              } as React.CSSProperties
            }
          >
            <UnoCard card={c.card} size="sm" />
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="relative mt-8 w-56 sm:w-64">
        <div className="h-2.5 rounded-full bg-white/10 overflow-hidden border border-white/10">
          <div className="splash-bar h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500 shadow-[0_0_12px_rgba(251,191,36,0.7)]" />
        </div>
        <p key={tip} className="animate-pop-in mt-3 text-center text-xs font-extrabold uppercase tracking-[0.18em] text-amber-200/90">
          {TIPS[tip]}
        </p>
      </div>
    </div>
  );
}
