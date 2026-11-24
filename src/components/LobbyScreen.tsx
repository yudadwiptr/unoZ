"use client";

import {
  Bot,
  Copy,
  Crown,
  Flame,
  LogOut,
  Play,
  Shield,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import React from "react";
import { AvatarBadge } from "@/components/AvatarIcon";
import { UnozLogo } from "@/components/UnozLogo";
import type { GameMode, PlayerInfo, RoomSettings } from "@/types/game";

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
}

const RULE_TOGGLES: RuleToggleItem[] = [
  {
    key: "stacking",
    label: "Tumpuk Kartu (+2/+4)",
    desc: "Balas serangan +2 atau Wild +4 dengan kartu penambah lainnya.",
  },
  {
    key: "seven_zero",
    label: "Aturan 7-0 (Tukar/Geser Kartu)",
    desc: "Angka 7 tukar kartu dengan pilihanmu, angka 0 geser kartu semua pemain.",
  },
  {
    key: "jump_in",
    label: "Potong Giliran (Jump-In)",
    desc: "Langsung serobot giliran jika punya kartu warna & angka yang persis sama.",
  },
  {
    key: "z_cards",
    label: "Kartu Spesial Z",
    desc: "Tambahkan kartu eksklusif Z-Swap (Kocok Ulang) & Z-Shield (Tameng).",
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

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-3 pb-10 space-y-4">
      {/* Lobby Top Header */}
      <div className="rounded-3xl glass-panel px-4 py-3.5 sm:px-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <UnozLogo size="sm" />
          <div className="h-7 w-px bg-slate-200 dark:bg-white/15 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Kode Room
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                {isOnlineRoom ? (
                  <>
                    <Wifi className="w-3 h-3 text-emerald-500" />
                    Online
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-amber-500" />
                    Lokal
                  </>
                )}
              </span>
            </div>
            <p className="font-display font-bold text-2xl tracking-[0.16em] text-slate-900 dark:text-white leading-tight">
              #{roomCode}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onCopyLink}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-blue-500/20 hover:brightness-105 active:scale-95 transition cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            Salin Link Room
          </button>

          <button
            type="button"
            onClick={onLeaveRoom}
            title="Keluar Room"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 active:scale-95 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Player List (2-8 Pemain) */}
        <div className="lg:col-span-5 rounded-3xl glass-panel p-5 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  Daftar Pemain
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-white/10 text-xs font-extrabold text-slate-700 dark:text-slate-200">
                {players.length} / 8
              </span>
            </div>

            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {players.map((p) => {
                const isMe = p.token === playerToken;
                return (
                  <div
                    key={p.token}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition ${
                      isMe
                        ? "bg-amber-400/12 border-amber-400/45"
                        : "bg-slate-100/85 dark:bg-white/6 border-slate-200/70 dark:border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <AvatarBadge avatarId={p.avatar} size="md" />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                            p.isOnline ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                          title={p.isOnline ? "Daring" : "Terputus"}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {p.nickname}
                          </p>
                          {isMe && (
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                              (Kamu)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {p.isHost && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold">
                              <Crown className="w-2.5 h-2.5" />
                              Ketua Room
                            </span>
                          )}
                          {p.isBot && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-500/20 text-sky-700 dark:text-sky-300 text-[10px] font-extrabold">
                              <Bot className="w-2.5 h-2.5" />
                              Bot AI
                            </span>
                          )}
                          {!p.isHost && !p.isBot && (
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                              {p.isOnline ? "Siap main" : "Sedang terputus"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isHost && p.isBot && (
                      <button
                        type="button"
                        onClick={() => onRemoveBot(p.token)}
                        aria-label={`Hapus ${p.nickname}`}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Bot Button */}
          {isHost && (
            <button
              type="button"
              onClick={onAddBot}
              disabled={players.length >= 8}
              className="w-full py-3 px-4 rounded-2xl font-bold text-sm bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300/80 dark:hover:bg-white/15 disabled:opacity-45 text-slate-800 dark:text-slate-100 inline-flex items-center justify-center gap-2 active:scale-[0.98] transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-sky-500" />
              Tambah Bot ({8 - players.length} slot tersisa)
            </button>
          )}
        </div>

        {/* Right: Host Settings & Start CTA */}
        <div className="lg:col-span-7 rounded-3xl glass-panel p-5 flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-fuchsia-500" />
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  Pengaturan Permainan
                </h2>
              </div>
              {!isHost && (
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Diatur oleh Ketua Room
                </span>
              )}
            </div>

            {/* Mode Permainan: Klasik vs Chaos / Mabar */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Mode Permainan
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={!isHost}
                  onClick={() => onSetMode("klasik")}
                  className={`p-3.5 rounded-2xl border-2 text-left transition ${
                    settings.mode === "klasik"
                      ? "bg-sky-500/15 border-sky-500 shadow-md shadow-sky-500/15"
                      : "bg-slate-100/80 dark:bg-white/5 border-transparent hover:border-slate-300 dark:hover:border-white/20"
                  } ${isHost ? "cursor-pointer" : "cursor-default"}`}
                >
                  <div className="flex items-center gap-2 font-display font-bold text-base text-slate-900 dark:text-white">
                    <Shield className="w-4 h-4 text-sky-500" />
                    Klasik
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Aturan standar murni, santai &amp; rapi.
                  </p>
                </button>

                <button
                  type="button"
                  disabled={!isHost}
                  onClick={() => onSetMode("chaos")}
                  className={`p-3.5 rounded-2xl border-2 text-left transition ${
                    settings.mode === "chaos"
                      ? "bg-gradient-to-br from-amber-500/20 to-rose-500/20 border-amber-400 shadow-md shadow-amber-500/15"
                      : "bg-slate-100/80 dark:bg-white/5 border-transparent hover:border-slate-300 dark:hover:border-white/20"
                  } ${isHost ? "cursor-pointer" : "cursor-default"}`}
                >
                  <div className="flex items-center gap-2 font-display font-bold text-base text-slate-900 dark:text-white">
                    <Flame className="w-4 h-4 text-orange-500" />
                    Chaos / Mabar
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Penuh aturan kocak &amp; Kartu Spesial Z!
                  </p>
                </button>
              </div>
            </div>

            {/* House Rule Toggles */}
            <div className="space-y-2">
              {RULE_TOGGLES.map((rule) => {
                const enabled = settings[rule.key];
                return (
                  <button
                    key={rule.key}
                    type="button"
                    disabled={!isHost}
                    onClick={() =>
                      onUpdateSettings({
                        [rule.key]: !enabled,
                        mode: !enabled ? "chaos" : settings.mode,
                      })
                    }
                    className={`w-full flex items-center justify-between gap-3 p-3 rounded-2xl border text-left transition ${
                      enabled
                        ? "bg-emerald-500/10 border-emerald-500/35"
                        : "bg-slate-100/75 dark:bg-white/5 border-slate-200/70 dark:border-white/10"
                    } ${isHost ? "cursor-pointer hover:brightness-105" : "cursor-default"}`}
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {rule.label}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                        {rule.desc}
                      </p>
                    </div>

                    {/* Switch UI */}
                    <div
                      className={`relative shrink-0 w-12 h-7 rounded-full transition-colors ${
                        enabled
                          ? "bg-emerald-500"
                          : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                          enabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start Game CTA */}
          <div className="pt-1">
            {isHost ? (
              <button
                type="button"
                disabled={!canStart}
                onClick={onStartGame}
                className="w-full py-4 px-6 rounded-2xl font-display font-bold text-xl bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 text-slate-950 shadow-xl shadow-emerald-500/25 hover:brightness-105 active:scale-[0.98] disabled:opacity-45 transition inline-flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Play className="w-6 h-6 fill-slate-950" />
                {canStart ? "Mulai Main" : "Minimal 2 Pemain"}
              </button>
            ) : (
              <div className="w-full py-4 px-5 rounded-2xl bg-slate-200/80 dark:bg-white/10 text-center text-sm font-bold text-slate-600 dark:text-slate-300">
                Menunggu Ketua Room menekan Mulai Main...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
