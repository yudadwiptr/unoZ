import React, { Suspense } from "react";
import { UnozApp } from "@/components/UnozApp";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex flex-col items-center justify-center gap-3 bg-slate-950 text-slate-100">
          <div className="w-10 h-10 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
          <p className="font-bold text-sm">Memuat unoZ...</p>
        </div>
      }
    >
      <UnozApp />
    </Suspense>
  );
}
