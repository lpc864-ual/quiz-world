'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TimerProps {
  initialTime: number; // tiempo en segundos
  onTimeEnd: () => void;
  className?: string;
}

export default function Timer({ initialTime, onTimeEnd, className = '' }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isWarning, setIsWarning] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeEnd();
      return;
    }

    // Cambiar a color rojo cuando quedan 15 segundos
    if (timeLeft <= 15 && !isWarning) {
      setIsWarning(true);
      setIsPulsing(true);
      
      // Detener la pulsación después de 3 segundos
      setTimeout(() => {
        setIsPulsing(false);
      }, 3000);
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
      className={`font-mono text-2xl md:text-3xl font-bold ${isWarning ? 'text-red-500' : 'text-white'} ${className}`}
      animate={{
        scale: isPulsing ? [1, 1.1, 1] : 1,
      }}
      transition={{
        duration: 0.8,
        repeat: isPulsing ? 3 : 0,
        repeatType: "loop"
      }}
    >
      {formatTime(timeLeft)}
    </motion.div>
  );
}