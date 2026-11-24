import type { CardColor, CardValue, RoomSettings } from "@/types/game";

export interface AvatarOption {
  id: string;
  label: string;
  bg: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: "kucing", label: "Kucing Oren", bg: "from-orange-400 to-amber-500" },
  { id: "rubah", label: "Rubah Licik", bg: "from-rose-500 to-orange-500" },
  { id: "panda", label: "Panda Santuy", bg: "from-slate-600 to-zinc-800" },
  { id: "kodok", label: "Kodok Ngakak", bg: "from-emerald-400 to-green-600" },
  { id: "naga", label: "Naga Sakti", bg: "from-teal-500 to-cyan-600" },
  { id: "unicorn", label: "Kuda Pelangi", bg: "from-fuchsia-500 to-purple-600" },
  { id: "robot", label: "Robot Pintar", bg: "from-sky-500 to-blue-600" },
  { id: "alien", label: "Alien Gabut", bg: "from-violet-500 to-indigo-600" },
  { id: "macan", label: "Macan Garang", bg: "from-amber-500 to-yellow-600" },
  { id: "gurita", label: "Gurita Gesit", bg: "from-pink-500 to-rose-600" },
  { id: "hantu", label: "Hantu Lucu", bg: "from-indigo-400 to-purple-500" },
  { id: "api", label: "Si Paling Panas", bg: "from-red-500 to-orange-600" },
];

export const QUICK_EMOTES: string[] = [
  "Waduh!",
  "Ampun bang!",
  "Jangan +4 dong!",
  "Gas terus!",
  "Mantap!",
  "Ketar-ketir!",
];

export const BOT_PROFILES: Array<{ nickname: string; avatar: string }> = [
  { nickname: "Bot Budi", avatar: "robot" },
  { nickname: "Bot Siti", avatar: "kucing" },
  { nickname: "Bot Asep", avatar: "kodok" },
  { nickname: "Bot Rina", avatar: "unicorn" },
  { nickname: "Bot Joko", avatar: "macan" },
  { nickname: "Bot Nisa", avatar: "rubah" },
  { nickname: "Bot Dedi", avatar: "alien" },
];

export const RANDOM_NICKNAMES: string[] = [
  "SiPalingHoki",
  "RajaTumpuk",
  "SantuyAja",
  "Pawangkartu",
  "MabarTerus",
  "AntiKalah",
  "BangJago",
  "TukangBalik",
  "PencariWild",
  "BosKecil",
];

export const DEFAULT_CHAOS_SETTINGS: RoomSettings = {
  mode: "chaos",
  stacking: true,
  seven_zero: true,
  jump_in: true,
  z_cards: true,
};

export const DEFAULT_KLASIK_SETTINGS: RoomSettings = {
  mode: "klasik",
  stacking: false,
  seven_zero: false,
  jump_in: false,
  z_cards: false,
};

export const CARD_COLORS: CardColor[] = ["merah", "biru", "kuning", "hijau"];

export const COLOR_META: Record<
  CardColor,
  {
    name: string;
    symbolName: string;
    gradient: string;
    solid: string;
    ring: string;
    softBg: string;
    text: string;
    badgeBg: string;
  }
> = {
  merah: {
    name: "Merah",
    symbolName: "Bintang",
    gradient: "from-red-500 via-rose-500 to-red-600",
    solid: "bg-red-500",
    ring: "ring-red-400",
    softBg: "bg-red-500/15 border-red-500/40",
    text: "text-red-500 dark:text-red-400",
    badgeBg: "bg-red-600 text-white",
  },
  biru: {
    name: "Biru",
    symbolName: "Lingkaran",
    gradient: "from-blue-500 via-sky-500 to-blue-600",
    solid: "bg-blue-500",
    ring: "ring-blue-400",
    softBg: "bg-blue-500/15 border-blue-500/40",
    text: "text-blue-600 dark:text-blue-400",
    badgeBg: "bg-blue-600 text-white",
  },
  kuning: {
    name: "Kuning",
    symbolName: "Segitiga",
    gradient: "from-amber-400 via-yellow-400 to-amber-500",
    solid: "bg-amber-400",
    ring: "ring-amber-300",
    softBg: "bg-amber-500/15 border-amber-500/40",
    text: "text-amber-600 dark:text-amber-400",
    badgeBg: "bg-amber-500 text-slate-950",
  },
  hijau: {
    name: "Hijau",
    symbolName: "Kotak",
    gradient: "from-emerald-500 via-green-500 to-emerald-600",
    solid: "bg-emerald-500",
    ring: "ring-emerald-400",
    softBg: "bg-emerald-500/15 border-emerald-500/40",
    text: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-emerald-600 text-white",
  },
};

export function getCardDisplayName(value: CardValue): string {
  switch (value) {
    case "skip":
      return "Lewat";
    case "reverse":
      return "Putar Balik";
    case "draw2":
      return "Ambil 2";
    case "wild":
      return "Ganti Warna";
    case "wild4":
      return "Wild +4";
    case "z_swap":
      return "Z-Swap";
    case "z_shield":
      return "Z-Shield";
    default:
      return value;
  }
}

export function getAvatarById(id: string): AvatarOption {
  return AVATAR_OPTIONS.find((a) => a.id === id) ?? AVATAR_OPTIONS[0];
}
