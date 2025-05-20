'use client';

import { motion } from 'framer-motion';

interface ScoreCounterProps {
  score: number;
  lastScoreChange: number;
}

export default function ScoreCounter({ score, lastScoreChange }: ScoreCounterProps) {

  return (
      <motion.div 
        className="text-xl md:text-2xl font-semibold pr-32"
        animate={{ 
          color: lastScoreChange == 0 ? '#ffffff' : lastScoreChange > 0 
              ? ['#ffffff', '#00ff00', '#ffffff'] 
              : ['#ffffff', '#ff0000', '#ffffff']
        }}
        transition={{ duration: 1.5 }}
      >
        Score: {score}
      </motion.div>
  );
}