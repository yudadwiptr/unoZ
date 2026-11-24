"use client";

import { BookOpen, Flame, Shield, Sparkles, X } from "lucide-react";
import React, { useState } from "react";
import { ColorSymbol, UnoCard } from "@/components/UnoCard";

interface HowToPlayModalProps {
  open: boolean;
  onClose: () => void;
}

type RuleTab = "dasar" | "aksi" | "zcard" | "chaos";

export function HowToPlayModal({ open, onClose }: HowToPlayModalProps) {
  const [tab, setTab] = useState<RuleTab>("dasar");

  if (!open) return null;

  const tabs: Array<{ id: RuleTab; label: string; icon: React.ReactNode }> = [
    { id: "dasar", label: "Dasar", icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: "aksi", label: "Kartu Aksi", icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: "zcard", label: "Kartu Z", icon: <Shield className="w-3.5 h-3.5" /> },
    { id: "chaos", label: "Chaos & unoZ!", icon: <Flame className="w-3.5 h-3.5" /> },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-pop-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[88vh] flex flex-col rounded-3xl glass-panel overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/70 dark:border-white/10">
          <div>
            <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">
              Cara Main unoZ
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Panduan cepat biar langsung jago mabar!
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-white/20 transition cursor-pointer"
            aria-label="Tutup panduan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 px-5 pt-3 pb-2 overflow-x-auto no-scrollbar">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                tab === item.id
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md"
                  : "bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/15"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-sm text-slate-700 dark:text-slate-200">
          {tab === "dasar" && (
            <>
              <div className="p-4 rounded-2xl bg-slate-100/90 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Tujuan Permainan
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed">
                  Jadilah pemain pertama yang menghabiskan semua kartu di tangan!
                  Di giliranmu, keluarkan kartu yang punya{" "}
                  <strong>warna sama</strong> atau <strong>angka/simbol sama</strong>{" "}
                  dengan kartu teratas di meja. Kalau tidak punya kartu yang cocok,
                  ketuk tumpukan kartu untuk ambil 1 kartu.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100/90 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 space-y-2.5">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Simbol Ramah Buta Warna
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Setiap warna kartu di unoZ dilengkapi simbol sudut khusus biar gampang dibedakan:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-red-500/15 text-red-600 dark:text-red-400 font-bold text-xs">
                    <ColorSymbol color="merah" className="w-4 h-4" />
                    Merah — Bintang
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold text-xs">
                    <ColorSymbol color="biru" className="w-4 h-4" />
                    Biru — Lingkaran
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-xs">
                    <ColorSymbol color="kuning" className="w-4 h-4" />
                    Kuning — Segitiga
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    <ColorSymbol color="hijau" className="w-4 h-4" />
                    Hijau — Kotak
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === "aksi" && (
            <div className="grid gap-3">
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-100/90 dark:bg-white/5 border border-slate-200/70 dark:border-white/10">
                <UnoCard card={{ id: "d1", color: "merah", value: "skip" }} size="xs" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Lewat (Skip)</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Melompati giliran pemain berikutnya. Lumayan buat bikin lawan gigit jari!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-100/90 dark:bg-white/5 border border-slate-200/70 dark:border-white/10">
                <UnoCard card={{ id: "d2", color: "biru", value: "reverse" }} size="xs" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Putar Balik (Reverse)</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Membalik arah putaran giliran. Khusus permainan 2 orang, efeknya sama seperti Lewat!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-100/90 dark:bg-white/5 border border-slate-200/70 dark:border-white/10">
                <UnoCard card={{ id: "d3", color: "hijau", value: "draw2" }} size="xs" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Ambil 2 (+2)</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Pemain berikutnya wajib ambil 2 kartu (kecuali ditumpuk atau ditangkis Z-Shield).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-100/90 dark:bg-white/5 border border-slate-200/70 dark:border-white/10">
                <UnoCard card={{ id: "d4", color: "wild", value: "wild" }} size="xs" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Ganti Warna (Wild)</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Bisa dimainkan kapan saja saat giliranmu untuk mengganti warna aktif.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-100/90 dark:bg-white/5 border border-slate-200/70 dark:border-white/10">
                <UnoCard card={{ id: "d5", color: "wild", value: "wild4" }} size="xs" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Wild +4</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Ganti warna sesuka hati dan kasih hukuman +4 kartu ke pemain berikutnya!
                  </p>
                </div>
              </div>
            </div>
          )}

          {tab === "zcard" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Kartu eksklusif <strong>unoZ</strong> yang aktif saat opsi{" "}
                <em>Kartu Spesial Z</em> dinyalakan di Lobby!
              </p>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/30">
                <UnoCard card={{ id: "dz1", color: "wild", value: "z_swap" }} size="sm" />
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-base text-fuchsia-600 dark:text-fuchsia-300">
                    Z-Swap (Kocok Ulang)
                  </h4>
                  <p className="text-xs leading-relaxed">
                    Mengumpulkan <strong>semua kartu milik seluruh pemain</strong>,
                    mengocoknya ulang, lalu membaginya secara merata! Cocok banget buat
                    menggagalkan lawan yang tinggal 1 kartu!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
                <UnoCard card={{ id: "dz2", color: "wild", value: "z_shield" }} size="sm" />
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-base text-cyan-600 dark:text-cyan-300">
                    Z-Shield (Tameng)
                  </h4>
                  <p className="text-xs leading-relaxed">
                    Mainkan saat diserang <strong>+2</strong> atau <strong>Wild +4</strong>{" "}
                    untuk <strong>memantulkan seluruh hukuman balik ke pengirimnya!</strong>{" "}
                    Bisa juga dipakai di giliran biasa sebagai tameng siaga untuk serangan
                    berikutnya.
                  </p>
                </div>
              </div>
            </div>
          )}

          {tab === "chaos" && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                <h4 className="font-bold text-amber-700 dark:text-amber-300">
                  Tombol Panik &ldquo;unoZ!&rdquo; &amp; &ldquo;Tegur!&rdquo;
                </h4>
                <p className="text-xs leading-relaxed">
                  Saat kartumu tersisa <strong>1 kartu</strong>, tombol{" "}
                  <strong>unoZ!</strong> bakal muncul di posisi acak di layar!
                  Kamu punya waktu <strong>3 detik</strong> untuk menekannya. Kalau
                  lupa, pemain lain bisa klik <strong>Tegur!</strong> dan kamu kena
                  hukuman <strong>+2 kartu</strong>!
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Tumpuk Kartu (+2/+4)
                </h4>
                <p className="text-xs leading-relaxed">
                  Lawan lempar +2? Balas lagi pakai +2 atau Wild +4 biar hukumannya
                  makin gede buat pemain berikutnya! Wild +4 bisa ditumpuk dengan Wild +4.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Aturan 7-0 (Tukar / Geser Kartu)
                </h4>
                <p className="text-xs leading-relaxed">
                  Keluarin angka <strong>7</strong> untuk tukar seluruh kartumu dengan
                  pemain pilihanmu. Keluarin angka <strong>0</strong> untuk menggeser
                  kartu semua orang searah putaran giliran!
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Potong Giliran (Jump-In)
                </h4>
                <p className="text-xs leading-relaxed">
                  Punya kartu dengan <strong>warna dan angka yang sama persis</strong>{" "}
                  dengan kartu teratas di meja? Langsung ketuk saat muncul tanda{" "}
                  <strong>Potong!</strong> meski bukan giliranmu!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200/70 dark:border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-105 active:scale-95 transition cursor-pointer"
          >
            Siap, Paham!
          </button>
        </div>
      </div>
    </div>
  );
}
