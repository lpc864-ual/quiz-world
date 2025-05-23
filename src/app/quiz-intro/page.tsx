'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function QuizIntroPage() {

  return (
    <div className="relative min-w-full min-h-screen bg-[url('/images/night-sky.png')] bg-cover flex flex-col items-center justify-center overflow-hidden">    
      {/* Contenido con animación de fade in */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 flex flex-col items-center max-w-2xl mx-auto px-4"
      >
        {/* Texto introductorio del quiz */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-white text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Time to Put Your Brain to the Test!
          </h2>
          <p className="text-lg md:text-xl leading-relaxed text-justify">
            Hope you had fun exploring, &apos;cause now things are about to get real! You&apos;ve got five minutes to crush as many questions as we can throw at.
          </p>
          <p className='text-lg md:text-xl leading-relaxed'>
            you
          </p>

          <p className="text-lg md:text-xl leading-relaxed mt-4 text-justify">
            Just click on the country you think is right. Nail it and you&apos;ll score 5 points, but mess up and we&apos;re taking 10 points away. No pressure, right?
          </p>
          <p className="text-lg md:text-xl leading-relaxed mt-4 font-bold">
            Ready to show off?
          </p>
        </motion.div>
        
        {/* Botón "Let's go" */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <Link href="/explore?isQuizMode=true">
            <motion.button
              className="relative px-10 py-4 rounded-full border-2 border-white bg-transparent group overflow-hidden cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Fondo espacial dentro del botón */}
              <div className="absolute inset-0 bg-black opacity-50" />
              
              {/* Texto del botón */}
              <span className="relative z-10 text-white text-xl font-bold tracking-wider">
                Let&apos;s do this!
              </span>
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}