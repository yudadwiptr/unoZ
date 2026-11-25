"use client";

import {
  ArrowLeft,
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
import { SkinPicker } from "@/components/SkinPicker";
import { UnoCard } from "@/components/UnoCard";
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

type Intent = "create" | "join";

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
  // Invite links jump straight into the join setup with the code filled in
  const [step, setStep] = useState<"home" | "setup">(initialRoomCode ? "setup" : "home");
  const [intent, setIntent] = useState<Intent>(initialRoomCode ? "join" : "create");
  const [roomCodeInput, setRoomCodeInput] = useState(initialRoomCode);

  const goSetup = (next: Intent) => {
    soundEngine.play("click");
    setIntent(next);
    setStep("setup");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (step === "home") {
    return (
      <HomeStep
        isSupabaseConfigured={isSupabaseConfigured}
        onPick={goSetup}
        onOpenRules={onOpenRules}
      />
    );
  }

  return (
    <SetupStep
      intent={intent}
      nickname={nickname}
      setNickname={setNickname}
      avatar={avatar}
      setAvatar={setAvatar}
      roomCode={roomCodeInput}
      setRoomCode={setRoomCodeInput}
      invited={Boolean(initialRoomCode)}
      isLoading={isLoading}
      onBack={() => {
        soundEngine.play("click");
        setStep("home");
      }}
      onSubmit={() => (intent === "create" ? onCreateRoom() : onJoinRoom(roomCodeInput))}
    />
  );
}

/* ================================================================
   STEP 1 — Hero + two big choices
   ================================================================ */
function HomeStep({
  isSupabaseConfigured,
  onPick,
  onOpenRules,
}: {
  isSupabaseConfigured: boolean;
  onPick: (intent: Intent) => void;
  onOpenRules: () => void;
}) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 lg:px-8 pt-4 pb-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
      {/* Hero */}
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
        <div className="lg:hidden">
          <UnozLogo size="lg" showTagline />
        </div>
        <div className="hidden lg:flex items-center gap-5">
          <UnozLogo size="lg" />
        </div>
        <h1 className="hidden lg:block mt-6 font-display font-bold text-5xl xl:text-6xl leading-[1.05] tracking-tight text-slate-900 dark:text-white">
          Kartu mabar
          <br />
          <span className="text-amber-500 dark:text-amber-400">seru &amp; chaos</span>
          <span className="text-emerald-500 dark:text-emerald-400">!</span>
        </h1>
        <p className="hidden lg:block mt-3 max-w-md text-base font-semibold text-slate-600 dark:text-slate-300">
          Bikin room dalam 2 detik, ajak teman lewat link, atau lawan bot. Tanpa login, langsung gas.
        </p>

        {/* Mini fanned hero cards */}
        <div className="mt-5 lg:mt-7 flex items-center pointer-events-none select-none" aria-hidden="true">
          <div className="-rotate-12 translate-x-3 scale-90">
            <UnoCard card={{ id: "h1", color: "merah", value: "draw2" }} size="xs" />
          </div>
          <div className="-rotate-4 translate-x-1 -translate-y-1">
            <UnoCard card={{ id: "h2", color: "wild", value: "z_swap" }} size="xs" />
          </div>
          <div className="rotate-6 -translate-x-1 -translate-y-1">
            <UnoCard card={{ id: "h3", color: "wild", value: "wild8" }} size="xs" />
          </div>
          <div className="rotate-12 -translate-x-3 scale-90">
            <UnoCard card={{ id: "h4", color: "kuning", value: "skip" }} size="xs" />
          </div>
        </div>

        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300">
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

      {/* Choices */}
      <div className="w-full max-w-md mx-auto lg:max-w-none flex flex-col gap-4">
        <button
          type="button"
          onClick={() => onPick("create")}
          className="btn-3d btn-3d-amber group w-full mb-1.5 p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-amber-300 to-orange-500 text-slate-950 flex items-center gap-4 text-left cursor-pointer"
        >
          <span className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-950/90 text-amber-300 flex items-center justify-center">
            <Plus className="w-8 h-8 stroke-[3]" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block font-display font-bold text-2xl sm:text-3xl leading-none">Buat Room</span>
            <span className="block mt-1.5 text-xs sm:text-sm font-bold text-slate-900/75">
              Jadi ketua, atur mode, ajak teman atau lawan bot
            </span>
          </span>
          <ChevronRight className="w-7 h-7 stroke-[3] opacity-70 transition-transform group-hover:translate-x-1" />
        </button>

        <button
          type="button"
          onClick={() => onPick("join")}
          className="btn-3d btn-3d-blue group w-full mb-1.5 p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-sky-400 to-blue-600 text-white flex items-center gap-4 text-left cursor-pointer"
        >
          <span className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-950/80 text-sky-300 flex items-center justify-center">
            <DoorOpen className="w-8 h-8" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block font-display font-bold text-2xl sm:text-3xl leading-none">Gabung Room</span>
            <span className="block mt-1.5 text-xs sm:text-sm font-bold text-white/80">
              Punya kode dari teman? Masuk ke room mereka
            </span>
          </span>
          <ChevronRight className="w-7 h-7 stroke-[3] opacity-70 transition-transform group-hover:translate-x-1" />
        </button>

        <button
          type="button"
          onClick={onOpenRules}
          className="self-center lg:self-start inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 transition cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-amber-500" />
          Cara Main &amp; Kartu Spesial
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   STEP 2 — Name, avatar, card skin (+ room code when joining)
   ================================================================ */
function SetupStep({
  intent,
  nickname,
  setNickname,
  avatar,
  setAvatar,
  roomCode,
  setRoomCode,
  invited,
  isLoading,
  onBack,
  onSubmit,
}: {
  intent: Intent;
  nickname: string;
  setNickname: (v: string) => void;
  avatar: string;
  setAvatar: (v: string) => void;
  roomCode: string;
  setRoomCode: (v: string) => void;
  invited: boolean;
  isLoading: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const selectedAvatar = getAvatarById(avatar);
  const isJoin = intent === "join";

  const handleRandomName = () => {
    soundEngine.play("click");
    const pick = RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)];
    const num = Math.floor(10 + Math.random() * 89);
    setNickname(`${pick}${num}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 lg:px-6 pt-2 pb-10">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="rounded-3xl glass-panel p-4 sm:p-6 lg:p-7"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            type="button"
            onClick={onBack}
            aria-label="Kembali"
            className="shrink-0 w-10 h-10 rounded-xl bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300/80 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 flex items-center justify-center transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Langkah 2 dari 2
            </p>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white leading-tight">
              {isJoin ? "Gabung ke Room Teman" : "Siapkan Profil & Buat Room"}
            </h2>
          </div>
        </div>

        {invited && (
          <div className="mb-5 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>
              Kamu diundang ke Room <strong>#{roomCode}</strong>! Isi nama lalu tekan Gabung.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-[auto_1fr] gap-x-8 gap-y-5">
          {/* Room code (join) — first on phones, top of the right column on desktop */}
          {isJoin && (
            <div className="lg:col-start-2 lg:row-start-1">
              <div className="space-y-2">
                <label
                  htmlFor="room-code-input"
                  className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Kode Room Teman
                </label>
                <div className="flex items-center rounded-2xl bg-white dark:bg-slate-950/60 border-2 border-slate-200 dark:border-white/10 focus-within:border-sky-400 transition">
                  <span className="pl-4 font-display font-bold text-2xl text-slate-300 dark:text-slate-600" aria-hidden="true">
                    #
                  </span>
                  <input
                    id="room-code-input"
                    type="text"
                    maxLength={6}
                    inputMode="text"
                    autoComplete="off"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                    placeholder="KODE"
                    className="w-full min-w-0 bg-transparent px-2 py-3.5 font-display font-bold tracking-[0.35em] text-2xl text-slate-900 dark:text-white placeholder:tracking-[0.35em] placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* LEFT — profile */}
          <div className="space-y-5 lg:col-start-1 lg:row-start-1 lg:row-span-2">
            <div
              className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.04] p-4"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 12% 20%, rgba(251,191,36,0.18), transparent 55%)",
              }}
            >
              <div className="relative flex items-center gap-4">
                <div className="relative shrink-0 -rotate-6">
                  <div
                    key={selectedAvatar.id}
                    className={`animate-pop-in relative w-20 h-20 rounded-[1.4rem] border-[3px] border-white bg-gradient-to-br ${selectedAvatar.bg} text-white flex items-center justify-center shadow-[0_4px_0_rgba(15,23,42,0.35)]`}
                  >
                    <div className="pointer-events-none absolute inset-0 rounded-[1.2rem] bg-gradient-to-b from-white/35 via-transparent to-black/15" />
                    <AvatarSvg avatarId={selectedAvatar.id} className="relative w-11 h-11 drop-shadow-[0_2px_0_rgba(15,23,42,0.45)]" />
                  </div>
                  <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-extrabold uppercase tracking-wide border-2 border-white dark:border-slate-900">
                    Kamu
                  </span>
                </div>

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
                      autoComplete="off"
                      className="flex-1 min-w-0 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-950/60 border-2 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-display font-bold text-base placeholder:font-sans placeholder:font-semibold placeholder:text-sm placeholder:text-slate-400 focus:outline-none focus:border-amber-400 dark:focus:border-amber-400 transition"
                    />
                    <button
                      type="button"
                      onClick={handleRandomName}
                      title="Acak Nama Panggilan"
                      aria-label="Acak Nama Panggilan"
                      className="shrink-0 w-11 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white inline-flex items-center justify-center shadow-[0_3px_0_#4c1d95] active:translate-y-0.5 active:shadow-none transition cursor-pointer"
                    >
                      <Dices className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <span className={`inline-block w-2 h-2 rounded-full bg-gradient-to-br ${selectedAvatar.bg}`} />
                    {selectedAvatar.label}
                  </p>
                </div>
              </div>
            </div>

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
              <div role="radiogroup" aria-labelledby="avatar-label" className="grid grid-cols-6 gap-2 sm:gap-2.5 pt-1.5">
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
                      className={`group relative aspect-square rounded-2xl bg-gradient-to-br ${opt.bg} text-white flex items-center justify-center transition-transform duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                        selected
                          ? "border-[3px] border-white -translate-y-1 shadow-[0_4px_0_rgba(15,23,42,0.4),0_0_0_3px_rgba(251,191,36,0.9)]"
                          : "border-2 border-white/15 shadow-[0_3px_0_rgba(15,23,42,0.35)] hover:-translate-y-0.5"
                      }`}
                    >
                      <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/30 via-transparent to-black/15" />
                      <AvatarSvg
                        avatarId={opt.id}
                        className={`relative drop-shadow-[0_1.5px_0_rgba(15,23,42,0.4)] ${
                          selected ? "w-7 h-7 sm:w-8 sm:h-8" : "w-6 h-6 sm:w-7 sm:h-7"
                        }`}
                      />
                      {selected && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 border-2 border-white dark:border-slate-900 text-slate-950 flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3.5]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT — skin, submit */}
          <div className={`flex flex-col gap-5 lg:col-start-2 ${isJoin ? "lg:row-start-2" : "lg:row-start-1 lg:row-span-2"}`}>
            <SkinPicker layout="grid2" />

            <button
              type="submit"
              disabled={isLoading}
              className={`btn-3d mt-auto mb-1.5 w-full py-3.5 pl-3.5 pr-5 rounded-2xl inline-flex items-center gap-3 cursor-pointer ${
                isJoin
                  ? "btn-3d-blue bg-gradient-to-b from-sky-400 to-blue-600 text-white"
                  : "btn-3d-amber bg-gradient-to-b from-amber-300 to-orange-500 text-slate-950"
              }`}
            >
              <span
                className={`shrink-0 w-11 h-11 rounded-xl bg-slate-950/90 flex items-center justify-center ${
                  isJoin ? "text-sky-300" : "text-amber-300"
                }`}
              >
                {isLoading ? (
                  <span className="w-5 h-5 rounded-full border-[3px] border-current border-t-transparent animate-spin" />
                ) : isJoin ? (
                  <DoorOpen className="w-6 h-6" />
                ) : (
                  <Plus className="w-6 h-6 stroke-[3]" />
                )}
              </span>
              <span className="flex-1 text-left font-display font-bold text-xl">
                {isLoading ? "Menyiapkan..." : isJoin ? "Gabung Room" : "Buat Room Sekarang"}
              </span>
              <ChevronRight className="w-6 h-6 stroke-[3] opacity-70" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
