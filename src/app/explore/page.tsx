"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import GlobeView from "@/components/globe/globeView";
import Timer from "@/components/ui/timer";

export default function ExplorePage() {
  const router = useRouter();

  // Función que se ejecuta cuando finaliza el tiempo
  const handleTimeEnd = () => {
    // Redirigir a la página de introducción del quiz
    router.push("/quiz-intro");
  };

  return (
    // Cielo nocturno estrellado
    <div className="relative min-w-full min-h-screen bg-[url('/images/night-sky.png')] bg-cover flex flex-col items-center justify-center overflow-hidden">
      {/* Encabezado con el temporizador */}
      <div className="w-full flex items-center justify-between p-4">
        <h2 className="text-white text-xl md:text-2xl font-semibold">
          Explore The World
        </h2>

        <Timer
          initialTime={300} // 5 minutos en segundos
          onTimeEnd={handleTimeEnd}
        />
      </div>

      {/* Instrucciones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="absolute top-20 left-1/2 transform -translate-x-1/2 max-w-md p-4 text-center"
      >
        <p className="text-white text-lg">
          Click on any country to learn about it.
          <br />
          Explore as many as you can before the timer ends!
        </p>
      </motion.div>

      {/* Globo interactivo */}
      <GlobeView />
    </div>
  );
}
