import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAudioSystem } from "@/hooks/useAudioSystem";
import projectsDataRaw from "@/data/projects.json";

type ProjectType = "personal" | "collaborative" | "hackathon" | "academic";
type FilterType = "All" | "Personal" | "Collaborative" | "Hackathon";

interface Project {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  technologies: string[];
  duration: string;
  url: string;
  media: string;
  type: ProjectType;
  placement?: string;
}

const projects = projectsDataRaw as Project[];
const PINNED_IDS = ["project30", "project31", "project32", "project33"];

function typeToFilter(t: ProjectType): FilterType {
  if (t === "personal") return "Personal";
  if (t === "collaborative") return "Collaborative";
  if (t === "hackathon") return "Hackathon";
  return "Personal";
}

function placementLabel(p?: string) {
  if (!p) return null;
  if (p === "1st") return "1st Place";
  if (p === "2nd") return "2nd Place";
  if (p === "3rd") return "3rd Place";
  return p;
}

function getBadge(project: Project) {
  if (project.type === "hackathon" && project.placement) {
    return { label: placementLabel(project.placement)!, color: "#00c864" };
  }
  if (project.type === "hackathon") {
    return { label: "Hackathon", color: "#00c864" };
  }
  if (project.type === "collaborative") {
    return { label: "Collab", color: "#00bfff" };
  }
  return { label: "Personal", color: "#c49102" };
}

function convertToEmbedUrl(url: string): string | null {
  if (!url) return null;
  const ytShort = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}`;
  const ytLong = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (ytLong) return `https://www.youtube.com/embed/${ytLong[1]}`;
  return null;
}

function FeaturedShowcase({
  project,
  onPrev,
  onNext,
}: {
  project: Project;
  onPrev: () => void;
  onNext: () => void;
}) {
  const embedUrl = convertToEmbedUrl(project.media);
  const badge = getBadge(project);
  const { playHover } = useAudioSystem();

  return (
    <div
      className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]"
      style={{
        border: "1px solid rgba(196,145,2,0.18)",
        background: "rgba(3,5,12,0.72)",
        boxShadow: "0 0 28px rgba(0,191,255,0.06)",
        padding: "14px",
      }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: "16/9",
          border: "1px solid rgba(0,191,255,0.22)",
          background:
            "linear-gradient(180deg, rgba(0,191,255,0.08), rgba(5,8,18,0.92))",
        }}
      >
        {embedUrl ? (
          <iframe
            key={embedUrl}
            src={embedUrl}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center">
            <Play size={28} style={{ color: "rgba(0,191,255,0.55)" }} />
            <span
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "11px",
                color: "rgba(196,145,2,0.6)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              No video preview
            </span>
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-col">
        <div className="mb-3 flex items-center gap-2">
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "8px",
              textTransform: "uppercase",
              color: badge.color,
              border: `1px solid ${badge.color}40`,
              background: `${badge.color}10`,
              padding: "2px 7px",
            }}
          >
            {badge.label}
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "9px",
              color: "rgba(224,221,216,0.28)",
            }}
          >
            {project.duration}
          </span>
        </div>

        <h3
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "18px",
            lineHeight: 1.2,
            color: "#e0ddd8",
            marginBottom: "8px",
          }}
        >
          {project.name}
        </h3>
        <p
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "14px",
            color: "rgba(224,221,216,0.68)",
            lineHeight: 1.5,
            marginBottom: "12px",
          }}
        >
          {project.shortDescription}
        </p>
        <p
          className="min-h-0 overflow-y-auto pr-1"
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "13px",
            color: "rgba(224,221,216,0.48)",
            lineHeight: 1.5,
            maxHeight: "96px",
            marginBottom: "12px",
          }}
        >
          {project.description}
        </p>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {project.technologies.slice(0, 7).map((t) => (
            <span
              key={t}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "9px",
                padding: "2px 7px",
                border: "1px solid rgba(196,145,2,0.18)",
                color: "rgba(196,145,2,0.55)",
                background: "rgba(196,145,2,0.04)",
              }}
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center gap-2">
          <button
            onClick={onPrev}
            onMouseEnter={playHover}
            className="btn-chamfer flex h-8 w-8 items-center justify-center"
            style={{
              border: "1px solid rgba(196,145,2,0.25)",
              color: "rgba(196,145,2,0.72)",
              background: "rgba(5,8,18,0.6)",
            }}
            aria-label="Previous project"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={onNext}
            onMouseEnter={playHover}
            className="btn-chamfer flex h-8 w-8 items-center justify-center"
            style={{
              border: "1px solid rgba(196,145,2,0.25)",
              color: "rgba(196,145,2,0.72)",
              background: "rgba(5,8,18,0.6)",
            }}
            aria-label="Next project"
          >
            <ChevronRight size={15} />
          </button>
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-chamfer ml-auto flex items-center gap-1 px-4 py-2 font-orbitron text-[9px] uppercase tracking-wider"
              style={{
                border: "1px solid rgba(196,145,2,0.28)",
                color: "rgba(196,145,2,0.75)",
                background: "rgba(196,145,2,0.04)",
              }}
            >
              <ExternalLink size={11} /> Open
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export const ProjectsSection = () => {
  const [filter, setFilter] = useState<FilterType>("All");
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const { playClick, playHover } = useAudioSystem();

  const filters: FilterType[] = [
    "All",
    "Personal",
    "Collaborative",
    "Hackathon",
  ];

  const filtered = (() => {
    const matches = (p: Project) =>
      filter === "All" || typeToFilter(p.type) === filter;
    const pinned = projects.filter((p) => PINNED_IDS.includes(p.id) && matches(p));
    const rest = projects.filter((p) => !PINNED_IDS.includes(p.id) && matches(p));
    return [...pinned, ...rest];
  })();
  const featured = filtered[Math.min(featuredIndex, Math.max(filtered.length - 1, 0))];

  useEffect(() => {
    setFeaturedIndex(0);
  }, [filter]);

  const showPrevious = () => {
    playClick();
    setFeaturedIndex((idx) => (idx - 1 + filtered.length) % filtered.length);
  };

  const showNext = () => {
    playClick();
    setFeaturedIndex((idx) => (idx + 1) % filtered.length);
  };

  return (
    <section
      className="relative flex min-h-screen w-full flex-col overflow-hidden"
      style={{ paddingBottom: "28px", paddingTop: "72px" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-iron-red-dark/30 via-background to-iron-red-dark/30 pointer-events-none" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 sm:px-6">
        <SectionHeader label="portfolio" title="PROJECTS" />

        <div className="mb-6 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => {
                playClick();
                setFilter(f);
              }}
              onMouseEnter={playHover}
              className="btn-chamfer px-4 py-1.5 font-orbitron text-[9px] uppercase tracking-wider transition-all duration-200"
              style={{
                border: `1px solid ${
                  filter === f ? "rgba(0,191,255,0.5)" : "rgba(196,145,2,0.2)"
                }`,
                color: filter === f ? "#00bfff" : "rgba(196,145,2,0.6)",
                background:
                  filter === f ? "rgba(0,191,255,0.08)" : "rgba(5,8,18,0.5)",
                boxShadow:
                  filter === f ? "0 0 12px rgba(0,191,255,0.12)" : "none",
              }}
            >
              {f}
            </button>
          ))}
          <span
            style={{
              marginLeft: "auto",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "9px",
              color: "rgba(224,221,216,0.25)",
              alignSelf: "center",
            }}
          >
            {filtered.length} projects
          </span>
        </div>

        {featured && (
          <FeaturedShowcase
            project={featured}
            onPrev={showPrevious}
            onNext={showNext}
          />
        )}

        <div className="mt-auto mb-4 flex justify-center">
          <a
            href="https://github.com/ak-asu"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-chamfer flex items-center gap-2 px-6 py-2.5 font-orbitron text-[9px] uppercase tracking-wider transition-all duration-200"
            style={{
              border: "1px solid rgba(196,145,2,0.3)",
              color: "rgba(196,145,2,0.7)",
              background: "rgba(5,8,18,0.6)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(0,191,255,0.4)";
              e.currentTarget.style.color = "#00bfff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(196,145,2,0.3)";
              e.currentTarget.style.color = "rgba(196,145,2,0.7)";
            }}
          >
            View More on GitHub ↗
          </a>
        </div>
      </div>

    </section>
  );
};
