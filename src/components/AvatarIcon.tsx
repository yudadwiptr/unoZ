"use client";

import {
  AlertCircle,
  Flame,
  Ghost,
  Hand,
  ShieldAlert,
  Sparkles,
  ThumbsUp,
  Zap,
} from "lucide-react";
import React from "react";
import { getAvatarById } from "@/lib/constants";

/** Crisp custom vector SVG artwork for each of the 12 unoZ player avatars (zero emojis!) */
export function AvatarSvg({
  avatarId,
  className = "w-6 h-6",
}: {
  avatarId: string;
  className?: string;
}) {
  switch (avatarId) {
    case "kucing":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <path d="M5 10V4l4 3h6l4-3v6a7 7 0 0 1-14 0Z" />
          <circle cx="9.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="14.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
          <path d="M10.5 14.5c.8.7 2.2.7 3 0" />
        </svg>
      );
    case "rubah":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <path d="M4 5l4 4h8l4-4-1.5 9.5L12 20l-6.5-5.5L4 5Z" />
          <circle cx="9.5" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="14.5" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "panda":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <circle cx="6.5" cy="6.5" r="2.2" fill="currentColor" />
          <circle cx="17.5" cy="6.5" r="2.2" fill="currentColor" />
          <circle cx="12" cy="13" r="7" />
          <ellipse cx="9.3" cy="12.2" rx="1.4" ry="1.8" fill="currentColor" stroke="none" />
          <ellipse cx="14.7" cy="12.2" rx="1.4" ry="1.8" fill="currentColor" stroke="none" />
          <path d="M10.5 15.8c.9.6 2.1.6 3 0" />
        </svg>
      );
    case "kodok":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <circle cx="8" cy="8" r="2.5" />
          <circle cx="16" cy="8" r="2.5" />
          <circle cx="8" cy="8" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="16" cy="8" r="0.9" fill="currentColor" stroke="none" />
          <path d="M4.5 13.5c0-2.5 3.3-4 7.5-4s7.5 1.5 7.5 4c0 3.2-3.3 5.5-7.5 5.5s-7.5-2.3-7.5-5.5Z" />
          <path d="M9 14.5c1.6 1.2 4.4 1.2 6 0" />
        </svg>
      );
    case "naga":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <path d="M5 16c0-5 3-10 7-10 2.5 0 4.5 1.5 5.5 3.5L20 8l-1 4.5c0 4-3.5 6.5-8 6.5-3.5 0-6-1-6-3Z" />
          <path d="M9 6L7 3" />
          <path d="M13 6l1-3" />
          <circle cx="13.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "unicorn":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <path d="M12 2l2 6.5" />
          <path d="M6 19c0-5 2.5-9.5 6-10.5 3.5 1 6 3 6.5 6.5l-3.5 1.5-2 3.5H6Z" />
          <circle cx="13" cy="12" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "robot":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <path d="M12 4v3" />
          <circle cx="12" cy="3.5" r="1" fill="currentColor" />
          <rect x="4" y="7" width="16" height="12" rx="3" />
          <circle cx="9.2" cy="12.5" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="14.8" cy="12.5" r="1.2" fill="currentColor" stroke="none" />
          <path d="M9 16h6" />
        </svg>
      );
    case "alien":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <path d="M5 10a7 7 0 0 1 14 0c0 5-3.5 9.5-7 10.5C8.5 19.5 5 15 5 10Z" />
          <ellipse cx="9.2" cy="11.5" rx="1.6" ry="1.1" transform="rotate(20 9.2 11.5)" fill="currentColor" stroke="none" />
          <ellipse cx="14.8" cy="11.5" rx="1.6" ry="1.1" transform="rotate(-20 14.8 11.5)" fill="currentColor" stroke="none" />
          <path d="M10.5 16h3" />
        </svg>
      );
    case "macan":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <circle cx="12" cy="12.5" r="7.5" />
          <path d="M12 5v3" />
          <path d="M5.5 11h2.5" />
          <path d="M16 11h2.5" />
          <circle cx="9.5" cy="12.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="14.5" cy="12.5" r="1" fill="currentColor" stroke="none" />
          <path d="M10 15.8c1 .8 3 .8 4 0" />
        </svg>
      );
    case "gurita":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <path d="M6 12a6 6 0 1 1 12 0v2H6v-2Z" />
          <path d="M7 14v4a1.5 1.5 0 0 1-2 1" />
          <path d="M10.5 14v5" />
          <path d="M13.5 14v5" />
          <path d="M17 14v4a1.5 1.5 0 0 0 2 1" />
          <circle cx="9.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="14.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "hantu":
      return <Ghost className={className} aria-hidden="true" />;
    case "api":
      return <Flame className={className} aria-hidden="true" />;
    default:
      return <Sparkles className={className} aria-hidden="true" />;
  }
}

export function AvatarBadge({
  avatarId,
  size = "md",
  className = "",
}: {
  avatarId: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const meta = getAvatarById(avatarId);
  const boxClass =
    size === "sm"
      ? "w-8 h-8 rounded-xl"
      : size === "lg"
      ? "w-12 h-12 rounded-2xl"
      : size === "xl"
      ? "w-16 h-16 rounded-2xl"
      : "w-10 h-10 rounded-xl";
  const iconClass =
    size === "sm"
      ? "w-4 h-4"
      : size === "lg"
      ? "w-6 h-6"
      : size === "xl"
      ? "w-8 h-8"
      : "w-5 h-5";

  return (
    <span
      className={`inline-flex items-center justify-center bg-gradient-to-br ${meta.bg} text-white shadow ${boxClass} ${className}`}
    >
      <AvatarSvg avatarId={avatarId} className={iconClass} />
    </span>
  );
}

/** Crisp SVG icon matching each Indonesian quick banter emote preset */
export function EmoteIcon({
  text,
  className = "w-3.5 h-3.5",
}: {
  text: string;
  className?: string;
}) {
  switch (text) {
    case "Waduh!":
      return <AlertCircle className={`${className} text-amber-400`} aria-hidden="true" />;
    case "Ampun bang!":
      return <Hand className={`${className} text-sky-400`} aria-hidden="true" />;
    case "Jangan +4 dong!":
      return <ShieldAlert className={`${className} text-rose-400`} aria-hidden="true" />;
    case "Gas terus!":
      return <Flame className={`${className} text-orange-400`} aria-hidden="true" />;
    case "Mantap!":
      return <ThumbsUp className={`${className} text-emerald-400`} aria-hidden="true" />;
    case "Ketar-ketir!":
      return <Zap className={`${className} text-fuchsia-400`} aria-hidden="true" />;
    default:
      return <Sparkles className={`${className} text-amber-400`} aria-hidden="true" />;
  }
}
