import React, { Suspense } from "react";
import { SplashScreen } from "@/components/SplashScreen";
import { UnozApp } from "@/components/UnozApp";

export default function HomePage() {
  return (
    <Suspense
      fallback={<SplashScreen />}
    >
      <UnozApp />
    </Suspense>
  );
}
