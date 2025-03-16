import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Terminal } from '@/components/Terminal';
import { NonTechnical } from '@/components/NonTechnical';
import type { RootState } from '@/store/store';
import ChatWindow from '@/components/chat/ChatWindow';

export const Home = () => {
  const isTechnicalMode = useSelector((state: RootState) => state.mode.isTechnicalMode);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-16"
    >
      {isTechnicalMode ? <Terminal /> : <NonTechnical />}
      <ChatWindow />
    </motion.div>
  );
};
