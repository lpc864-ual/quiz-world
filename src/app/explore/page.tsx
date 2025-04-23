'use client';

import { useState, useEffect } from 'react';
//import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import GlobeView from '@/components/globe/globeView';
//import Timer from '@/components/ui/timer';

export default function ExplorePage() {
  //const router = useRouter();
  const [showGlobe, setShowGlobe] = useState(false);

  // Efecto para mostrar el globo con una animación de fade in
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGlobe(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Función que se ejecuta cuando finaliza el tiempo
  /*
  const handleTimeEnd = () => {
    // Redirigir a la página de introducción del quiz
    router.push('/quiz-intro');
  };
  */

  return (
    // Cielo nocturno estrellado
    <div className="min-h-screen bg-[url('/images/night-sky.png')] bg-cover relative flex items-center justify-center overflow-hidden">
      {/* Contenido */}
      <div className="relative z-10 flex flex-col items-center w-full h-screen">
        {/* Encabezado con el temporizador */}
        <div className="flex justify-between items-center w-full p-4 bg-opacity-50">
          <h2 className="text-white text-xl md:text-2xl font-semibold">
            Explore The World
          </h2>
          

          {/*<Timer 
            initialTime={300} // 5 minutos en segundos
            onTimeEnd={handleTimeEnd}
            className="text-xl"
          />*/}

        </div>
        
        {/* Instrucciones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 bg-opacity-70 p-4 rounded-lg max-w-md text-center"
        >
          <p className="text-white text-lg">
            Click on any country to learn about it. 
            <br />
            Explore as many as you can before the timer ends!
          </p>
        </motion.div>
        
        {/* Globo interactivo */}
        <motion.div 
          className="w-full flex-grow"
          initial={{ opacity: 0 }}
          animate={{ opacity: showGlobe ? 1 : 0 }}
          transition={{ duration: 1 }}
        >
          <GlobeView />
        </motion.div>
      </div>
    </div>
  );
}