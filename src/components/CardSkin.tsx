"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type CardSkinId = "klasik" | "nusantara" | "cyber" | "street";

export interface CardSkinMeta {
  id: CardSkinId;
  name: string;
  tagline: string;
  /** Swatch gradient shown in pickers */
  swatch: string;
}

export const CARD_SKINS: CardSkinMeta[] = [
  {
    id: "klasik",
    name: "Klasik",
    tagline: "Stiker cerah, simbol bintang-lingkaran",
    swatch: "from-red-500 via-amber-400 to-blue-500",
  },
  {
    id: "nusantara",
    name: "Nusantara",
    tagline: "Batik kawung, emas & tumpal",
    swatch: "from-[#8b1e1e] via-[#d49a2a] to-[#1e3a6e]",
  },
  {
    id: "cyber",
    name: "Cyberpunk",
    tagline: "Neon glitch, grid hologram",
    swatch: "from-[#ff2a6d] via-[#b967ff] to-[#05d9e8]",
  },
  {
    id: "street",
    name: "Kota Liar",
    tagline: "Poster jalanan, rambu & halftone",
    swatch: "from-[#e63946] via-[#ffbe0b] to-[#1d1d1d]",
  },
];

const STORAGE_KEY = "unoz_card_skin";

interface CardSkinContextValue {
  skin: CardSkinId;
  setSkin: (skin: CardSkinId) => void;
}

const CardSkinContext = createContext<CardSkinContextValue>({
  skin: "klasik",
  setSkin: () => {},
});

function isSkinId(value: string | null): value is CardSkinId {
  return CARD_SKINS.some((s) => s.id === value);
}

export function CardSkinProvider({ children }: { children: React.ReactNode }) {
  const [skin, setSkinState] = useState<CardSkinId>("klasik");

  // Restore the viewer's skin after mount (keeps SSR markup identical)
  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (isSkinId(saved)) setSkinState(saved);
      } catch {
        // storage blocked — stay on default skin
      }
    });
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  const setSkin = useCallback((next: CardSkinId) => {
    setSkinState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  return (
    <CardSkinContext.Provider value={{ skin, setSkin }}>{children}</CardSkinContext.Provider>
  );
}

export function useCardSkin(): CardSkinContextValue {
  return useContext(CardSkinContext);
}
