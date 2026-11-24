import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "unoZ — Main Kartu Mabar Seru",
    short_name: "unoZ",
    description:
      "Permainan kartu multiplayer mobile-first dengan mode Klasik, Chaos / Mabar, dan Kartu Spesial Z.",
    start_url: "/",
    display: "standalone",
    background_color: "#090d1a",
    theme_color: "#090d1a",
    icons: [
      {
        src: "/unoz-logo.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
