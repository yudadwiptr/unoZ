"use client";

import Image from "next/image";
import React from "react";

interface UnozLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export function UnozLogo({ size = "md", showTagline = false }: UnozLogoProps) {
  if (size === "lg") {
    return (
      <div className="inline-flex flex-col items-center select-none">
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full drop-shadow-[0_14px_28px_rgba(16,185,129,0.28)]">
          <Image
            src="/unoz-logo.png"
            alt="Logo unoZ"
            fill
            priority
            sizes="(max-width: 640px) 128px, 144px"
            className="object-contain"
          />
        </div>
        {showTagline && (
          <span className="text-xs font-bold tracking-wide text-slate-600 dark:text-slate-300 mt-2">
            Kartu Mabar Seru &amp; Chaos!
          </span>
        )}
      </div>
    );
  }

  const iconSize = size === "sm" ? 42 : 52;
  const textSize = size === "sm" ? "text-2xl" : "text-3xl";

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <div
        className="relative shrink-0 rounded-full drop-shadow-md"
        style={{ width: iconSize, height: iconSize }}
      >
        <Image
          src="/unoz-logo.png"
          alt="Logo unoZ"
          fill
          priority
          sizes={`${iconSize}px`}
          className="object-contain"
        />
      </div>

      <div className="flex flex-col leading-none">
        <div
          className={`font-display font-bold tracking-tight ${textSize} flex items-baseline`}
        >
          <span className="bg-gradient-to-r from-red-500 via-amber-400 to-blue-500 bg-clip-text text-transparent">
            uno
          </span>
          <span className="bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
            Z
          </span>
        </div>
        {showTagline && (
          <span className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 mt-0.5">
            Kartu Mabar Seru &amp; Chaos!
          </span>
        )}
      </div>
    </div>
  );
}
