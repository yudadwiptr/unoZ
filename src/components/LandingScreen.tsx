"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Crown,
  Dices,
  DoorOpen,
  Plus,
  Sparkles,
  Swords,
  Wifi,
  WifiOff,
} from "lucide-react";
import React, { useState } from "react";
import { AvatarBadge, AvatarSvg } from "@/components/AvatarIcon";
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
    return <HomeStep isSupabaseConfigured={isSupabaseConfigured} onPick={goSetup} />;
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

/* ----------------------------------------------------------------
   Big action tiles
   ---------------------------------------------------------------- */
function CreateTile({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="tile-btn group w-full mb-2 p-3.5 sm:p-4 pr-4 sm:pr-5 flex items-center gap-3.5 sm:gap-4 text-left text-slate-950 cursor-pointer"
    >
      <span className="tile-icon shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center">
        <Plus className="w-8 h-8 stroke-[3.2] transition-transform duration-300 group-hover:rotate-90" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-display font-bold text-[1.7rem] sm:text-3xl leading-none tracking-tight">
          Buat Room
        </span>
        <span className="block mt-1.5 text-xs sm:text-sm font-bold text-slate-900/70">
          Jadi ketua • atur mode • ajak teman / bot
        </span>
      </span>
      {/* Cards fanning out over the top edge */}
      <span className="pointer-events-none absolute right-20 -top-7 hidden sm:block w-28 h-20" aria-hidden="true">
        <span className="absolute left-2 top-2 -rotate-[16deg] transition-transform duration-300 group-hover:-translate-x-3 group-hover:-rotate-[26deg]">
          <UnoCard card={{ id: "tc1", color: "merah", value: "draw2" }} size="xs" />
        </span>
        <span className="absolute left-9 top-0 transition-transform duration-300 group-hover:-translate-y-2">
          <UnoCard card={{ id: "tc2", color: "wild", value: "wild4" }} size="xs" />
        </span>
        <span className="absolute left-16 top-2 rotate-[16deg] transition-transform duration-300 group-hover:translate-x-3 group-hover:rotate-[26deg]">
          <UnoCard card={{ id: "tc3", color: "biru", value: "7" }} size="xs" />
        </span>
      </span>
      <span className="tile-key shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center">
        <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
      </span>
    </button>
  );
}

function JoinTile({ onClick }: { onClick: () => void }) {
  const tiles = ["Z", "7", "K", "Q"];
  return (
    <button
      type="button"
      onClick={onClick}
      className="tile-btn tile-blue group w-full mb-2 p-3.5 sm:p-4 pr-4 sm:pr-5 flex items-center gap-3.5 sm:gap-4 text-left text-white cursor-pointer"
    >
      <span className="tile-icon shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center">
        <DoorOpen className="w-8 h-8 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-display font-bold text-[1.7rem] sm:text-3xl leading-none tracking-tight drop-shadow-[0_2px_0_rgba(30,58,138,0.6)]">
          Gabung Room
        </span>
        <span className="block mt-1.5 text-xs sm:text-sm font-bold text-white/85">
          Masukkan kode dari temanmu
        </span>
      </span>
      {/* Code tiles peeking over the top edge, flipping on hover */}
      <span className="pointer-events-none absolute right-20 -top-4 hidden sm:flex items-center gap-1" aria-hidden="true">
        <span className="font-display font-bold text-lg text-white/80 mr-0.5">#</span>
        {tiles.map((t, i) => (
          <span
            key={t}
            className="w-7 h-9 rounded-lg bg-[#0b1020] text-sky-300 font-display font-bold text-base flex items-center justify-center border-2 border-white/80 shadow-[0_3px_0_rgba(0,0,0,0.3)] transition-transform duration-300 group-hover:-translate-y-1.5"
            style={{ rotate: `${(i % 2 === 0 ? -1 : 1) * 5}deg`, transitionDelay: `${i * 40}ms` }}
          >
            {t}
          </span>
        ))}
      </span>
      <span className="tile-key shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center">
        <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
      </span>
    </button>
  );
}

/* ================================================================
   STEP 1 — Hero + two big choices
   ================================================================ */
function HomeStep({
  isSupabaseConfigured,
  onPick,
}: {
  isSupabaseConfigured: boolean;
  onPick: (intent: Intent) => void;
}) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 lg:px-8 pt-4 pb-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
      {/* Hero */}
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
        <div className="lg:hidden">
          <UnozLogo size="lg" showTagline />
        </div>
        <div className="hidden lg:block">
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

        <div className="mt-4 lg:mt-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300">
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
      <div className="w-full max-w-md mx-auto lg:max-w-none flex flex-col gap-6 sm:gap-8 sm:pt-6">
        <CreateTile onClick={() => onPick("create")} />
        <div className="flex items-center gap-3 -my-2 sm:-my-3" aria-hidden="true">
          <span className="flex-1 h-px bg-slate-300/70 dark:bg-white/10" />
          <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            atau
          </span>
          <span className="flex-1 h-px bg-slate-300/70 dark:bg-white/10" />
        </div>
        <JoinTile onClick={() => onPick("join")} />
      </div>
    </div>
  );
}

/* ================================================================
   Live "player card" preview — your profile as a playing card
   ================================================================ */
function PlayerCardPreview({
  nickname,
  avatarId,
  isJoin,
}: {
  nickname: string;
  avatarId: string;
  isJoin: boolean;
}) {
  const meta = getAvatarById(avatarId);
  return (
    <div className="relative mx-auto w-[15.5rem] pt-3 pb-4">
      {/* Ghost card behind for depth */}
      <div className="absolute inset-x-6 top-5 bottom-3 rounded-[1.6rem] bg-slate-900/80 dark:bg-white/10 rotate-[7deg] border-4 border-white/70" />
      <div
        key={meta.id}
        className={`animate-pop-in relative aspect-[5/7] rounded-[1.6rem] border-[5px] border-white bg-gradient-to-br ${meta.bg} -rotate-3 overflow-hidden shadow-[0_8px_0_rgba(15,23,42,0.35),0_30px_50px_-20px_rgba(0,0,0,0.6)]`}
      >
        <div className="absolute inset-0 card-tex-wild opacity-40" />
        <div className="absolute inset-0 card-rays" />
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent" />
        <div className="absolute inset-[6px] rounded-[1.1rem] border border-white/40" />

        {/* Corners */}
        <div className="absolute top-3 left-3.5 flex flex-col items-center leading-none text-white">
          <span className="font-display font-bold text-lg card-corner-ink">Z</span>
          <AvatarSvg avatarId={meta.id} className="w-3.5 h-3.5 mt-0.5" />
        </div>
        <div className="absolute bottom-3 right-3.5 flex flex-col items-center leading-none text-white rotate-180">
          <span className="font-display font-bold text-lg card-corner-ink">Z</span>
          <AvatarSvg avatarId={meta.id} className="w-3.5 h-3.5 mt-0.5" />
        </div>

        {/* Medallion with avatar */}
        <div className="absolute inset-0 flex items-center justify-center -mt-6">
          <div className="absolute w-28 h-28 rotate-45 rounded-[28%] card-medallion" />
          <AvatarSvg avatarId={meta.id} className="relative w-16 h-16 text-slate-900" />
        </div>

        {/* Name plate */}
        <div className="absolute inset-x-4 bottom-7 flex flex-col items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
              isJoin ? "bg-sky-400 text-slate-950" : "bg-amber-400 text-slate-950"
            }`}
          >
            {isJoin ? <Swords className="w-3 h-3" /> : <Crown className="w-3 h-3" />}
            {isJoin ? "Penantang" : "Ketua Room"}
          </span>
          <span className="max-w-full truncate px-3 py-1 rounded-xl bg-slate-950/85 text-white font-display font-bold text-lg leading-tight border border-white/20">
            {nickname.trim() || "Nama kamu?"}
          </span>
        </div>
      </div>
      <p className="mt-5 text-center text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Kartu pemainmu • {meta.label}
      </p>
    </div>
  );
}

/* ================================================================
   STEP 2 — Name & avatar (+ room code when joining)
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
        className="rounded-3xl glass-panel p-4 sm:p-6 lg:p-8"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_20rem] lg:grid-rows-[auto_auto_1fr] gap-x-10 gap-y-6">
          {/* Room code (join) — first on phones, right column on desktop */}
          {isJoin && (
            <div className="space-y-2 lg:col-start-2 lg:row-start-2">
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
          )}

          {/* LEFT — name & avatar */}
          <div className="space-y-6 lg:col-start-1 lg:row-start-1 lg:row-span-3">
            <div className="space-y-2">
              <label
                htmlFor="nickname-input"
                className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Nama Panggilan
              </label>
              <div className="flex gap-2.5">
                <AvatarBadge
                  avatarId={avatar}
                  size="lg"
                  className="lg:hidden shrink-0 w-[3.25rem] h-[3.25rem] border-2 border-white dark:border-slate-800"
                />
                <input
                  id="nickname-input"
                  type="text"
                  maxLength={20}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Contoh: BangJago99"
                  autoComplete="off"
                  className="flex-1 min-w-0 px-4 py-3 rounded-2xl bg-white dark:bg-slate-950/60 border-2 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-display font-bold text-lg placeholder:font-sans placeholder:font-semibold placeholder:text-sm placeholder:text-slate-400 focus:outline-none focus:border-amber-400 dark:focus:border-amber-400 transition"
                />
                <button
                  type="button"
                  onClick={handleRandomName}
                  title="Acak Nama Panggilan"
                  aria-label="Acak Nama Panggilan"
                  className="shrink-0 w-[3.25rem] rounded-2xl bg-violet-600 hover:bg-violet-500 text-white inline-flex items-center justify-center shadow-[0_4px_0_#4c1d95] active:translate-y-1 active:shadow-none transition cursor-pointer"
                >
                  <Dices className="w-6 h-6" />
                </button>
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
                  {getAvatarById(avatar).label}
                </span>
              </div>
              <div role="radiogroup" aria-labelledby="avatar-label" className="grid grid-cols-6 gap-2 sm:gap-3 pt-1.5">
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
                          selected ? "w-7 h-7 sm:w-9 sm:h-9" : "w-6 h-6 sm:w-8 sm:h-8"
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

          {/* RIGHT — live player card (desktop) */}
          <div className="hidden lg:block lg:col-start-2 lg:row-start-1">
            <PlayerCardPreview nickname={nickname} avatarId={avatar} isJoin={isJoin} />
          </div>

          {/* Submit */}
          <div className="lg:col-start-2 lg:row-start-3 lg:self-end pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`tile-btn ${isJoin ? "tile-blue text-white" : "text-slate-950"} group w-full mb-2 p-3 pr-3.5 flex items-center gap-3 text-left cursor-pointer disabled:opacity-80`}
            >
              <span className="tile-icon shrink-0 w-12 h-12 rounded-xl flex items-center justify-center">
                {isLoading ? (
                  <span className="w-5 h-5 rounded-full border-[3px] border-current border-t-transparent animate-spin" />
                ) : isJoin ? (
                  <DoorOpen className="w-6 h-6" />
                ) : (
                  <Plus className="w-7 h-7 stroke-[3]" />
                )}
              </span>
              <span className="flex-1 min-w-0 font-display font-bold text-xl leading-tight">
                {isLoading ? "Menyiapkan..." : isJoin ? "Gabung Room" : "Buat Room"}
              </span>
              <span className="tile-key shrink-0 w-10 h-10 rounded-full flex items-center justify-center">
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
