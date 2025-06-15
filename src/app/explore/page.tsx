"use client";

import { Suspense } from "react";
import ExplorePageContent from "./explorePageContent";

// Componente de loading para el suspense
function ExploreLoading() {
  return (
    <div className="relative min-w-full min-h-screen bg-[url('/images/night-sky.png')] bg-cover flex flex-col items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<ExploreLoading />}>
      <ExplorePageContent />
    </Suspense>
  );
}