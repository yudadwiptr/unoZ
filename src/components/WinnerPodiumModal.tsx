"use client";

import { Crown, Home, RotateCcw, Trophy } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { AvatarBadge } from "@/components/AvatarIcon";
import type { PodiumEntry } from "@/types/game";

interface WinnerPodiumModalProps {
  open: boolean;
  podium: PodiumEntry[];
  myToken: string;
  isHost: boolean;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

export function WinnerPodiumModal({
  open,
  podium,
  myToken,
  isHost,
  onPlayAgain,
  onBackToLobby,
}: WinnerPodiumModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Full-screen celebratory confetti animation
  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = ["#ef4444", "#3b82f6", "#facc15", "#22c55e", "#d946ef", "#38bdf8"];
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: 6 + Math.random() * 7,
      h: 8 + Math.random() * 9,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 2.8,
      vy: 2.2 + Math.random() * 3.8,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.16,
    }));

    let rafId = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      rafId = window.requestAnimationFrame(render);
    };
    rafId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [open]);

  if (!open || podium.length === 0) return null;

  const winner = podium[0];
  const iWon = winner.token === myToken;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-0"
      />

      <div className="relative z-10 w-full max-w-md rounded-3xl glass-panel p-6 space-y-5 animate-pop-in text-center">
        {/* Crown & Title */}
        <div className="space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/35">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 bg-clip-text text-transparent">
            Pemenang!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {iWon
              ? "Gokil! Kamu sukses menghabiskan semua kartu paling duluan!"
              : `${winner.nickname} keluar jadi juara ronde ini!`}
          </p>
        </div>

        {/* Champion Spotlight */}
        <div className="relative p-4 rounded-2xl bg-gradient-to-br from-amber-400/20 via-orange-500/15 to-rose-500/15 border border-amber-400/40 flex flex-col items-center gap-2">
          <Crown className="w-6 h-6 text-amber-400 fill-amber-400 -mb-1" />
          <AvatarBadge
            avatarId={winner.avatar}
            size="xl"
            className="ring-4 ring-amber-400 shadow-lg"
          />
          <div>
            <p className="font-display font-bold text-xl text-slate-900 dark:text-white">
              {winner.nickname}
            </p>
            <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-extrabold">
              Juara 1 • 0 Kartu Tersisa
            </span>
          </div>
        </div>

        {/* Remaining Standings */}
        {podium.length > 1 && (
          <div className="space-y-2 max-h-44 overflow-y-auto text-left">
            {podium.slice(1).map((entry) => (
              <div
                key={entry.token}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-slate-100/90 dark:bg-white/8 border border-slate-200/70 dark:border-white/10"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 text-center font-display font-bold text-sm text-slate-500 dark:text-slate-400">
                    #{entry.rank}
                  </span>
                  <AvatarBadge avatarId={entry.avatar} size="sm" />
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                    {entry.nickname}
                    {entry.token === myToken ? " (Kamu)" : ""}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {entry.cardCount} kartu
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          {isHost ? (
            <button
              type="button"
              onClick={onPlayAgain}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl font-display font-bold text-base bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/25 hover:brightness-105 active:scale-95 transition cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              Main Lagi
            </button>
          ) : (
            <div className="flex-1 py-3 px-4 rounded-2xl bg-slate-200/80 dark:bg-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300">
              Menunggu Ketua Room memulai ronde baru...
            </div>
          )}

          <button
            type="button"
            onClick={onBackToLobby}
            className="inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-sm bg-slate-200/90 dark:bg-white/10 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-white/15 active:scale-95 transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Ke Lobby
          </button>
        </div>
      </div>
    </div>
  );
}
