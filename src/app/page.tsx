'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    // Cielo nocturno estrellado
    <div className="min-h-screen bg-[url('/images/night-sky.png')] bg-cover relative flex items-center justify-center overflow-hidden">
      {/* Contenido con animación de fade in */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="flex flex-col items-center"
      >
        <h1 className="text-white font-bold text-4xl md:text-6xl text-center mb-8">
          QuizWorld
        </h1>
        
        {/* Botón de inicio con borde blanco */}
        <Link href="/intro">
          <motion.button
            className="rounded-full border-2 border-white bg-transparent overflow-hidden px-10 py-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Texto del botón */}
            <span className=" text-white font-bold text-2xl tracking-wider cursor-pointer">
              START!
            </span>
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}