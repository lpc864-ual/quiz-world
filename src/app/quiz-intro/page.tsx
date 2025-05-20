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
            Now, Let&apos;s Test Your Knowledge!
            </h2>
          <p className="text-lg md:text-xl leading-relaxed">
            I hope you explored the world enough, because now we are going to challenge your knowledge. 
            You will have five minutes to answer all the questions we are going to give you.
          </p>
          <p className="text-lg md:text-xl leading-relaxed mt-4">
            Click over the country you think is the correct answer. Each correct answer will add five 
            points to your score, but each incorrect answer will subtract ten points.
          </p>
          <p className="text-lg md:text-xl leading-relaxed mt-4 font-bold">
            Good luck!
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
              className="relative px-10 py-4 rounded-full border-2 border-white bg-transparent group overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Fondo espacial dentro del botón */}
              <div className="absolute inset-0 bg-black opacity-50" />
              
              {/* Texto del botón */}
              <span className="relative z-10 text-white text-xl font-bold tracking-wider">
                Let&apos;s go!
              </span>
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}