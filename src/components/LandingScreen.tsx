"use client";

import {
  BookOpen,
  Dices,
  DoorOpen,
  PlusCircle,
  Sparkles,
  Wifi,
  WifiOff,
} from "lucide-react";
import React, { useState } from "react";
import { AvatarSvg } from "@/components/AvatarIcon";
import { UnoCard } from "@/components/UnoCard";
import { UnozLogo } from "@/components/UnozLogo";
import { AVATAR_OPTIONS, RANDOM_NICKNAMES } from "@/lib/constants";
import { soundEngine } from "@/lib/sound";

interface LandingScreenProps {
  nickname: string;
  setNickname: (val: string) => void;
  avatar: string;
  setAvatar: (val: string) => void;
  initialRoomCode: string;
  isLoading: boolean;
  isSupabaseConfigured: boolean;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onOpenRules: () => void;
}

export function LandingScreen({
  nickname,
  setNickname,
  avatar,
  setAvatar,
  initialRoomCode,
  isLoading,
  isSupabaseConfigured,
  onCreateRoom,
  onJoinRoom,
  onOpenRules,
}: LandingScreenProps) {
  const [roomCodeInput, setRoomCodeInput] = useState(initialRoomCode);

  const handleRandomName = () => {
    soundEngine.play("click");
    const pick =
      RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)];
    const num = Math.floor(10 + Math.random() * 89);
    setNickname(`${pick}${num}`);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-4 pb-10 flex flex-col gap-5">
      {/* Hero Branding + Floating Decorative Cards */}
      <div className="relative text-center pt-2 pb-1 flex flex-col items-center">
        <UnozLogo size="lg" showTagline />

        {/* Mini vibrant fanned hero cards */}
        <div className="mt-5 mb-1 flex items-center justify-center pointer-events-none select-none">
          <div className="-rotate-12 translate-x-3 scale-90">
            <UnoCard card={{ id: "h1", color: "merah", value: "draw2" }} size="xs" />
          </div>
          <div className="-rotate-4 translate-x-1 -translate-y-1">
            <UnoCard card={{ id: "h2", color: "wild", value: "z_swap" }} size="xs" />
          </div>
          <div className="rotate-6 -translate-x-1 -translate-y-1">
            <UnoCard card={{ id: "h3", color: "wild", value: "z_shield" }} size="xs" />
          </div>
          <div className="rotate-12 -translate-x-3 scale-90">
            <UnoCard card={{ id: "h4", color: "kuning", value: "7" }} size="xs" />
          </div>
        </div>

        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300">
          {isSupabaseConfigured ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-500" />
              Server Mabar Online Siap • Tanpa Login
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-500" />
              Mode Cepat Tanpa Login • Siap Mabar Bot AI
            </>
          )}
        </div>
      </div>

      {/* Main Quick-Play Glass Card */}
      <div className="rounded-3xl glass-panel p-5 sm:p-6 space-y-5">
        {/* Invited via Link Banner */}
        {initialRoomCode && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>
              Kamu diundang ke Room <strong>#{initialRoomCode}</strong>! Isi Nama Panggilan lalu klik Gabung Room.
            </span>
          </div>
        )}

        {/* Nickname Input */}
        <div className="space-y-2">
          <label
            htmlFor="nickname-input"
            className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400"
          >
            Nama Panggilan
          </label>
          <div className="flex gap-2">
            <input
              id="nickname-input"
              type="text"
              maxLength={20}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Contoh: BangJago99"
              className="flex-1 px-4 py-3 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white font-bold text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
            />
            <button
              type="button"
              onClick={handleRandomName}
              title="Acak Nama Panggilan"
              className="px-3.5 rounded-2xl bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300/80 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 font-bold text-xs inline-flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Dices className="w-4 h-4" />
              <span className="hidden sm:inline">Acak</span>
            </button>
          </div>
        </div>

        {/* Avatar Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pilih Avatar
            </span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              {AVATAR_OPTIONS.find((a) => a.id === avatar)?.label}
            </span>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {AVATAR_OPTIONS.map((opt) => {
              const selected = opt.id === avatar;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    soundEngine.play("click");
                    setAvatar(opt.id);
                  }}
                  aria-label={opt.label}
                  title={opt.label}
                  className={`aspect-square rounded-2xl bg-gradient-to-br ${opt.bg} text-white flex items-center justify-center transition cursor-pointer ${
                    selected
                      ? "ring-4 ring-amber-400 scale-105 shadow-lg"
                      : "opacity-75 hover:opacity-100 hover:scale-105"
                  }`}
                >
                  <AvatarSvg avatarId={opt.id} className="w-6 h-6 drop-shadow-sm" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Action: Buat Room */}
        <button
          type="button"
          disabled={isLoading}
          onClick={onCreateRoom}
          className="w-full py-4 px-5 rounded-2xl font-display font-bold text-lg bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 text-slate-950 shadow-xl shadow-amber-500/20 hover:brightness-105 active:scale-[0.98] disabled:opacity-60 transition inline-flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <PlusCircle className="w-5 h-5 stroke-[2.5]" />
          {isLoading ? "Menyiapkan Room..." : "Buat Room"}
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-200 dark:border-white/10" />
          <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-transparent shrink-0">
            atau gabung teman
          </span>
          <div className="w-full border-t border-slate-200 dark:border-white/10" />
        </div>

        {/* Join Room via 5-digit Code */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onJoinRoom(roomCodeInput);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            maxLength={6}
            inputMode="text"
            value={roomCodeInput}
            onChange={(e) =>
              setRoomCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
            }
            placeholder="Kode 5 digit"
            className="w-36 sm:w-44 px-4 py-3 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-white/15 text-center font-display font-bold tracking-[0.2em] text-base text-slate-900 dark:text-white placeholder:tracking-normal placeholder:font-sans placeholder:text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-2xl font-display font-bold text-base bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:brightness-105 active:scale-[0.98] disabled:opacity-60 transition inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <DoorOpen className="w-5 h-5" />
            Gabung Room
          </button>
        </form>
      </div>

      {/* Footer Quick Link */}
      <button
        type="button"
        onClick={onOpenRules}
        className="mx-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-white/8 hover:bg-white dark:hover:bg-white/12 border border-slate-200/80 dark:border-white/10 transition cursor-pointer"
      >
        <BookOpen className="w-4 h-4 text-amber-500" />
        Cara Main &amp; Efek Kartu Spesial Z
      </button>
    </div>
  );
}
