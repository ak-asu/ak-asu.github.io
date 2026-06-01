import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TicTacToe } from '@/components/games/TicTacToe';
import { ColorTap } from '@/components/games/ColorTap';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAudioSystem } from '@/hooks/useAudioSystem';

const games = [
  { id: 'tictactoe', name: 'TIC TAC TOE', component: TicTacToe, description: 'Classic X vs O battle' },
  { id: 'colortap',  name: 'COLOR TAP',   component: ColorTap,  description: 'Test your reflexes' },
];

const NAV_BTN_STYLE: React.CSSProperties = {
  border: '1px solid rgba(196,145,2,0.6)',
  color: '#c49102',
  background: 'rgba(196,145,2,0.08)',
  padding: '8px 10px',
  cursor: 'pointer',
};

export const GamesSection = () => {
  const [activeGameIndex, setActiveGameIndex] = useState(0);
  const { playHover, playWhoosh } = useAudioSystem();

  const nextGame = () => { playWhoosh(); setActiveGameIndex(prev => (prev + 1) % games.length); };
  const prevGame = () => { playWhoosh(); setActiveGameIndex(prev => (prev - 1 + games.length) % games.length); };
  const ActiveGame = games[activeGameIndex].component;

  return (
    <section
      className="relative min-h-screen w-full flex flex-col items-center px-4 overflow-hidden"
      style={{ paddingTop: '72px', paddingBottom: '28px' }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-iron-red-dark/20 to-background pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-xl">
        {/* Cabinet */}
        <motion.div
          className="relative w-full"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {/* Gold outer frame */}
          <div
            className="absolute -inset-1 rounded-2xl"
            style={{ background: 'linear-gradient(135deg, hsl(44 98% 39%), hsl(44 98% 25%), hsl(44 98% 39%))', boxShadow: '0 0 18px hsl(44 98% 39% / 0.35)' }}
          />
          {/* Red inner frame */}
          <div
            className="absolute -inset-0.5 rounded-xl"
            style={{ background: 'linear-gradient(180deg, hsl(0 100% 20%), hsl(0 100% 12%))' }}
          />

          {/* Screen */}
          <div
            className="relative rounded-lg p-1 flex items-center justify-center"
            style={{
              height: '440px',
              background: 'linear-gradient(180deg, hsl(220 30% 8%), hsl(220 35% 5%))',
              border: '2px solid rgba(196,145,2,0.6)',
              boxShadow: 'inset 0 0 30px rgba(0,191,255,0.08), 0 0 12px rgba(0,0,0,0.45)',
            }}
          >
            <div className="absolute inset-0 rounded-lg pointer-events-none opacity-30" style={{ background: 'radial-gradient(ellipse at center, rgba(0,191,255,0.2) 0%, transparent 70%)' }} />
            <AnimatePresence mode="wait">
              <motion.div
                key={games[activeGameIndex].id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="relative z-10 w-full h-full flex items-center justify-center overflow-hidden"
              >
                <ActiveGame />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Navigation — clearly visible with solid gold border + background */}
        <motion.div
          className="flex items-center gap-3 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            onClick={prevGame}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,191,255,0.7)';
              (e.currentTarget as HTMLButtonElement).style.color = '#00bfff';
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,191,255,0.1)';
              playHover();
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(196,145,2,0.6)';
              (e.currentTarget as HTMLButtonElement).style.color = '#c49102';
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(196,145,2,0.08)';
            }}
            style={NAV_BTN_STYLE}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          <div className="px-4 text-center min-w-[140px]">
            <div className="font-orbitron text-sm text-arc-blue uppercase tracking-wider" style={{ textShadow: '0 0 6px hsl(195 100% 50%)' }}>
              {games[activeGameIndex].name}
            </div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', color: 'rgba(224,221,216,0.5)', marginTop: '2px' }}>
              {games[activeGameIndex].description}
            </div>
            <div className="flex justify-center gap-1 mt-2">
              {games.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: i === activeGameIndex ? '16px' : '5px',
                    height: '5px',
                    background: i === activeGameIndex ? '#00bfff' : 'rgba(196,145,2,0.4)',
                    boxShadow: i === activeGameIndex ? '0 0 6px #00bfff' : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          <motion.button
            onClick={nextGame}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,191,255,0.7)';
              (e.currentTarget as HTMLButtonElement).style.color = '#00bfff';
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,191,255,0.1)';
              playHover();
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(196,145,2,0.6)';
              (e.currentTarget as HTMLButtonElement).style.color = '#c49102';
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(196,145,2,0.08)';
            }}
            style={NAV_BTN_STYLE}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
