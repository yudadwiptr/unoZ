"use client";

import {
  BookOpen,
  Check,
  ChevronRight,
  Dices,
  DoorOpen,
  Plus,
  Sparkles,
  Wifi,
  WifiOff,
} from "lucide-react";
import React, { useState } from "react";
import { AvatarSvg } from "@/components/AvatarIcon";
import { UnoCard } from "@/components/UnoCard";
import { SkinPicker } from "@/components/SkinPicker";
import { UnozLogo } from "@/components/UnozLogo";
import { AVATAR_OPTIONS, RANDOM_NICKNAMES, getAvatarById } from "@/lib/constants";
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
  const selectedAvatar = getAvatarById(avatar);

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

        {/* Player Profile Preview: live avatar + nickname */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-gradient-to-br from-white/80 to-slate-100/70 dark:from-white/[0.07] dark:to-white/[0.02] p-3.5 sm:p-4">
          {/* Soft glow tinted by the chosen avatar */}
          <div
            className={`pointer-events-none absolute -left-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-40 dark:opacity-35 bg-gradient-to-br ${selectedAvatar.bg}`}
          />
          <div className="relative flex items-center gap-3.5 sm:gap-4">
            {/* Big sticker-style avatar */}
            <div className="relative shrink-0 -rotate-6">
              <div
                key={selectedAvatar.id}
                className={`animate-pop-in relative w-[4.5rem] h-[4.5rem] sm:w-20 sm:h-20 rounded-[1.4rem] border-[3px] border-white bg-gradient-to-br ${selectedAvatar.bg} text-white flex items-center justify-center shadow-[0_4px_0_rgba(15,23,42,0.35),0_12px_24px_-8px_rgba(0,0,0,0.5)]`}
              >
                <div className="pointer-events-none absolute inset-0 rounded-[1.2rem] bg-gradient-to-b from-white/35 via-transparent to-black/15" />
                <AvatarSvg avatarId={selectedAvatar.id} className="relative w-10 h-10 sm:w-11 sm:h-11 drop-shadow-[0_2px_0_rgba(15,23,42,0.45)]" />
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-extrabold uppercase tracking-wide border-2 border-white dark:border-slate-900 shadow">
                Kamu
              </span>
            </div>

            {/* Nickname input */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <label
                htmlFor="nickname-input"
                className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400"
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
                  className="flex-1 min-w-0 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-950/60 border-2 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-display font-bold text-base placeholder:font-sans placeholder:font-semibold placeholder:text-sm placeholder:text-slate-400 focus:outline-none focus:border-amber-400 dark:focus:border-amber-400 transition"
                />
                <button
                  type="button"
                  onClick={handleRandomName}
                  title="Acak Nama Panggilan"
                  aria-label="Acak Nama Panggilan"
                  className="shrink-0 w-11 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white inline-flex items-center justify-center shadow-[0_3px_0_rgba(76,29,149,0.6)] hover:brightness-110 active:translate-y-0.5 active:shadow-none transition cursor-pointer"
                >
                  <Dices className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <span className={`inline-block w-2 h-2 rounded-full bg-gradient-to-br ${selectedAvatar.bg}`} />
                {selectedAvatar.label}
              </div>
            </div>
          </div>
        </div>

        {/* Avatar Selector */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span
              id="avatar-label"
              className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              Pilih Avatar
            </span>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
              {AVATAR_OPTIONS.findIndex((a) => a.id === avatar) + 1}/{AVATAR_OPTIONS.length}
            </span>
          </div>
          <div
            role="radiogroup"
            aria-labelledby="avatar-label"
            className="grid grid-cols-6 gap-2 sm:gap-2.5"
          >
            {AVATAR_OPTIONS.map((opt) => {
              const selected = opt.id === avatar;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    soundEngine.play("click");
                    setAvatar(opt.id);
                  }}
                  aria-label={opt.label}
                  title={opt.label}
                  className={`group relative aspect-square rounded-2xl bg-gradient-to-br ${opt.bg} text-white flex items-center justify-center transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                    selected
                      ? "border-[3px] border-white -translate-y-1 shadow-[0_4px_0_rgba(15,23,42,0.4),0_0_0_3px_rgba(251,191,36,0.9),0_10px_22px_-6px_rgba(251,191,36,0.55)]"
                      : "border-2 border-white/15 shadow-[0_3px_0_rgba(15,23,42,0.35)] saturate-[0.8] hover:saturate-100 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
                  }`}
                >
                  <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/30 via-transparent to-black/15" />
                  <AvatarSvg
                    avatarId={opt.id}
                    className={`relative drop-shadow-[0_1.5px_0_rgba(15,23,42,0.4)] transition-transform ${
                      selected ? "w-7 h-7 sm:w-8 sm:h-8 scale-110" : "w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110"
                    }`}
                  />
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

        {/* Card Skin */}
        <SkinPicker layout="row" />

        {/* Primary Action: Buat Room */}
        <button
          type="button"
          disabled={isLoading}
          onClick={onCreateRoom}
          className="btn-3d btn-3d-amber w-full mb-1.5 py-3.5 pl-3.5 pr-5 rounded-2xl bg-gradient-to-b from-amber-300 to-orange-500 text-slate-950 inline-flex items-center gap-3 cursor-pointer"
        >
          <span className="shrink-0 w-11 h-11 rounded-xl bg-slate-950/90 text-amber-300 flex items-center justify-center shadow-inner">
            {isLoading ? (
              <span className="w-5 h-5 rounded-full border-[3px] border-amber-300 border-t-transparent animate-spin" />
            ) : (
              <Plus className="w-6 h-6 stroke-[3]" />
            )}
          </span>
          <span className="flex-1 text-left leading-tight">
            <span className="block font-display font-bold text-xl">
              {isLoading ? "Menyiapkan Room..." : "Buat Room"}
            </span>
            <span className="block text-[11px] font-bold text-slate-900/70">
              Jadi ketua • ajak teman atau lawan bot
            </span>
          </span>
          <ChevronRight className="w-6 h-6 stroke-[3] opacity-70" />
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center gap-3">
          <div className="flex-1 border-t border-dashed border-slate-300 dark:border-white/10" />
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Punya kode teman?
          </span>
          <div className="flex-1 border-t border-dashed border-slate-300 dark:border-white/10" />
        </div>

        {/* Join Room via 5-digit Code */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onJoinRoom(roomCodeInput);
          }}
          className="flex items-stretch gap-2.5 pb-1.5"
        >
          <label className="relative flex-1 min-w-0 flex items-center rounded-2xl bg-white dark:bg-slate-950/60 border-2 border-slate-200 dark:border-white/10 focus-within:border-sky-400 transition">
            <span className="pl-3.5 font-display font-bold text-lg text-slate-300 dark:text-slate-600" aria-hidden="true">
              #
            </span>
            <input
              type="text"
              maxLength={6}
              inputMode="text"
              aria-label="Kode room"
              value={roomCodeInput}
              onChange={(e) =>
                setRoomCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
              }
              placeholder="KODE"
              className="w-full min-w-0 bg-transparent px-2 py-3 font-display font-bold tracking-[0.3em] text-lg text-slate-900 dark:text-white placeholder:tracking-[0.3em] placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-3d btn-3d-blue shrink-0 px-5 rounded-2xl bg-gradient-to-b from-sky-400 to-blue-600 text-white font-display font-bold text-base inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <DoorOpen className="w-5 h-5" />
            Gabung
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
