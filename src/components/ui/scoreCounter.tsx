"use client";

import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

interface ScoreCounterProps {
  score: number;
  lastScoreChange: number;
}

export default function ScoreCounter({score, lastScoreChange}: ScoreCounterProps) {
  const controls = useAnimation();

  // Efecto que se ejecuta cada vez que cambia el score
  useEffect(() => {
    if (lastScoreChange !== 0) {
      // Determinar el color basado en lastScoreChange
      const targetColor = lastScoreChange > 0 ? "#00ff00" : "#ff0000";

      // Secuencia de animación fluida
      const animateColor = async () => {
        await controls.start({
          color: targetColor,
          transition: { duration: 0.3 },
        });
        await controls.start({
          color: "#ffffff",
          transition: { duration: 1.2 },
        });
      };

      animateColor();
    }
  }, [lastScoreChange, controls]); // Dependemos del score para que se ejecute cada vez

  return (
    <motion.div
      className="text-xl md:text-2xl font-semibold pr-22"
      initial={{ color: "#ffffff" }}
      animate={controls}
    >
      Score: {score}
    </motion.div>
  );
}
