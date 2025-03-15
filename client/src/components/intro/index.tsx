import React from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import Scene from './Scene';


export const InteractiveThreeSphere: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-[500px]"
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 40 }}>
        <Scene />
      </Canvas>
    </motion.div>
  );
};
