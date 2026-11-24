"use client";

import { BookOpen, ExternalLink, Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { GameBoard } from "@/components/GameBoard";
import { HowToPlayModal } from "@/components/HowToPlayModal";
import { LandingScreen } from "@/components/LandingScreen";
import { LobbyScreen } from "@/components/LobbyScreen";
import { useUnozGame } from "@/hooks/useUnozGame";
import { soundEngine } from "@/lib/sound";

export function UnozApp() {
  const searchParams = useSearchParams();
  const initialRoomCode = (searchParams.get("room") ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);

  const game = useUnozGame();
  const [showRules, setShowRules] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [muted, setMuted] = useState<boolean>(false);

  // Sync dark/light theme & mute state from localStorage on mount without hydration mismatch
  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      const savedTheme = window.localStorage.getItem("unoz_theme");
      const isDark = savedTheme ? savedTheme === "dark" : true;
      setDarkMode(isDark);
      document.documentElement.classList.toggle("dark", isDark);
      setMuted(soundEngine.isMuted());
    });
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  const toggleTheme = () => {
    soundEngine.play("click");
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      window.localStorage.setItem("unoz_theme", next ? "dark" : "light");
      return next;
    });
  };

  const toggleMute = () => {
    const next = !muted;
    soundEngine.setMuted(next);
    setMuted(next);
    if (!next) soundEngine.play("click");
  };

  return (
    <div className="relative min-h-dvh flex flex-col overflow-x-hidden">
      {/* Vibrant Ambient Background Gradients */}
      <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
        <div className="absolute -top-28 -left-24 w-80 h-80 rounded-full bg-rose-500/20 dark:bg-rose-600/20 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-sky-500/20 dark:bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 w-80 h-80 rounded-full bg-amber-400/20 dark:bg-emerald-500/15 blur-3xl" />
      </div>

      {/* Global Minimal Utility Bar */}
      <header className="w-full max-w-5xl mx-auto px-4 pt-3 pb-1 flex items-center justify-between">
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
          {game.screen === "landing"
            ? "Main Kartu Bareng Teman & Bot"
            : game.screen === "lobby"
            ? "Ruang Tunggu Lobby"
            : "Meja Permainan unoZ"}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              soundEngine.play("click");
              setShowRules(true);
            }}
            aria-label="Buka panduan Cara Main"
            title="Cara Main"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel text-xs font-bold text-slate-700 dark:text-slate-200 hover:brightness-105 active:scale-95 transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Cara Main</span>
          </button>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Nyalakan suara" : "Bisukan suara"}
            title={muted ? "Nyalakan suara" : "Bisukan suara"}
            className="w-9 h-9 rounded-xl glass-panel flex items-center justify-center text-slate-700 dark:text-slate-200 hover:brightness-105 active:scale-95 transition cursor-pointer"
          >
            {muted ? (
              <VolumeX className="w-4 h-4 text-rose-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-500" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={darkMode ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
            title={darkMode ? "Mode Terang" : "Mode Gelap"}
            className="w-9 h-9 rounded-xl glass-panel flex items-center justify-center text-slate-700 dark:text-slate-200 hover:brightness-105 active:scale-95 transition cursor-pointer"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Active Screen */}
      <main className="flex-1 flex flex-col justify-center">
        {game.screen === "landing" && (
          <LandingScreen
            key={initialRoomCode || "default"}
            nickname={game.nickname}
            setNickname={game.setNickname}
            avatar={game.avatar}
            setAvatar={game.setAvatar}
            initialRoomCode={initialRoomCode}
            isLoading={game.isLoading}
            isSupabaseConfigured={game.isSupabaseConfigured}
            onCreateRoom={game.createRoom}
            onJoinRoom={game.joinRoom}
            onOpenRules={() => setShowRules(true)}
          />
        )}

        {game.screen === "lobby" && game.room && (
          <LobbyScreen
            roomCode={game.room.roomCode}
            isOnlineRoom={game.room.isOnlineRoom}
            isHost={game.isHost}
            playerToken={game.playerToken}
            settings={game.room.settings}
            players={game.room.players}
            onSetMode={game.setGameMode}
            onUpdateSettings={game.updateSettings}
            onAddBot={game.addBot}
            onRemoveBot={game.removeBot}
            onStartGame={game.startGame}
            onCopyLink={game.copyRoomLink}
            onLeaveRoom={game.leaveRoom}
          />
        )}

        {game.screen === "game" && game.publicState && (
          <GameBoard
            gameState={game.publicState}
            myHand={game.myHand}
            playerToken={game.playerToken}
            isHost={game.isHost}
            isShaking={game.isShaking}
            emotes={game.emotes}
            onPlayCard={game.playCard}
            onDrawCard={game.drawCard}
            onPassTurn={game.passTurn}
            onChooseSwapTarget={game.chooseSwapTarget}
            onCallUnoz={game.callUnoz}
            onTegurPlayer={game.tegurPlayer}
            onSendEmote={game.sendEmote}
            onPlayAgain={game.startGame}
            onBackToLobby={game.backToLobby}
            onOpenRules={() => setShowRules(true)}
          />
        )}

        {game.screen === "game" && !game.publicState && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center px-4">
            <div className="w-10 h-10 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
            <p className="font-display font-bold text-lg text-slate-800 dark:text-slate-100">
              Menyambungkan ke meja permainan...
            </p>
            <button
              type="button"
              onClick={game.backToLobby}
              className="text-xs font-bold text-sky-500 underline cursor-pointer"
            >
              Kembali ke Lobby
            </button>
          </div>
        )}
      </main>

      {/* Footer Credit */}
      {game.screen !== "game" && (
        <footer className="w-full max-w-5xl mx-auto px-4 pb-5 pt-2 text-center">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Dibuat oleh{" "}
            <a
              href="https://yumastudio.digital/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-extrabold text-amber-600 dark:text-amber-400 hover:underline underline-offset-4 transition"
            >
              Yuma Studio
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </footer>
      )}

      {/* Global Indonesian Toast Notifications */}
      <div className="pointer-events-none fixed top-14 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 w-full max-w-sm px-4">
        {game.toasts.map((toast) => (
          <div
            key={toast.id}
            className={`animate-pop-in w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-center shadow-xl border backdrop-blur-md ${
              toast.variant === "success"
                ? "bg-emerald-500/95 text-slate-950 border-emerald-300"
                : toast.variant === "warning"
                ? "bg-amber-400/95 text-slate-950 border-amber-200"
                : toast.variant === "danger"
                ? "bg-rose-600/95 text-white border-rose-400"
                : "bg-slate-900/92 text-white border-white/15"
            }`}
          >
            {toast.text}
          </div>
        ))}
      </div>

      {/* How To Play Modal */}
      <HowToPlayModal open={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}
