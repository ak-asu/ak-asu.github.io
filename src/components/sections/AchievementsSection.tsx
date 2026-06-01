import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Award, Trophy, Shield, FileText, Brain, type LucideIcon } from 'lucide-react';
import { ArcReactor } from '@/components/ui/ArcReactor';
import { useAudioSystem } from '@/hooks/useAudioSystem';
import achievementsDataRaw from '@/data/achievements.json';

interface Achievement {
  title: string; description: string; date: string; image: string; points: number; type: string;
}

const iconMap: Record<string, LucideIcon> = {
  recognition: Trophy, certification: Shield, course: FileText, workshop: Brain, hackathon: Award,
};

const typeColor: Record<string, string> = {
  recognition: '#c49102', certification: '#ff9f43', course: '#00bfff', workshop: '#b088ff', hackathon: '#00c864',
};

// Sort most recent first
const achievements = [...(achievementsDataRaw as Achievement[])].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

function AchievementCard({ ach }: { ach: Achievement }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const isHackathon = ach.type === 'hackathon';
  const color = typeColor[ach.type] ?? '#00bfff';
  const IconComponent = iconMap[ach.type] ?? Award;
  const dateStr = new Date(ach.date).getFullYear().toString();

  return (
    <motion.div
      className="relative overflow-hidden flex flex-col items-center justify-center text-center gap-2 cursor-default select-none"
      style={{
        minHeight: '160px',
        padding: '16px 12px',
        background: ach.image ? 'transparent' : 'rgba(5,8,18,0.7)',
        border: `${isHackathon ? 2 : 1}px solid ${isHackathon ? 'rgba(196,145,2,0.55)' : 'rgba(196,145,2,0.15)'}`,
        boxShadow: isHackathon ? '0 0 16px rgba(196,145,2,0.15)' : 'none',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      whileHover={{ scale: 1.03 }}
      onHoverStart={() => setShowTooltip(true)}
      onHoverEnd={() => setShowTooltip(false)}
    >
      {/* Background image */}
      {ach.image && (
        <>
          <div className="absolute inset-0">
            <img
              src={`${import.meta.env.BASE_URL}${ach.image.replace(/^\//, '')}`}
              alt=""
              className="w-full h-full object-cover"
              style={{ filter: 'brightness(0.5) saturate(0.7)' }}
            />
          </div>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(5,8,18,0.95) 0%, rgba(5,8,18,0.5) 60%, transparent 100%)' }} />
        </>
      )}

      {/* Date badge (top-right) */}
      <div className="absolute top-2 right-2 z-10" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', color: 'rgba(224,221,216,0.3)' }}>
        {dateStr}
      </div>

      {/* Icon (no image) */}
      {!ach.image && (
        <div className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center" style={{ background: `${color}15`, border: `1.5px solid ${color}60`, boxShadow: `0 0 12px ${color}30` }}>
          <IconComponent size={22} style={{ color }} />
        </div>
      )}

      {/* Title */}
      <p className="relative z-10 font-orbitron text-[10px] sm:text-xs text-arc-blue leading-tight line-clamp-3" style={{ maxWidth: '90%' }}>
        {ach.title}
      </p>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className="absolute inset-0 z-20 flex items-center justify-center p-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ background: 'rgba(5,8,18,0.92)', backdropFilter: 'blur(4px)' }}
          >
            <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', color: 'rgba(224,221,216,0.8)', textAlign: 'center', lineHeight: 1.45 }}>
              {ach.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export const AchievementsSection = () => {
  const [isRevealed, setIsRevealed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { playPowerUp, playHover } = useAudioSystem();

  // Auto-scroll bidirectional
  useEffect(() => {
    if (!isRevealed || !scrollRef.current) return;
    const el = scrollRef.current;
    let isAuto = true;
    let isProg = false;
    let dir: 'down' | 'up' = 'down';

    const interval = setInterval(() => {
      if (!isAuto) return;
      isProg = true;
      if (dir === 'down') {
        el.scrollTop += 1;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) dir = 'up';
      } else {
        el.scrollTop -= 1;
        if (el.scrollTop <= 4) dir = 'down';
      }
      setTimeout(() => { isProg = false; }, 10);
    }, 30);

    const pause = () => { isAuto = false; };
    const resume = (e: MouseEvent) => {
      if (!el.contains(e.target as Node)) { isAuto = true; }
    };
    el.addEventListener('wheel', pause, { passive: true });
    el.addEventListener('touchstart', pause, { passive: true });
    document.addEventListener('click', resume);

    return () => {
      clearInterval(interval);
      el.removeEventListener('wheel', pause);
      el.removeEventListener('touchstart', pause);
      document.removeEventListener('click', resume);
    };
  }, [isRevealed]);

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center" style={{ paddingBottom: '28px', paddingTop: '72px' }}>
      <div className="absolute inset-0 bg-gradient-to-b from-iron-red-dark/25 via-background to-iron-red-dark/25 pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col">
        {/* Curtain container */}
        <div className="relative" style={{ minHeight: '400px', height: '60vh' }}>
          {/* Grid — always rendered, behind curtains */}
          <div
            ref={scrollRef}
            className="absolute inset-0 overflow-y-auto p-4"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,191,255,0.2) transparent' }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {achievements.map((ach, i) => (
                <motion.div
                  key={ach.title}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={isRevealed ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.4 + i * 0.07, duration: 0.3 }}
                >
                  <AchievementCard ach={ach} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Curtains */}
          <AnimatePresence>
            {!isRevealed && (
              <>
                <motion.div
                  className="absolute top-0 left-0 w-1/2 h-full z-20"
                  initial={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ duration: 0.75, ease: 'easeInOut' }}
                  style={{ background: 'linear-gradient(90deg, hsl(44 90% 45%) 0%, hsl(44 98% 39%) 20%, hsl(0 100% 24%) 40%, hsl(0 100% 18%) 100%)', borderRight: '3px solid hsl(44 98% 50%)' }}
                >
                  <div className="absolute inset-0 opacity-25">
                    {[...Array(10)].map((_, i) => <div key={i} className="absolute w-full h-px bg-iron-gold/50" style={{ top: `${i * 10 + 5}%` }} />)}
                  </div>
                </motion.div>

                <motion.div
                  className="absolute top-0 right-0 w-1/2 h-full z-20"
                  initial={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ duration: 0.75, ease: 'easeInOut' }}
                  style={{ background: 'linear-gradient(270deg, hsl(44 90% 45%) 0%, hsl(44 98% 39%) 20%, hsl(0 100% 24%) 40%, hsl(0 100% 18%) 100%)', borderLeft: '3px solid hsl(44 98% 50%)' }}
                >
                  <div className="absolute inset-0 opacity-25">
                    {[...Array(10)].map((_, i) => <div key={i} className="absolute w-full h-px bg-iron-gold/50" style={{ top: `${i * 10 + 5}%` }} />)}
                  </div>
                </motion.div>

                {/* Reveal button */}
                <motion.button
                  onClick={() => { playPowerUp(); setIsRevealed(true); }}
                  onMouseEnter={playHover}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-3"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}>
                    <ArcReactor size={60} />
                  </motion.div>
                  <span className="font-orbitron text-xs text-arc-blue uppercase tracking-wider px-4 py-2 bg-background/80" style={{ border: '1px solid rgba(0,191,255,0.4)' }}>
                    Reveal Achievements
                  </span>
                </motion.button>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
