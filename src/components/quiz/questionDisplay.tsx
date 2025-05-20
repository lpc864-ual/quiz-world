'use client';

import { motion } from 'framer-motion';

export default function QuestionDisplay({ question = "" }: { question?: string }) {
  return (
    <motion.div 
      className="p-4 md:p-6 max-w-3xl w-full mx-auto shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-white text-xl md:text-2xl font-semibold">
        {question}
      </h3>
      
      <div className="mt-4 text-gray-300 text-sm italic">
        Click on the globe to select the correct country
      </div>
    </motion.div>
  );
}