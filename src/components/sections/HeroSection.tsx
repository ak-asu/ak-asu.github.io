import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef, useCallback, useState } from "react";
import { ArcReactor3D } from "@/components/ui/ArcReactor3D";
import { ActivityFeed } from "@/components/ui/ActivityFeed";
import { Github, Linkedin, Globe, Code } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAppStore } from "@/store/useAppStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import contactData from "@/data/contact.json";

const TECH_CHIPS = [
  { label: "LangChain", ai: true },
  { label: "RAG", ai: true },
  { label: "LLMs", ai: true },
  { label: "MCP", ai: true },
  { label: "Python", ai: false },
  { label: "Django", ai: false },
  { label: "React", ai: false },
  { label: "K8s", ai: false },
  { label: "FastAPI", ai: false },
  { label: "TypeScript", ai: false },
  { label: "AWS", ai: false },
];

const METRICS = [
  { val: "3+", label: "Yrs Exp", tag: "exp" },
  { val: "5x", label: "Hackathons", tag: "wins" },
  { val: "370+", label: "Live Users", tag: "reach" },
  { val: "35+", label: "Projects", tag: "proj" },
];

const TABLET_FEED = [
  { label: "1st Place", date: "Nov 2025", title: "HackASU - VisionForge" },
  { label: "Project", date: "Apr 2026", title: "CareCallerAI" },
  { label: "Project", date: "Apr 2026", title: "CloudForge" },
];

const SOCIALS = [
  { href: contactData.github, icon: Github, label: "GitHub" },
  { href: contactData.linkedin, icon: Linkedin, label: "LinkedIn" },
  { href: contactData.devpost, icon: Code, label: "Devpost" },
  { href: contactData.website, icon: Globe, label: "Website" },
];

function MetricGrid({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "grid grid-cols-2" : "flex"} style={{ gap: 0 }}>
      {METRICS.map((m, i) => (
        <div
          key={m.tag}
          className={`${compact ? "text-center" : "group flex-1 cursor-default"} relative px-3 py-2 lg:px-4 lg:py-3`}
          style={{
            border: "1px solid rgba(196,145,2,0.12)",
            borderRight:
              compact && i % 2 === 0
                ? "none"
                : i === METRICS.length - 1
                  ? "1px solid rgba(196,145,2,0.12)"
                  : compact
                    ? "1px solid rgba(196,145,2,0.12)"
                    : "none",
            borderBottom:
              compact && i < 2
                ? "none"
                : "1px solid rgba(196,145,2,0.12)",
            background: "rgba(5,8,18,0.5)",
            transition: "border-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(0,191,255,0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(196,145,2,0.12)";
          }}
        >
          {!compact && (
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "8px",
                color: "rgba(224,221,216,0.2)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                position: "absolute",
                top: "4px",
                right: "6px",
              }}
            >
              {m.tag}
            </div>
          )}
          <div
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: compact ? "20px" : "26px",
              fontWeight: 900,
              color: "#c49102",
              textShadow: "0 0 15px rgba(196,145,2,0.4)",
              lineHeight: 1,
            }}
          >
            {m.val}
          </div>
          <div
            style={{
              fontSize: compact ? "9px" : "10px",
              color: "rgba(224,221,216,0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginTop: "2px",
            }}
          >
            {m.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function SocialLinks({ centered = false }: { centered?: boolean }) {
  return (
    <div className={`flex gap-2 ${centered ? "justify-center" : ""}`}>
      {SOCIALS.map(({ href, icon: Icon, label }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex h-9 w-9 items-center justify-center transition-all duration-200"
          style={{
            border: "1px solid rgba(196,145,2,0.25)",
            background: "rgba(5,8,18,0.6)",
            color: "rgba(196,145,2,0.7)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(0,191,255,0.5)";
            e.currentTarget.style.color = "#00bfff";
            e.currentTarget.style.boxShadow = "0 0 12px rgba(0,191,255,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(196,145,2,0.25)";
            e.currentTarget.style.color = "rgba(196,145,2,0.7)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <Icon size={16} />
        </a>
      ))}
    </div>
  );
}

function DesktopLeftPanel({ prefersReduced }: { prefersReduced: boolean }) {
  return (
    <motion.div
      className="flex flex-col justify-center pr-6"
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.4 }}
    >
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(0,191,255,0.5)", letterSpacing: "0.25em", marginBottom: "8px" }}>
        <span style={{ color: "rgba(196,145,2,0.4)" }}>[</span> engineer - builder - ai{" "}
        <span style={{ color: "rgba(196,145,2,0.4)" }}>]</span>
      </div>
      <h1
        className={`font-orbitron font-black text-foreground mb-1 ${prefersReduced ? "" : "animate-glitch"}`}
        style={{ fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1, letterSpacing: "0.04em", textShadow: "0 0 40px rgba(196,145,2,0.2)" }}
      >
        AAKASH
      </h1>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "13px", fontWeight: 400, color: "rgba(196,145,2,0.7)", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "20px" }}>
        Khepar - Full-Stack - AI
      </div>
      <div className="mb-6 flex items-center gap-3">
        <div style={{ width: "3px", height: "24px", background: "#00bfff", boxShadow: "0 0 10px #00bfff", flexShrink: 0 }} />
        <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "20px", fontWeight: 600, color: "#00bfff", textShadow: "0 0 15px rgba(0,191,255,0.4)" }}>
          Software Engineer &amp; AI Builder
        </span>
      </div>
      <div className="mb-6"><MetricGrid /></div>
      <div className="mb-6 flex flex-wrap gap-1.5">
        {TECH_CHIPS.map((c) => (
          <span
            key={c.label}
            className="px-2.5 py-1 cursor-default transition-all duration-150"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", border: `1px solid ${c.ai ? "rgba(0,191,255,0.3)" : "rgba(196,145,2,0.25)"}`, color: c.ai ? "rgba(0,191,255,0.75)" : "rgba(196,145,2,0.6)", background: c.ai ? "rgba(0,191,255,0.04)" : "rgba(196,145,2,0.04)" }}
          >
            {c.label}
          </span>
        ))}
      </div>
      <div className="mb-8"><CtaButtons /></div>
      <SocialLinks />
    </motion.div>
  );
}

function DesktopCenterPanel({ prefersReduced, reactorX, reactorY, mouseX, mouseY }: {
  prefersReduced: boolean;
  reactorX: MotionValue<number>;
  reactorY: MotionValue<number>;
  mouseX: number;
  mouseY: number;
}) {
  return (
    <motion.div
      className="flex items-center justify-center"
      style={{ width: "280px", ...(prefersReduced ? {} : { x: reactorX, y: reactorY }) }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.6 }}
    >
      <div style={{ width: "280px", height: "280px" }}>
        <ArcReactor3D mouseX={mouseX} mouseY={mouseY} />
      </div>
    </motion.div>
  );
}

function DesktopActivityPanel() {
  return (
    <motion.div
      className="flex flex-col pl-6"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.5 }}
    >
      <div className="flex flex-1 flex-col" style={{ border: "1px solid rgba(196,145,2,0.12)", background: "rgba(3,5,12,0.7)", backdropFilter: "blur(8px)", maxHeight: "70vh", overflow: "hidden" }}>
        <ActivityFeed maxItems={7} />
      </div>
    </motion.div>
  );
}

function TabletLeftPanel() {
  return (
    <motion.div
      className="flex flex-col justify-center"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "rgba(0,191,255,0.5)", letterSpacing: "0.2em", marginBottom: "6px" }}>
        <span style={{ color: "rgba(196,145,2,0.4)" }}>[</span> engineer - builder - ai{" "}
        <span style={{ color: "rgba(196,145,2,0.4)" }}>]</span>
      </div>
      <h1 className="font-orbitron font-black text-foreground mb-1" style={{ fontSize: "36px", lineHeight: 1 }}>AAKASH</h1>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "11px", color: "rgba(196,145,2,0.7)", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "16px" }}>
        Khepar - Full-Stack - AI
      </div>
      <div className="mb-5 flex items-center gap-2">
        <div style={{ width: "3px", height: "20px", background: "#00bfff", boxShadow: "0 0 8px #00bfff" }} />
        <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "16px", fontWeight: 600, color: "#00bfff" }}>
          Software Engineer &amp; AI Builder
        </span>
      </div>
      <div className="mb-4"><MetricGrid compact /></div>
      <div className="mb-4"><CtaButtons compact /></div>
      <SocialLinks />
    </motion.div>
  );
}

function TabletFeedSection() {
  return (
    <div
      className="col-span-2 overflow-x-auto"
      style={{ borderTop: "1px solid rgba(196,145,2,0.1)", paddingTop: "12px" }}
    >
      <div className="flex gap-3" style={{ minWidth: "max-content" }}>
        {TABLET_FEED.map((item) => (
          <div
            key={item.title}
            className="p-3 shrink-0"
            style={{ width: "260px", border: "1px solid rgba(196,145,2,0.08)", background: "rgba(5,8,18,0.5)", fontSize: "11px" }}
          >
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", color: "rgba(0,191,255,0.75)", marginBottom: "4px" }}>
              {item.label} - {item.date}
            </div>
            <div style={{ color: "rgba(224,221,216,0.8)", fontFamily: "'Rajdhani', sans-serif", fontWeight: 500 }}>
              {item.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CtaButtons({ compact = false }: { compact?: boolean }) {
  const { setActiveSection, toggleChat } = useAppStore();

  return (
    <div className={`flex gap-3 ${compact ? "justify-center" : ""}`}>
      <button
        onClick={() => setActiveSection("projects")}
        className="btn-chamfer font-orbitron text-[10px] uppercase tracking-wider transition-all duration-200"
        style={{
          padding: compact ? "8px 20px" : "10px 24px",
          background:
            "linear-gradient(180deg, rgba(80,0,0,0.9), rgba(40,0,0,0.95))",
          border: "1px solid #c49102",
          color: "#c49102",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#00bfff";
          e.currentTarget.style.color = "#00bfff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#c49102";
          e.currentTarget.style.color = "#c49102";
        }}
      >
        View Projects
      </button>
      <button
        onClick={() => toggleChat()}
        className="btn-chamfer font-orbitron text-[10px] uppercase tracking-wider transition-all duration-200"
        style={{
          padding: compact ? "8px 20px" : "10px 24px",
          background: "rgba(0,191,255,0.05)",
          border: "1px solid rgba(0,191,255,0.4)",
          color: "rgba(0,191,255,0.8)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 0 20px rgba(0,191,255,0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        Contact
      </button>
    </div>
  );
}

export const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const prefersReduced = useReducedMotion();
  const [reactorMouse, setReactorMouse] = useState({ x: 0, y: 0 });

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springCfg = { damping: 28, stiffness: 140 };
  const mx = useSpring(rawX, springCfg);
  const my = useSpring(rawY, springCfg);

  // Parallax restricted to background grid and arc reactor only
  const bgX = useTransform(mx, [-0.5, 0.5], [-20, 20]);
  const bgY = useTransform(my, [-0.5, 0.5], [-20, 20]);
  const reactorX = useTransform(mx, [-0.5, 0.5], [-18, 18]);
  const reactorY = useTransform(my, [-0.5, 0.5], [-18, 18]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current || isMobile || prefersReduced) return;
      const rect = containerRef.current.getBoundingClientRect();
      const nextX = (e.clientX - rect.left) / rect.width - 0.5;
      const nextY = (e.clientY - rect.top) / rect.height - 0.5;
      rawX.set(nextX);
      rawY.set(nextY);
      setReactorMouse({ x: nextX, y: nextY });
    },
    [isMobile, prefersReduced, rawX, rawY],
  );

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative h-screen w-full overflow-hidden"
      style={{ paddingBottom: "28px" }}
    >
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        style={prefersReduced ? {} : { x: bgX, y: bgY }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(196,145,2,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(196,145,2,0.04) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-iron-red-dark/40 via-background to-iron-red-dark/20" />
      </motion.div>

      <div
        className="relative z-10 hidden h-full w-full lg:grid"
        style={{ gridTemplateColumns: "1fr auto 1fr", padding: "80px 40px 20px" }}
      >
        <DesktopLeftPanel prefersReduced={prefersReduced} />
        <DesktopCenterPanel
          prefersReduced={prefersReduced}
          reactorX={reactorX}
          reactorY={reactorY}
          mouseX={reactorMouse.x}
          mouseY={reactorMouse.y}
        />
        <DesktopActivityPanel />
      </div>

      <div
        className="relative z-10 hidden h-full w-full md:grid lg:hidden"
        style={{ gridTemplateColumns: "1fr 1fr", padding: "80px 24px 20px", gap: "24px" }}
      >
        <TabletLeftPanel />
        <motion.div
          className="flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div style={{ width: "220px", height: "220px" }}>
            <ArcReactor3D mouseX={0} mouseY={0} />
          </div>
        </motion.div>
        <TabletFeedSection />
      </div>

      <div className="relative z-10 flex h-full w-full flex-col gap-4 overflow-y-auto px-4 pt-20 pb-4 md:hidden">
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{
            opacity: 1,
            scale: 1,
            ...(prefersReduced ? {} : { y: [0, -8, 0] }),
          }}
          transition={{
            opacity: { duration: 0.6 },
            scale: { duration: 0.6 },
            ...(prefersReduced
              ? {}
              : { y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }),
          }}
        >
          <div style={{ width: "160px", height: "160px" }}>
            <ArcReactor3D mouseX={0} mouseY={0} />
          </div>
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1
            className="font-orbitron font-black text-foreground"
            style={{ fontSize: "28px", lineHeight: 1 }}
          >
            AAKASH KHEPAR
          </h1>
          <div
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "16px",
              fontWeight: 600,
              color: "#00bfff",
              marginTop: "8px",
            }}
          >
            Software Engineer &amp; AI Builder
          </div>
        </motion.div>

        <MetricGrid compact />
        <CtaButtons compact />
        <SocialLinks centered />
      </div>
    </section>
  );
};
