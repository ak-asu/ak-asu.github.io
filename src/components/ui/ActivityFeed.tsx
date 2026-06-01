type BadgeType = "hack" | "proj" | "work" | "edu";

interface FeedItem {
  badge: BadgeType;
  badgeLabel: string;
  title: string;
  subtitle: string;
  date: string;
}

const BADGE_COLORS: Record<BadgeType, string> = {
  hack: "rgba(0,200,100,0.8)",
  proj: "rgba(0,191,255,0.75)",
  work: "rgba(196,145,2,0.8)",
  edu: "rgba(176,136,255,0.8)",
};

const BADGE_BG: Record<BadgeType, string> = {
  hack: "rgba(0,200,100,0.08)",
  proj: "rgba(0,191,255,0.06)",
  work: "rgba(196,145,2,0.07)",
  edu: "rgba(176,136,255,0.07)",
};

const BADGE_BORDER: Record<BadgeType, string> = {
  hack: "rgba(0,200,100,0.3)",
  proj: "rgba(0,191,255,0.25)",
  work: "rgba(196,145,2,0.3)",
  edu: "rgba(176,136,255,0.25)",
};

const FEED: FeedItem[] = [
  {
    badge: "hack",
    badgeLabel: "1st Place",
    title: "HackASU 2025 - VisionForge",
    subtitle: "Drag-and-drop deep learning IDE w/ Gemini",
    date: "Nov 2025",
  },
  {
    badge: "proj",
    badgeLabel: "Project",
    title: "CareCallerAI",
    subtitle: "Multilingual AI phone triage w/ ElevenLabs + Groq",
    date: "Apr 2026",
  },
  {
    badge: "proj",
    badgeLabel: "Project",
    title: "CloudForge",
    subtitle: "5-agent LangGraph system to live AWS infra",
    date: "Apr 2026",
  },
  {
    badge: "hack",
    badgeLabel: "2nd Place",
    title: "Opportunity Hack Fall 2025 - NMTSA",
    subtitle: "Accessibility-first LMS + Best Polish Product",
    date: "Oct 2025",
  },
  {
    badge: "work",
    badgeLabel: "Work",
    title: "Graduate IA @ ASU",
    subtitle: "250 students - Data Visualization CSE 578",
    date: "Jan 2026-",
  },
  {
    badge: "hack",
    badgeLabel: "3rd Place",
    title: "IISE X 2025 - Elektraz",
    subtitle: "ML + MILP EV charging site optimizer",
    date: "Nov 2025",
  },
  {
    badge: "edu",
    badgeLabel: "Education",
    title: "MSCS @ Arizona State University",
    subtitle: "GPA 3.75 - 7x A+ grades - 2024-2026",
    date: "2024-2026",
  },
];

interface ActivityFeedProps {
  maxItems?: number;
}

export function ActivityFeed({ maxItems = 7 }: ActivityFeedProps) {
  const items = FEED.slice(0, maxItems);

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: "1px solid rgba(196,145,2,0.1)" }}
      >
        <span
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "9px",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "rgba(196,145,2,0.5)",
          }}
        >
          // Live Activity
        </span>
        <span
          className="ml-auto w-[5px] h-[5px] rounded-full"
          style={{
            background: "#00ff88",
            boxShadow: "0 0 6px #00ff88",
            animation: "glow-pulse 1.5s ease-in-out infinite",
          }}
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="p-3 transition-all duration-200 cursor-default"
            style={{
              border: "1px solid rgba(196,145,2,0.08)",
              background: "rgba(5,8,18,0.5)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(0,191,255,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(196,145,2,0.08)";
            }}
          >
            <div className="mb-1.5 flex items-center gap-2">
              <span
                className="px-1.5 py-0.5"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: BADGE_COLORS[item.badge],
                  background: BADGE_BG[item.badge],
                  border: `1px solid ${BADGE_BORDER[item.badge]}`,
                }}
              >
                {item.badgeLabel}
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "8px",
                  color: "rgba(224,221,216,0.2)",
                }}
              >
                {item.date}
              </span>
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "rgba(224,221,216,0.8)",
                lineHeight: 1.4,
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 500,
              }}
            >
              {item.title}
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "rgba(224,221,216,0.4)",
                lineHeight: 1.3,
                fontFamily: "'Rajdhani', sans-serif",
                marginTop: "2px",
              }}
            >
              {item.subtitle}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
