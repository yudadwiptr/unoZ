"use client";

import {
  Bot,
  Copy,
  Crown,
  Flame,
  LogOut,
  Play,
  Plus,
  Shield,
  Skull,
  Sparkles,
  Trash2,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import React from "react";
import { AvatarBadge } from "@/components/AvatarIcon";
import { SkinPicker } from "@/components/SkinPicker";
import { UnoCard } from "@/components/UnoCard";
import { UnozLogo } from "@/components/UnozLogo";
import {
  DEFAULT_CHAOS_SETTINGS,
  DEFAULT_KLASIK_SETTINGS,
  DEFAULT_SUPER_CHAOS_SETTINGS,
} from "@/lib/constants";
import type { Card, GameMode, PlayerInfo, RoomSettings } from "@/types/game";

const MODE_PRESETS: Record<GameMode, RoomSettings> = {
  klasik: DEFAULT_KLASIK_SETTINGS,
  chaos: DEFAULT_CHAOS_SETTINGS,
  super_chaos: DEFAULT_SUPER_CHAOS_SETTINGS,
};

const MAX_PLAYERS = 8;

interface LobbyScreenProps {
  roomCode: string;
  isOnlineRoom: boolean;
  isHost: boolean;
  playerToken: string;
  settings: RoomSettings;
  players: PlayerInfo[];
  onSetMode: (mode: GameMode) => void;
  onUpdateSettings: (patch: Partial<RoomSettings>) => void;
  onAddBot: () => void;
  onRemoveBot: (token: string) => void;
  onStartGame: () => void;
  onCopyLink: () => void;
  onLeaveRoom: () => void;
}

interface RuleToggleItem {
  key: keyof Omit<RoomSettings, "mode">;
  label: string;
  desc: string;
  isNew?: boolean;
}

const RULE_TOGGLES: RuleToggleItem[] = [
  {
    key: "stacking",
    label: "Tumpuk Kartu",
    desc: "Balas +2/+4 dengan kartu penambah yang sama atau lebih besar.",
  },
  {
    key: "z_cards",
    label: "Kartu Spesial Z",
    desc: "Z-Swap (kocok ulang semua kartu) & Z-Shield (tameng pantul).",
  },
  {
    key: "mega_draw",
    label: "Kartu Super +6 / +8 / +10",
    desc: "Kartu hukuman raksasa. Bisa ditumpuk sampai meja meledak.",
    isNew: true,
  },
];

interface ModeOption {
  id: GameMode;
  title: string;
  desc: string;
  icon: React.ReactNode;
  cards: Card[];
  activeClass: string;
  iconClass: string;
  tag?: string;
}

const MODE_OPTIONS: ModeOption[] = [
  {
    id: "klasik",
    title: "Klasik",
    desc: "Aturan standar, santai & rapi.",
    icon: <Shield className="w-4 h-4" />,
    cards: [
      { id: "mk1", color: "biru", value: "7" },
      { id: "mk2", color: "hijau", value: "reverse" },
    ],
    activeClass:
      "border-sky-400 bg-gradient-to-br from-sky-500/20 to-blue-600/10 shadow-[0_0_0_3px_rgba(56,189,248,0.18),0_16px_30px_-14px_rgba(56,189,248,0.7)]",
    iconClass: "bg-sky-500 text-white",
  },
  {
    id: "chaos",
    title: "Chaos / Mabar",
    desc: "Tumpuk kartu + Kartu Spesial Z.",
    icon: <Flame className="w-4 h-4" />,
    cards: [
      { id: "mc1", color: "merah", value: "draw2" },
      { id: "mc2", color: "wild", value: "z_swap" },
    ],
    activeClass:
      "border-amber-400 bg-gradient-to-br from-amber-500/20 to-orange-600/10 shadow-[0_0_0_3px_rgba(251,191,36,0.18),0_16px_30px_-14px_rgba(251,191,36,0.7)]",
    iconClass: "bg-orange-500 text-white",
  },
  {
    id: "super_chaos",
    title: "Super Chaos",
    desc: "Semua aturan + Kartu Super +6/+8/+10!",
    icon: <Skull className="w-4 h-4" />,
    cards: [
      { id: "ms1", color: "wild", value: "wild8" },
      { id: "ms2", color: "wild", value: "wild10" },
    ],
    activeClass:
      "border-rose-500 bg-gradient-to-br from-rose-600/25 to-fuchsia-700/15 shadow-[0_0_0_3px_rgba(244,63,94,0.2),0_16px_34px_-12px_rgba(244,63,94,0.8)]",
    iconClass: "bg-rose-600 text-white",
    tag: "Baru",
  },
];

export function LobbyScreen({
  roomCode,
  isOnlineRoom,
  isHost,
  playerToken,
  settings,
  players,
  onSetMode,
  onUpdateSettings,
  onAddBot,
  onRemoveBot,
  onStartGame,
  onCopyLink,
  onLeaveRoom,
}: LobbyScreenProps) {
  const canStart = players.length >= 2;
  const emptySeats = Math.max(0, MAX_PLAYERS - players.length);
  const activeMode = MODE_OPTIONS.find((m) => m.id === settings.mode) ?? MODE_OPTIONS[1];
  const preset = MODE_PRESETS[settings.mode] ?? DEFAULT_CHAOS_SETTINGS;
  const isCustom = RULE_TOGGLES.some((r) => !!settings[r.key] !== !!preset[r.key]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-6 pt-3 pb-10 space-y-4 lg:space-y-5">
      {/* ===== Room banner ===== */}
      <div className="relative overflow-hidden rounded-3xl glass-panel px-4 py-4 sm:px-6 sm:py-5">
        <div className="pointer-events-none absolute -right-16 -top-24 w-72 h-72 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-5 min-w-0">
            <UnozLogo size="sm" />
            <div className="h-10 w-px bg-slate-200 dark:bg-white/15 hidden sm:block" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Kode Room
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isOnlineRoom
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-300"
                  }`}
                >
                  {isOnlineRoom ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {isOnlineRoom ? "Online" : "Lokal"}
                </span>
              </div>
              {/* Code as letter tiles */}
              <div className="mt-1.5 flex items-center gap-1 sm:gap-1.5" aria-label={`Kode room ${roomCode}`}>
                {roomCode.split("").map((ch, i) => (
                  <span
                    key={`${ch}-${i}`}
                    className="w-8 h-10 sm:w-10 sm:h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-display font-bold text-xl sm:text-2xl flex items-center justify-center shadow-[0_4px_0_rgba(15,23,42,0.35)] dark:shadow-[0_4px_0_rgba(148,163,184,0.5)]"
                    style={{ rotate: `${(i % 2 === 0 ? -1 : 1) * 3}deg` }}
                  >
                    {ch}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto pb-1.5">
            <button
              type="button"
              onClick={onCopyLink}
              className="btn-3d btn-3d-blue flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-b from-sky-400 to-blue-600 text-white font-display font-bold text-sm sm:text-base cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              Salin Link Undangan
            </button>
            <button
              type="button"
              onClick={onLeaveRoom}
              title="Keluar Room"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl font-bold text-sm bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 active:scale-95 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
        {/* ===== Seats ===== */}
        <section className="lg:col-span-5 xl:col-span-4 rounded-3xl glass-panel p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Meja Pemain</h2>
            </div>
            <span className="font-display font-bold text-sm text-slate-700 dark:text-slate-200">
              {players.length}
              <span className="text-slate-400">/{MAX_PLAYERS}</span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden -mt-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500 transition-all duration-500"
              style={{ width: `${(players.length / MAX_PLAYERS) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {players.map((p, idx) => {
              const isMe = p.token === playerToken;
              return (
                <div
                  key={p.token}
                  className={`animate-pop-in group relative rounded-2xl p-3 border-2 flex flex-col items-center text-center gap-1.5 transition ${
                    isMe
                      ? "bg-amber-400/12 border-amber-400/60"
                      : "bg-slate-100/85 dark:bg-white/[0.05] border-transparent"
                  }`}
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <span className="absolute top-2 left-2.5 text-[10px] font-extrabold text-slate-400">
                    #{idx + 1}
                  </span>
                  {isHost && p.isBot && (
                    <button
                      type="button"
                      onClick={() => onRemoveBot(p.token)}
                      aria-label={`Hapus ${p.nickname}`}
                      className="absolute top-1.5 right-1.5 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <div className="relative mt-1">
                    <AvatarBadge avatarId={p.avatar} size="xl" className="border-[3px] border-white dark:border-slate-800 shadow-[0_4px_0_rgba(15,23,42,0.3)]" />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                        p.isOnline ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                      title={p.isOnline ? "Daring" : "Terputus"}
                    />
                    {p.isHost && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-400 border-2 border-white dark:border-slate-900 flex items-center justify-center shadow" title="Ketua Room">
                        <Crown className="w-3.5 h-3.5 text-slate-950" />
                      </span>
                    )}
                  </div>
                  <p className="w-full font-bold text-sm text-slate-900 dark:text-white truncate">
                    {p.nickname}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isMe
                        ? "bg-amber-400 text-slate-950"
                        : p.isBot
                        ? "bg-sky-500/15 text-sky-600 dark:text-sky-300"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                    }`}
                  >
                    {isMe ? "Kamu" : p.isBot ? (<><Bot className="w-3 h-3" />Bot AI</>) : p.isOnline ? "Siap main" : "Terputus"}
                  </span>
                </div>
              );
            })}

            {Array.from({ length: emptySeats }).map((_, i) =>
              isHost && i === 0 ? (
                <button
                  key={`empty-${i}`}
                  type="button"
                  onClick={onAddBot}
                  className="rounded-2xl p-3 min-h-[9.5rem] border-2 border-dashed border-sky-400/60 bg-sky-500/[0.06] hover:bg-sky-500/15 text-sky-600 dark:text-sky-300 flex flex-col items-center justify-center gap-2 transition cursor-pointer group"
                >
                  <span className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-[0_4px_0_#1e40af] group-hover:-translate-y-0.5 group-active:translate-y-0.5 transition">
                    <Plus className="w-6 h-6 stroke-[3]" />
                  </span>
                  <span className="font-display font-bold text-sm">Tambah Bot</span>
                  <span className="text-[10px] font-bold opacity-70">{emptySeats} kursi kosong</span>
                </button>
              ) : (
                <div
                  key={`empty-${i}`}
                  className="hidden lg:flex rounded-2xl p-3 min-h-[9.5rem] border-2 border-dashed border-slate-300/70 dark:border-white/10 flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-600"
                >
                  <span className="w-12 h-12 rounded-2xl border-2 border-dashed border-current" />
                  <span className="text-[11px] font-bold">Kursi kosong</span>
                </div>
              )
            )}
          </div>
        </section>

        {/* ===== Settings ===== */}
        <section className="lg:col-span-7 xl:col-span-8 rounded-3xl glass-panel p-4 sm:p-5 lg:p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-fuchsia-500" />
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Pengaturan Permainan</h2>
            </div>
            {!isHost && (
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Diatur oleh Ketua Room
              </span>
            )}
          </div>

          {/* Mode cards */}
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Mode Permainan
            </span>
            <div role="radiogroup" aria-label="Mode Permainan" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {MODE_OPTIONS.map((mode) => {
                const active = settings.mode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={!isHost}
                    onClick={() => onSetMode(mode.id)}
                    className={`group relative overflow-hidden rounded-2xl border-2 p-3.5 text-left transition-all duration-200 ${
                      active
                        ? `${mode.activeClass} -translate-y-0.5`
                        : "border-transparent bg-slate-100/80 dark:bg-white/[0.04] hover:border-slate-300 dark:hover:border-white/15"
                    } ${isHost ? "cursor-pointer" : "cursor-default"}`}
                  >
                    {active && isCustom && (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-slate-900/80 dark:bg-white/90 text-white dark:text-slate-950 text-[9px] font-extrabold uppercase tracking-wider">
                        Kustom
                      </span>
                    )}
                    {mode.tag && !(active && isCustom) && (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-extrabold uppercase tracking-wider animate-pulse">
                        {mode.tag}
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${mode.iconClass}`}>
                        {mode.icon}
                      </span>
                      <span className="font-display font-bold text-base text-slate-900 dark:text-white">
                        {mode.title}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-snug text-slate-500 dark:text-slate-400 pr-14 sm:pr-0">
                      {mode.desc}
                    </p>
                    {/* Mini card illustration */}
                    <div className="pointer-events-none mt-2 h-[4.75rem] relative hidden sm:block" aria-hidden="true">
                      <div className="absolute left-1/2 top-1 -translate-x-[85%] -rotate-12 transition-transform duration-300 group-hover:-rotate-[18deg] group-hover:-translate-x-[95%]">
                        <UnoCard card={mode.cards[0]} size="xs" />
                      </div>
                      <div className="absolute left-1/2 top-0 -translate-x-[15%] rotate-12 transition-transform duration-300 group-hover:rotate-[18deg] group-hover:-translate-x-[5%]">
                        <UnoCard card={mode.cards[1]} size="xs" />
                      </div>
                    </div>
                    <div className="pointer-events-none absolute right-2 bottom-1 flex sm:hidden" aria-hidden="true">
                      <div className="-rotate-6 scale-75 origin-bottom-right">
                        <UnoCard card={mode.cards[1]} size="xs" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* House rules */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Aturan Rumah
              </span>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                {isCustom ? "Kustom • bebas nyalakan/matikan" : "Bebas nyalakan/matikan"}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {RULE_TOGGLES.map((rule) => {
                const enabled = !!settings[rule.key];
                return (
                  <button
                    key={rule.key}
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    disabled={!isHost}
                    onClick={() => onUpdateSettings({ [rule.key]: !enabled })}
                    className={`w-full flex items-center justify-between gap-3 p-3 rounded-2xl border-2 text-left transition ${
                      enabled
                        ? "bg-emerald-500/10 border-emerald-500/40"
                        : "bg-slate-100/75 dark:bg-white/[0.04] border-transparent"
                    } ${isHost ? "cursor-pointer hover:border-emerald-400/60" : "cursor-default"}`}
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-white">
                        {rule.label}
                        {rule.isNew && (
                          <span className="px-1.5 py-px rounded-md bg-rose-500 text-white text-[9px] font-extrabold uppercase">
                            Baru
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{rule.desc}</p>
                    </div>
                    <span
                      className={`relative shrink-0 w-12 h-7 rounded-full transition-colors shadow-inner ${
                        enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                          enabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card skin (per viewer) */}
          <SkinPicker />

          {/* Start */}
          <div className="mt-auto pt-1 pb-1.5">
            {isHost ? (
              <button
                type="button"
                disabled={!canStart}
                onClick={onStartGame}
                className="btn-3d btn-3d-green w-full py-4 px-6 rounded-2xl bg-gradient-to-b from-emerald-300 to-emerald-600 text-slate-950 inline-flex items-center justify-center gap-3 cursor-pointer"
              >
                <span className="w-11 h-11 rounded-xl bg-slate-950/90 text-emerald-300 flex items-center justify-center">
                  <Play className="w-6 h-6 fill-emerald-300" />
                </span>
                <span className="text-left leading-tight">
                  <span className="block font-display font-bold text-xl">
                    {canStart ? "Mulai Main" : "Minimal 2 Pemain"}
                  </span>
                  <span className="block text-[11px] font-bold text-slate-900/70">
                    {activeMode.title}
                    {isCustom ? " (Kustom)" : ""} • {players.length} pemain siap
                  </span>
                </span>
              </button>
            ) : (
              <div className="w-full py-4 px-5 rounded-2xl bg-slate-200/80 dark:bg-white/10 text-center text-sm font-bold text-slate-600 dark:text-slate-300 inline-flex items-center justify-center gap-2">
                <span className="turn-dots inline-flex gap-1" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                Menunggu Ketua Room menekan Mulai Main
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
