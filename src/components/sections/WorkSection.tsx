import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { useAudioSystem } from '@/hooks/useAudioSystem';
import { formatPeriod, isCurrentlyActive } from '@/lib/dateUtils';
import workDataRaw from '@/data/work.json';

interface WorkEntry {
  position: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string[];
  technologies: string[];
  links: { title: string; url: string; type: string }[];
  type: string;
}

const workData = (workDataRaw as WorkEntry[]).map((w, i) => ({
  id: i,
  role: w.position,
  company: w.company,
  location: w.location,
  period: formatPeriod(w.startDate, w.endDate),
  highlights: w.description,
  tech: w.technologies,
  links: w.links,
  active: isCurrentlyActive(w.endDate),
}));

// Highlight percentage/number metrics in gold
function HighlightedBullet({ text }: { text: string }) {
  const parts = text.split(/(\d+(?:\.\d+)?[%×+]?(?:\s+\w+)?)/g);
  return (
    <span>
      {parts.map((part, i) =>
        /^\d/.test(part) ? (
          <span key={i} className="metric-highlight">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

export const WorkSection = () => {
  const [selectedId, setSelectedId] = useState(0);
  const { playClick, playHover } = useAudioSystem();
  const selected = workData[selectedId];

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex flex-col" style={{ paddingBottom: '28px', paddingTop: '72px' }}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-arc-blue/3 to-background pointer-events-none" />
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,191,255,0.018) 2px, rgba(0,191,255,0.018) 4px)' }} />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col flex-1">
        {/* Desktop: two-panel layout */}
        <div className="hidden md:flex flex-1 gap-6">
          {/* Left: timeline list — scrollable so all entries are reachable */}
          <div className="w-56 shrink-0 flex flex-col gap-1 pt-2 overflow-y-auto" style={{ borderLeft: '1px solid rgba(196,145,2,0.15)', paddingLeft: '16px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(196,145,2,0.2) transparent' }}>
            {workData.map(w => (
              <button
                key={w.id}
                onClick={() => { playClick(); setSelectedId(w.id); }}
                onMouseEnter={playHover}
                className="text-left py-2.5 px-2 transition-all duration-200 relative"
                style={{
                  borderLeft: `2px solid ${selectedId === w.id ? '#00bfff' : 'transparent'}`,
                  marginLeft: '-17px',
                  paddingLeft: '15px',
                  background: selectedId === w.id ? 'rgba(0,191,255,0.04)' : 'transparent',
                }}
              >
                {w.active && (
                  <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: '0 0 6px #4ade80', animation: 'glow-pulse 1.5s ease-in-out infinite' }} />
                )}
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: selectedId === w.id ? '#00bfff' : 'rgba(196,145,2,0.5)', marginBottom: '2px' }}>
                  {w.period}
                </div>
                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', fontWeight: 500, color: selectedId === w.id ? '#e0ddd8' : 'rgba(224,221,216,0.7)' }}>
                  {w.company}
                </div>
                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', color: 'rgba(224,221,216,0.35)' }}>
                  {w.location}
                </div>
              </button>
            ))}
          </div>

          {/* Right: detail card */}
          <div className="flex-1 min-w-0">
            <motion.div
              key={selectedId}
              className="border-trace h-full"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              style={{ background: 'rgba(5,8,18,0.7)', border: '1px solid rgba(0,191,255,0.15)', padding: '20px', position: 'relative' }}
            >
              {/* Card header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '16px', fontWeight: 700, color: '#e0ddd8', lineHeight: 1.2 }}>{selected.role}</h3>
                  <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '14px', color: '#c49102', marginTop: '2px' }}>{selected.company}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(0,191,255,0.6)', marginTop: '3px' }}>{selected.period}</div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {selected.active && (
                    <div className="flex items-center gap-1.5 px-2 py-1" style={{ border: '1px solid rgba(0,191,255,0.4)', background: 'rgba(0,191,255,0.08)' }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-arc-blue animate-pulse" style={{ boxShadow: '0 0 6px #00bfff' }} />
                      <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#00bfff', textTransform: 'uppercase', letterSpacing: '0.15em' }}>ACTIVE</span>
                    </div>
                  )}
                  {selected.links.map(l => (
                    <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 transition-colors duration-150"
                      style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(0,191,255,0.5)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#00bfff'}
                      onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(0,191,255,0.5)'}
                    >
                      <ExternalLink size={10} /> {l.title}
                    </a>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,191,255,0.3), transparent)', margin: '0 0 12px' }} />

              {/* Bullets with scroll */}
              <ul className="space-y-2 overflow-y-auto" style={{ maxHeight: '52vh', scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,191,255,0.25) transparent' }}>
                {selected.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '14px', color: 'rgba(224,221,216,0.78)', lineHeight: 1.55 }}>
                    <span style={{ color: '#00bfff', fontSize: '16px', flexShrink: 0 }}>▸</span>
                    <HighlightedBullet text={h} />
                  </li>
                ))}
              </ul>

              {/* Tech chips */}
              {selected.tech.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4 pt-3" style={{ borderTop: '1px solid rgba(196,145,2,0.1)' }}>
                  {selected.tech.map(t => (
                    <span key={t} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', padding: '2px 8px', border: '1px solid rgba(196,145,2,0.2)', color: 'rgba(196,145,2,0.55)', background: 'rgba(196,145,2,0.04)' }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Mobile: horizontal strip + card below */}
        <div className="md:hidden flex flex-col flex-1 gap-4">
          {/* Horizontal scroll company strip */}
          <div className="overflow-x-auto pb-1" style={{ borderBottom: '1px solid rgba(196,145,2,0.1)' }}>
            <div className="flex gap-2" style={{ minWidth: 'max-content', padding: '4px 0' }}>
              {workData.map(w => (
                <button
                  key={w.id}
                  onClick={() => { playClick(); setSelectedId(w.id); }}
                  className="btn-chamfer px-3 py-1.5 shrink-0 transition-all duration-200"
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em',
                    border: `1px solid ${selectedId === w.id ? 'rgba(0,191,255,0.5)' : 'rgba(196,145,2,0.2)'}`,
                    color: selectedId === w.id ? '#00bfff' : 'rgba(196,145,2,0.6)',
                    background: selectedId === w.id ? 'rgba(0,191,255,0.08)' : 'rgba(5,8,18,0.5)',
                  }}
                >
                  {w.company}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile detail card */}
          <motion.div
            key={`mob-${selectedId}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="border-trace flex-1"
            style={{ background: 'rgba(5,8,18,0.7)', border: '1px solid rgba(0,191,255,0.15)', padding: '16px', position: 'relative' }}
          >
            <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '13px', fontWeight: 700, color: '#e0ddd8', marginBottom: '2px' }}>{selected.role}</h3>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', color: '#c49102', marginBottom: '2px' }}>{selected.company} · {selected.location}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(0,191,255,0.6)', marginBottom: '10px' }}>{selected.period}</div>
            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,191,255,0.3), transparent)', marginBottom: '10px' }} />
            <ul className="space-y-2 overflow-y-auto" style={{ maxHeight: '38vh', scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,191,255,0.25) transparent' }}>
              {selected.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-1.5" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', color: 'rgba(224,221,216,0.75)', lineHeight: 1.5 }}>
                  <span style={{ color: '#00bfff', flexShrink: 0 }}>▸</span>
                  <HighlightedBullet text={h} />
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
