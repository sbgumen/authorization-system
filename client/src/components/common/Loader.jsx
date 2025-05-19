import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ size = 40, color = 'text-blue-500' }) => {
  return (
    <div className="flex justify-center items-center">
      <motion.div
        className={`${color} inline-block`}
        animate={{
          scale: [1, 1.5, 1.5, 1, 1],
          rotate: [0, 0, 270, 270, 0],
          borderRadius: ["20%", "20%", "50%", "50%", "20%"],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          times: [0, 0.2, 0.5, 0.8, 1],
          repeat: Infinity,
          repeatDelay: 0
        }}
        style={{
          width: size,
          height: size,
          border: '3px solid currentColor',
          borderBottomColor: 'transparent',
        }}
      />
    </div>
  );
};

export default Loader;