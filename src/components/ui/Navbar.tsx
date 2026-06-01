import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useEffect, useState, type CSSProperties } from "react";
import { useAudioSystem } from "@/hooks/useAudioSystem";
import {
  Monitor,
  Layers,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

type Section =
  | "home"
  | "skills"
  | "projects"
  | "work"
  | "education"
  | "achievements"
  | "games";

const navItems: { id: Section; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "work", label: "Work" },
  { id: "education", label: "Education" },
  { id: "achievements", label: "Achievements" },
  { id: "games", label: "Games" },
];

export const Navbar = () => {
  const {
    activeSection,
    setActiveSection,
    viewMode,
    toggleViewMode,
    soundEnabled,
    toggleSound,
    animationEnabled,
    toggleAnimation,
  } = useAppStore();
  const { playClick, playHover, playToggle } = useAudioSystem();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as Section;
    if (hash && navItems.some((i) => i.id === hash)) setActiveSection(hash);

    const handleHash = () => {
      const h = window.location.hash.replace("#", "") as Section;
      if (h && navItems.some((i) => i.id === h)) setActiveSection(h);
    };

    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [setActiveSection]);

  const ctrlBtnClass = (active: boolean) =>
    `w-[26px] h-[26px] flex items-center justify-center border transition-all duration-200 btn-chamfer cursor-pointer ${
      active
        ? "border-arc-blue/60 text-arc-blue bg-arc-blue/10"
        : "border-iron-gold/25 text-iron-gold/60 hover:border-arc-blue/50 hover:text-arc-blue"
    }`;

  const navInnerStyle: CSSProperties = {
    background:
      "linear-gradient(180deg, rgba(100,0,0,0.45) 0%, rgba(40,0,0,0.7) 100%)",
    border: "1px solid rgba(196,145,2,0.35)",
    borderRadius: "8px",
    boxShadow:
      "0 0 20px rgba(196,145,2,0.12), inset 0 1px 0 rgba(255,220,80,0.15)",
  };

  return (
    <motion.nav
      className="fixed top-0 right-0 left-0 z-50 flex items-center justify-center px-2 py-2 sm:px-4 sm:py-3"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {isMobile ? (
        <div
          className="flex w-full max-w-full items-center justify-between gap-2 px-2 py-2"
          style={navInnerStyle}
        >
          <button
            onClick={() => {
              playClick();
              setActiveSection("home");
            }}
            className="flex items-center gap-1.5 px-2 py-1"
          >
            <div
              className="w-2 h-2 rounded-full bg-arc-blue animate-pulse"
              style={{ boxShadow: "0 0 8px hsl(195 100% 50%)" }}
            />
            <span className="font-orbitron text-xs font-black text-iron-gold uppercase tracking-wider">
              AK
            </span>
          </button>

          <div className="flex items-center gap-1">
            {[
              {
                active: viewMode === "terminal",
                icon: viewMode === "terminal" ? Monitor : Layers,
                fn: () => {
                  playToggle();
                  toggleViewMode();
                },
                title: "Toggle Terminal",
              },
              {
                active: soundEnabled,
                icon: soundEnabled ? Volume2 : VolumeX,
                fn: () => {
                  playClick();
                  toggleSound();
                },
                title: "Toggle Sound",
              },
              {
                active: animationEnabled,
                icon: animationEnabled ? Sparkles : Zap,
                fn: () => {
                  playClick();
                  toggleAnimation();
                },
                title: "Toggle Animations",
              },
            ].map(({ active, icon: Icon, fn, title }) => (
              <motion.button
                key={title}
                onClick={fn}
                onMouseEnter={playHover}
                className={ctrlBtnClass(active)}
                whileTap={{ scale: 0.95 }}
                title={title}
              >
                <Icon size={13} />
              </motion.button>
            ))}
            <div className="w-px h-5 bg-iron-gold/20 mx-1" />
            <motion.button
              onClick={() => {
                playClick();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              onMouseEnter={playHover}
              className="p-1.5 text-iron-gold hover:text-arc-blue transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </motion.button>
          </div>

          {mobileMenuOpen && (
            <motion.div
              className="absolute top-full right-0 left-0 mx-2 mt-2 flex flex-col gap-1 p-2"
              style={{ ...navInnerStyle, borderRadius: "6px" }}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {navItems
                .filter((i) => i.id !== "home")
                .map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => {
                      playClick();
                      setActiveSection(item.id);
                      setMobileMenuOpen(false);
                    }}
                    onMouseEnter={playHover}
                    className={`relative px-3 py-2 font-orbitron text-xs uppercase tracking-wider rounded transition-all duration-200 text-left ${
                      activeSection === item.id
                        ? "bg-arc-blue/15 text-arc-blue border border-arc-blue/40"
                        : "text-iron-gold hover:text-arc-blue hover:bg-iron-gold/8"
                    }`}
                    whileTap={{ scale: 0.97 }}
                  >
                    {item.label}
                    {activeSection === item.id && (
                      <motion.div
                        layoutId="mobileNavIndicator"
                        className="absolute right-2 bottom-0 left-2 h-[2px] bg-arc-blue"
                        style={{ boxShadow: "0 0 6px hsl(195 100% 50%)" }}
                      />
                    )}
                  </motion.button>
                ))}
            </motion.div>
          )}
        </div>
      ) : (
        <div
          className="flex flex-wrap items-center gap-1 px-3 py-2"
          style={navInnerStyle}
        >
          <button
            onClick={() => {
              playClick();
              setActiveSection("home");
            }}
            className="flex items-center gap-2 px-3 py-1 border-r border-iron-gold/20 mr-1"
          >
            <div
              className="w-2 h-2 rounded-full bg-arc-blue animate-pulse"
              style={{ boxShadow: "0 0 8px hsl(195 100% 50%)" }}
            />
            <span className="font-orbitron text-sm font-black text-iron-gold uppercase tracking-widest">
              AK
            </span>
          </button>

          {navItems
            .filter((i) => i.id !== "home")
            .map((item) => (
              <motion.button
                key={item.id}
                onClick={() => {
                  playClick();
                  setActiveSection(item.id);
                }}
                onMouseEnter={playHover}
                className={`relative px-3 py-1.5 font-orbitron text-[10px] uppercase tracking-wider transition-all duration-200 ${
                  activeSection === item.id
                    ? "text-arc-blue"
                    : "text-iron-gold/70 hover:text-arc-blue"
                }`}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                {item.label}
                {activeSection === item.id && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute right-0 bottom-0 left-0 h-[2px] bg-arc-blue"
                    style={{ boxShadow: "0 0 6px hsl(195 100% 50%)" }}
                  />
                )}
              </motion.button>
            ))}

          <div className="w-px h-5 bg-iron-gold/20 mx-1" />

          {[
            {
              active: viewMode === "terminal",
              icon: viewMode === "terminal" ? Monitor : Layers,
              fn: () => {
                playToggle();
                toggleViewMode();
              },
              title: "Terminal Mode",
            },
            {
              active: soundEnabled,
              icon: soundEnabled ? Volume2 : VolumeX,
              fn: () => {
                playClick();
                toggleSound();
              },
              title: "Sound",
            },
            {
              active: animationEnabled,
              icon: animationEnabled ? Sparkles : Zap,
              fn: () => {
                playClick();
                toggleAnimation();
              },
              title: "Animations",
            },
          ].map(({ active, icon: Icon, fn, title }) => (
            <motion.button
              key={title}
              onClick={fn}
              onMouseEnter={playHover}
              className={ctrlBtnClass(active)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={title}
            >
              <Icon size={14} />
            </motion.button>
          ))}
        </div>
      )}
    </motion.nav>
  );
};
