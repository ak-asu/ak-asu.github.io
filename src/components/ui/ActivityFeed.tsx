import { useEffect, useRef } from 'react';

type BadgeType = 'hack' | 'proj' | 'work' | 'edu';

interface FeedItem {
  badge: BadgeType;
  badgeLabel: string;
  title: string;
  subtitle: string;
  date: string;
}

const BADGE_COLORS: Record<BadgeType, string> = {
  hack: 'rgba(0,200,100,0.8)',
  proj: 'rgba(0,191,255,0.75)',
  work: 'rgba(196,145,2,0.8)',
  edu:  'rgba(176,136,255,0.8)',
};
const BADGE_BG: Record<BadgeType, string> = {
  hack: 'rgba(0,200,100,0.08)',
  proj: 'rgba(0,191,255,0.06)',
  work: 'rgba(196,145,2,0.07)',
  edu:  'rgba(176,136,255,0.07)',
};
const BADGE_BORDER: Record<BadgeType, string> = {
  hack: 'rgba(0,200,100,0.3)',
  proj: 'rgba(0,191,255,0.25)',
  work: 'rgba(196,145,2,0.3)',
  edu:  'rgba(176,136,255,0.25)',
};

const FEED: FeedItem[] = [
  { badge: 'hack', badgeLabel: '1st Place', title: 'HackASU 2025 — VisionForge',        subtitle: 'Drag-and-drop deep learning IDE w/ Gemini',            date: 'Nov 2025' },
  { badge: 'proj', badgeLabel: 'Project',   title: 'CareCallerAI',                      subtitle: 'Multilingual AI phone triage w/ ElevenLabs + Groq',    date: 'Apr 2026' },
  { badge: 'proj', badgeLabel: 'Project',   title: 'CloudForge',                        subtitle: '5-agent LangGraph system → live AWS infra',            date: 'Apr 2026' },
  { badge: 'hack', badgeLabel: '2nd Place', title: 'Opportunity Hack Fall 2025 — NMTSA', subtitle: 'Accessibility-first LMS + Best Polish Product',       date: 'Oct 2025' },
  { badge: 'work', badgeLabel: 'Work',      title: 'Graduate IA @ ASU',                 subtitle: '250 students · Data Visualization CSE 578',            date: 'Jan 2026–' },
  { badge: 'hack', badgeLabel: '3rd Place', title: 'IISE X 2025 — Elektraz',            subtitle: 'ML + MILP EV charging site optimizer',                 date: 'Nov 2025' },
  { badge: 'edu',  badgeLabel: 'Education', title: 'MSCS @ Arizona State University',   subtitle: 'GPA 3.9 · 7× A+ grades · 2024–2026',                  date: '2024–2026' },
];

function FeedCard({ item }: { item: FeedItem }) {
  return (
    <div
      className="p-3 shrink-0 transition-all duration-200 cursor-default"
      style={{ border: '1px solid rgba(196,145,2,0.08)', background: 'rgba(5,8,18,0.5)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,191,255,0.2)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(196,145,2,0.08)'; }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="px-1.5 py-0.5"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: BADGE_COLORS[item.badge],
            background: BADGE_BG[item.badge],
            border: `1px solid ${BADGE_BORDER[item.badge]}`,
          }}
        >
          {item.badgeLabel}
        </span>
        <span style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', color: 'rgba(224,221,216,0.2)' }}>
          {item.date}
        </span>
      </div>
      <div style={{ fontSize: '11px', color: 'rgba(224,221,216,0.8)', lineHeight: 1.4, fontFamily: "'Rajdhani', sans-serif", fontWeight: 500 }}>
        {item.title}
      </div>
      <div style={{ fontSize: '10px', color: 'rgba(224,221,216,0.4)', lineHeight: 1.3, fontFamily: "'Rajdhani', sans-serif", marginTop: '2px' }}>
        {item.subtitle}
      </div>
    </div>
  );
}

interface ActivityFeedProps {
  maxItems?: number;
}

export function ActivityFeed({ maxItems = 7 }: ActivityFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const items = FEED.slice(0, maxItems);
  // Duplicate for seamless loop
  const loopedItems = [...items, ...items];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let paused = false;
    let animId: number;

    const scroll = () => {
      if (!paused) {
        el.scrollTop += 0.5;
        // When we've scrolled past the first copy, jump back silently
        if (el.scrollTop >= el.scrollHeight / 2) {
          el.scrollTop = 0;
        }
      }
      animId = requestAnimationFrame(scroll);
    };

    // Start after a short delay so initial render is visible
    const timer = setTimeout(() => { animId = requestAnimationFrame(scroll); }, 1200);

    const pause = () => { paused = true; };
    const resume = () => { paused = false; };
    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', resume);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animId);
      el.removeEventListener('mouseenter', pause);
      el.removeEventListener('mouseleave', resume);
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(196,145,2,0.1)' }}>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(196,145,2,0.5)' }}>
          // Live Activity
        </span>
        <span
          className="ml-auto w-[5px] h-[5px] rounded-full"
          style={{ background: '#00ff88', boxShadow: '0 0 6px #00ff88', animation: 'glow-pulse 1.5s ease-in-out infinite' }}
        />
      </div>

      {/* Scrolling feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 flex flex-col gap-2"
        style={{ scrollbarWidth: 'none' }}
      >
        {loopedItems.map((item, i) => (
          <FeedCard key={`${i}-${item.title}`} item={item} />
        ))}
      </div>
    </div>
  );
}
