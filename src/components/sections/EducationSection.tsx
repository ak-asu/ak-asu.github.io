import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import educationDataRaw from '@/data/education.json';

interface Subject { name: string; grade: string; }
interface Education {
  degree: string; field: string; institution: string;
  image: string; subjects: Subject[]; gpa: number;
  startDate: number; endDate: number;
}

const education = educationDataRaw as Education[];

function GradeBadge({ grade }: { grade: string }) {
  const color = grade === 'A+' ? '#c49102' : grade === 'A' ? '#00bfff' : 'rgba(224,221,216,0.4)';
  const bg    = grade === 'A+' ? 'rgba(196,145,2,0.12)' : grade === 'A' ? 'rgba(0,191,255,0.1)' : 'rgba(224,221,216,0.05)';
  return (
    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', padding: '2px 7px', border: `1px solid ${color}50`, color, background: bg }}>
      {grade}
    </span>
  );
}

function EducationCard({ edu }: { edu: Education }) {
  const [coursesOpen, setCoursesOpen] = useState(false);

  return (
    <div
      className="flex-1 min-w-0 flex flex-col border-trace"
      style={{ background: 'rgba(5,8,18,0.7)', border: '1px solid rgba(196,145,2,0.15)', padding: '24px', position: 'relative', minHeight: '360px' }}
    >
      {/* Institution image */}
      {edu.image && (
        <div className="mb-4 overflow-hidden" style={{ height: '70px', border: '1px solid rgba(196,145,2,0.1)' }}>
          <img src={`${import.meta.env.BASE_URL}${edu.image.replace(/^\//, '')}`} alt={edu.institution} className="w-full h-full object-cover" style={{ filter: 'brightness(0.85) saturate(0.9)' }} />
        </div>
      )}

      {/* Degree + field */}
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: 'rgba(224,221,216,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '3px' }}>
        {edu.degree}
      </div>
      <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '17px', fontWeight: 700, color: '#e0ddd8', lineHeight: 1.2, marginBottom: '4px' }}>
        {edu.field}
      </h3>
      <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '14px', color: 'rgba(196,145,2,0.7)', marginBottom: '16px' }}>
        {edu.institution}
      </div>

      {/* GPA */}
      <div className="mb-4">
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(224,221,216,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '4px' }}>GPA</div>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '38px', fontWeight: 900, color: '#c49102', textShadow: '0 0 20px rgba(196,145,2,0.4)', lineHeight: 1 }}>
          {edu.gpa.toFixed(2)}
        </div>
      </div>

      {/* Timeline bar */}
      <div className="flex items-center gap-3 mb-4">
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'rgba(0,191,255,0.6)' }}>{edu.startDate}</span>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(0,191,255,0.4), rgba(196,145,2,0.4))' }} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'rgba(0,191,255,0.6)' }}>{edu.endDate}</span>
      </div>

      {/* Courses collapsible */}
      {edu.subjects.length > 0 && (
        <div>
          <button
            onClick={() => setCoursesOpen(!coursesOpen)}
            className="flex items-center gap-2 w-full transition-colors duration-150"
            style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.15em', color: coursesOpen ? '#00bfff' : 'rgba(196,145,2,0.5)', marginBottom: '8px' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#00bfff'; }}
            onMouseLeave={e => { if (!coursesOpen) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(196,145,2,0.5)'; }}
          >
            <span>{coursesOpen ? '▼' : '▶'}</span>
            Courses ({edu.subjects.length})
          </button>

          <AnimatePresence>
            {coursesOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: 'hidden' }}
              >
                <div
                  className="flex flex-col gap-1.5 overflow-y-auto"
                  style={{ maxHeight: '220px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,191,255,0.2) transparent' }}
                >
                  {edu.subjects.map(s => (
                    <div key={s.name} className="flex items-center justify-between gap-3" style={{ padding: '5px 8px', background: 'rgba(5,8,18,0.5)', border: '1px solid rgba(196,145,2,0.07)' }}>
                      <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', color: 'rgba(224,221,216,0.65)', flex: 1 }}>{s.name}</span>
                      <GradeBadge grade={s.grade} />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export const EducationSection = () => (
  <section className="relative min-h-screen w-full overflow-hidden flex flex-col" style={{ paddingBottom: '28px', paddingTop: '72px' }}>
    <div className="absolute inset-0 bg-gradient-to-b from-iron-red-dark/20 via-background to-iron-red-dark/20 pointer-events-none" />
    <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 flex flex-col flex-1">
      <div className="flex flex-col md:flex-row gap-6 flex-1">
        {education.map(edu => (
          <EducationCard key={edu.institution} edu={edu} />
        ))}
      </div>
    </div>
  </section>
);
