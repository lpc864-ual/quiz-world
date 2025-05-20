'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TimerProps {
  initialTime: number; 
  onTimeEnd: () => void;
  className?: string;
}

export default function Timer({ initialTime, onTimeEnd }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isWarning, setIsWarning] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    // Cambiar a color rojo cuando quedan 15 segundos
    if (timeLeft <= 15 && !isWarning) {
      setIsWarning(true);
      setIsPulsing(true);
    }

    if (timeLeft <= 0) {
      setIsPulsing(false)
      onTimeEnd();
      return;
    }

    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft, onTimeEnd, isWarning]);

  // Formatear el tiempo a MM:SS
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <motion.div 
      className={`text-xl md:text-2xl font-semibold ${isWarning ? 'text-red-500' : 'text-white'}`}
      animate={{
        scale: isPulsing ? [1, 1.1, 1] : 1,
      }}
      transition={{
        duration: 0.8,
        repeat: isPulsing ? Infinity : 0,
        repeatType: "loop"
      }}
    >
      {formatTime(timeLeft)}
    </motion.div>
  );
}