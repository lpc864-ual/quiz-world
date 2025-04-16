'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function IntroPage() {

  return (
    // Cielo nocturno estrellado
    <div className="min-h-screen bg-[url('/images/night-sky.png')] bg-cover flex flex-col items-center justify-center overflow-hidden">
      {/* Contenido con animación de fade in */}
      <div className="max-w-2xl flex flex-col items-center px-4 mx-auto">
        {/* Texto introductorio */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-white text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
             Let the Adventure Begin!
          </h2>
          <p className="text-lg md:text-xl leading-relaxed">
            Yo! Ready for a quick challenge? Take five minutes to explore the virtual world, then let’s turn that brainpower into 
            a game. Let’s see how much you really know about the world you live in!
          </p>
        </motion.div>
        
        {/* Botón "Are you ready?" */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <Link href="/explore">
            <motion.button
              className="relative px-10 py-4 rounded-full border-2 border-white bg-transparent group overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Fondo espacial dentro del botón */}
              <div className="absolute inset-0 bg-black opacity-50" />
              
              {/* Texto del botón */}
              <span className="relative z-10 text-white text-xl font-bold tracking-wider">
                 Ready to roll? Let’s dive in!
              </span>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}