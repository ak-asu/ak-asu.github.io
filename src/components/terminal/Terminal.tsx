import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArcReactor } from "@/components/ui/ArcReactor";

interface TerminalLine {
  id: string;
  type: "input" | "output" | "system" | "error";
  content: string;
  timestamp: Date;
}

// Portfolio data for commands
const portfolioData = {
  about: {
    name: "Tony Stark",
    title: "Genius, Billionaire, Playboy, Philanthropist",
    summary:
      "Full-stack developer with a passion for building innovative web applications. Specializing in React, TypeScript, and modern web technologies. Creator of the Iron Man Mark 42 Portfolio.",
    location: "Malibu, California",
    email: "tony@starkindustries.com",
  },
  skills: [
    {
      category: "Frontend",
      items: [
        "React",
        "TypeScript",
        "Next.js",
        "Tailwind CSS",
        "Framer Motion",
      ],
    },
    {
      category: "Backend",
      items: ["Node.js", "Python", "PostgreSQL", "MongoDB", "GraphQL"],
    },
    {
      category: "DevOps",
      items: ["Docker", "AWS", "Kubernetes", "CI/CD", "Terraform"],
    },
    {
      category: "Tools",
      items: ["Git", "VS Code", "Figma", "Jira", "Webpack"],
    },
  ],
  projects: [
    {
      name: "Arc Reactor UI",
      description: "A futuristic UI component library",
      tech: "React, TypeScript, Framer Motion",
    },
    {
      name: "J.A.R.V.I.S. Dashboard",
      description: "AI-powered home automation system",
      tech: "Next.js, TensorFlow, Python",
    },
    {
      name: "Mark 42 Portfolio",
      description: "This portfolio you're looking at",
      tech: "React, Tailwind, Three.js",
    },
    {
      name: "Stark Industries API",
      description: "Enterprise-grade REST API platform",
      tech: "Node.js, Express, PostgreSQL",
    },
  ],
  education: [
    {
      degree: "Ph.D. in Electrical Engineering",
      institution: "MIT",
      year: "2008",
    },
    { degree: "M.S. in Physics", institution: "MIT", year: "2006" },
    { degree: "B.S. in Computer Science", institution: "MIT", year: "2004" },
  ],
  work: [
    {
      role: "CEO & Lead Engineer",
      company: "Stark Industries",
      period: "2008 - Present",
    },
    { role: "Senior Developer", company: "Stark Tech", period: "2006 - 2008" },
    { role: "Research Intern", company: "MIT Labs", period: "2004 - 2006" },
  ],
  achievements: [
    "Forbes 30 Under 30 - Technology",
    "Best Innovation Award - Tech Summit 2023",
    "Open Source Contributor of the Year",
    "1M+ Downloads on NPM packages",
  ],
};

const COMMANDS: Record<string, { description: string; usage?: string }> = {
  help: { description: "Display available commands" },
  about: { description: "Display information about me" },
  skills: { description: "List technical skills", usage: "skills [category]" },
  projects: { description: "Display portfolio projects" },
  education: { description: "Show educational background" },
  work: { description: "Display work experience" },
  achievements: { description: "List achievements and awards" },
  clear: { description: "Clear terminal screen" },
  whoami: { description: "Display current user info" },
  date: { description: "Show current date and time" },
  echo: { description: "Echo a message", usage: "echo <message>" },
  contact: { description: "Display contact information" },
  theme: { description: "Toggle terminal theme", usage: "theme [dark|light]" },
};

export const Terminal = () => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
    // Welcome message
    addSystemLine("J.A.R.V.I.S. Interface v4.2.0 Initialized");
    addSystemLine("Welcome, Sir. How may I assist you today?");
    addSystemLine("Type 'help' to see available commands.");
  }, []);

  const addLine = useCallback((type: TerminalLine["type"], content: string) => {
    const newLine: TerminalLine = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      content,
      timestamp: new Date(),
    };
    setLines((prev) => [...prev, newLine]);
  }, []);

  const addSystemLine = (content: string) => addLine("system", content);
  const addOutputLine = (content: string) => addLine("output", content);
  const addErrorLine = (content: string) => addLine("error", content);
  const addInputLine = (content: string) => addLine("input", content);

  // Typewriter effect for output
  const typewriterOutput = async (lines: string[]) => {
    setIsTyping(true);
    for (const line of lines) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      addOutputLine(line);
    }
    setIsTyping(false);
  };

  const processCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    const [command, ...args] = trimmedCmd.split(" ");

    addInputLine(`> ${cmd}`);
    setHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);

    if (!command) return;

    switch (command) {
      case "help":
        await typewriterOutput([
          "╔══════════════════════════════════════════════════════════════╗",
          "║              J.A.R.V.I.S. COMMAND INTERFACE                  ║",
          "╠══════════════════════════════════════════════════════════════╣",
          ...Object.entries(COMMANDS).map(
            ([cmd, info]) =>
              `║  ${cmd.padEnd(12)} │ ${info.description.padEnd(40)}║`,
          ),
          "╚══════════════════════════════════════════════════════════════╝",
        ]);
        break;

      case "about":
        await typewriterOutput([
          "┌─────────────────────────────────────────────────────────────┐",
          `│  Name:     ${portfolioData.about.name.padEnd(48)}│`,
          `│  Title:    ${portfolioData.about.title.padEnd(48)}│`,
          "├─────────────────────────────────────────────────────────────┤",
          `│  ${portfolioData.about.summary.substring(0, 59).padEnd(59)}│`,
          `│  ${portfolioData.about.summary.substring(59, 118).padEnd(59)}│`,
          `│  ${portfolioData.about.summary.substring(118).padEnd(59)}│`,
          "├─────────────────────────────────────────────────────────────┤",
          `│  Location: ${portfolioData.about.location.padEnd(48)}│`,
          `│  Email:    ${portfolioData.about.email.padEnd(48)}│`,
          "└─────────────────────────────────────────────────────────────┘",
        ]);
        break;

      case "skills":
        const categoryFilter = args[0];
        const filteredSkills = categoryFilter
          ? portfolioData.skills.filter(
              (s) => s.category.toLowerCase() === categoryFilter,
            )
          : portfolioData.skills;

        if (filteredSkills.length === 0) {
          addErrorLine(
            `Category '${categoryFilter}' not found. Available: ${portfolioData.skills.map((s) => s.category.toLowerCase()).join(", ")}`,
          );
        } else {
          await typewriterOutput([
            "╔══════════════════════════════════════════════════════════════╗",
            "║                    TECHNICAL SKILLS MATRIX                   ║",
            "╠══════════════════════════════════════════════════════════════╣",
            ...filteredSkills.flatMap((skill) => [
              `║  ▸ ${skill.category.toUpperCase().padEnd(58)}║`,
              `║    ${skill.items.join(" • ").padEnd(58)}║`,
              "║                                                              ║",
            ]),
            "╚══════════════════════════════════════════════════════════════╝",
          ]);
        }
        break;

      case "projects":
        await typewriterOutput([
          "╔══════════════════════════════════════════════════════════════╗",
          "║                    PROJECT REPOSITORY                        ║",
          "╠══════════════════════════════════════════════════════════════╣",
          ...portfolioData.projects.flatMap((project, i) => [
            `║  [${(i + 1).toString().padStart(2, "0")}] ${project.name.padEnd(54)}║`,
            `║       ${project.description.padEnd(54)}║`,
            `║       Tech: ${project.tech.padEnd(47)}║`,
            "║                                                              ║",
          ]),
          "╚══════════════════════════════════════════════════════════════╝",
        ]);
        break;

      case "education":
        await typewriterOutput([
          "╔══════════════════════════════════════════════════════════════╗",
          "║                    EDUCATION RECORDS                         ║",
          "╠══════════════════════════════════════════════════════════════╣",
          ...portfolioData.education
            .map(
              (edu) =>
                `║  ◆ ${edu.degree.padEnd(40)} ${edu.year.padEnd(14)}║\n║    ${edu.institution.padEnd(58)}║`,
            )
            .join("\n")
            .split("\n"),
          "╚══════════════════════════════════════════════════════════════╝",
        ]);
        break;

      case "work":
        await typewriterOutput([
          "╔══════════════════════════════════════════════════════════════╗",
          "║                    EMPLOYMENT HISTORY                        ║",
          "╠══════════════════════════════════════════════════════════════╣",
          ...portfolioData.work.flatMap((job) => [
            `║  ● ${job.role.padEnd(58)}║`,
            `║    ${job.company.padEnd(40)} ${job.period.padEnd(17)}║`,
            "║                                                              ║",
          ]),
          "╚══════════════════════════════════════════════════════════════╝",
        ]);
        break;

      case "achievements":
        await typewriterOutput([
          "╔══════════════════════════════════════════════════════════════╗",
          "║                    ACHIEVEMENTS & AWARDS                     ║",
          "╠══════════════════════════════════════════════════════════════╣",
          ...portfolioData.achievements.map(
            (ach, i) => `║  ★ ${ach.padEnd(58)}║`,
          ),
          "╚══════════════════════════════════════════════════════════════╝",
        ]);
        break;

      case "contact":
        await typewriterOutput([
          "┌─────────────────────────────────────────────────────────────┐",
          "│                    CONTACT INFORMATION                       │",
          "├─────────────────────────────────────────────────────────────┤",
          `│  Email:    ${portfolioData.about.email.padEnd(48)}│`,
          "│  GitHub:   github.com/tonystark                             │",
          "│  LinkedIn: linkedin.com/in/tonystark                        │",
          "│  Twitter:  @IronMan                                         │",
          "└─────────────────────────────────────────────────────────────┘",
        ]);
        break;

      case "clear":
        setLines([]);
        addSystemLine("Terminal cleared. J.A.R.V.I.S. standing by.");
        break;

      case "whoami":
        addOutputLine("Guest User @ J.A.R.V.I.S. Terminal");
        addOutputLine("Access Level: Visitor | Clearance: Public");
        break;

      case "date":
        const now = new Date();
        addOutputLine(`Current Date: ${now.toLocaleDateString()}`);
        addOutputLine(`Current Time: ${now.toLocaleTimeString()}`);
        addOutputLine(
          `Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
        );
        break;

      case "echo":
        if (args.length > 0) {
          addOutputLine(args.join(" "));
        } else {
          addErrorLine("Usage: echo <message>");
        }
        break;

      case "theme":
        addSystemLine("Theme switching is handled by the Visual Mode toggle.");
        break;

      default:
        addErrorLine(`Command not recognized: '${command}'`);
        addSystemLine("Type 'help' for available commands.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isTyping) {
      processCommand(input);
      setInput("");
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex =
          historyIndex === -1
            ? history.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setInput("");
        } else {
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      // Auto-complete
      const matchingCommands = Object.keys(COMMANDS).filter((cmd) =>
        cmd.startsWith(input.toLowerCase()),
      );
      if (matchingCommands.length === 1) {
        setInput(matchingCommands[0]);
        setSuggestions([]);
      } else if (matchingCommands.length > 1) {
        setSuggestions(matchingCommands);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    if (value) {
      const matchingCommands = Object.keys(COMMANDS).filter((cmd) =>
        cmd.startsWith(value.toLowerCase()),
      );
      setSuggestions(matchingCommands.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-background terminal-screen overflow-hidden"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Scanline overlay */}
      <div className="scanlines pointer-events-none" />

      {/* Terminal Window */}
      <div className="h-full flex flex-col max-w-6xl mx-auto">
        {/* Title Bar */}
        <motion.div
          className="flex items-center justify-between px-4 py-3 border-b-2 border-iron-gold/30 bg-gradient-to-r from-iron-red-dark via-iron-red/50 to-iron-red-dark"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <ArcReactor size={24} />
            <span className="font-orbitron text-sm text-arc-blue uppercase tracking-wider">
              J.A.R.V.I.S. Terminal v4.2.0
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full bg-iron-gold/50 hover:bg-iron-gold transition-colors cursor-pointer"
              title="Minimize"
            />
            <div
              className="w-3 h-3 rounded-full bg-arc-blue/50 hover:bg-arc-blue transition-colors cursor-pointer"
              title="Maximize"
            />
            <div
              className="w-3 h-3 rounded-full bg-iron-red-light/50 hover:bg-iron-red-light transition-colors cursor-pointer"
              title="Close"
            />
          </div>
        </motion.div>

        {/* Terminal Content */}
        <div
          ref={terminalRef}
          className="flex-1 overflow-y-auto p-4 font-mono text-sm scrollbar-thin scrollbar-track-iron-red-dark scrollbar-thumb-arc-blue/30"
        >
          <AnimatePresence mode="popLayout">
            {lines.map((line) => (
              <motion.div
                key={line.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.1 }}
                className={`mb-1 ${
                  line.type === "input"
                    ? "text-iron-gold"
                    : line.type === "system"
                      ? "text-arc-blue"
                      : line.type === "error"
                        ? "text-iron-red-light"
                        : "text-foreground/80"
                }`}
              >
                {line.type === "system" && (
                  <span className="text-arc-blue mr-2">[JARVIS]</span>
                )}
                {line.type === "error" && (
                  <span className="text-iron-red-light mr-2">[ERROR]</span>
                )}
                <span className="whitespace-pre-wrap">{line.content}</span>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              className="flex items-center gap-1 text-arc-blue"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="animate-pulse">Processing</span>
              <span className="animate-pulse delay-75">.</span>
              <span className="animate-pulse delay-150">.</span>
              <span className="animate-pulse delay-300">.</span>
            </motion.div>
          )}
        </div>

        {/* Suggestions */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              className="px-4 py-2 border-t border-iron-gold/20 bg-iron-red-dark/50"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <span className="text-xs text-iron-gold/50 mr-2">
                Suggestions:
              </span>
              {suggestions.map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => {
                    setInput(cmd);
                    setSuggestions([]);
                    inputRef.current?.focus();
                  }}
                  className="text-xs text-arc-blue hover:text-arc-blue-light mx-1 px-2 py-0.5 rounded border border-arc-blue/30 hover:border-arc-blue transition-colors"
                >
                  {cmd}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Line */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 px-4 py-3 border-t-2 border-iron-gold/30 bg-gradient-to-r from-iron-red-dark via-iron-red/30 to-iron-red-dark"
        >
          <span className="text-arc-blue font-orbitron text-sm">❯</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            placeholder={isTyping ? "Processing..." : "Enter command..."}
            className="flex-1 bg-transparent border-none outline-none font-mono text-iron-gold placeholder:text-iron-gold/30 text-sm"
            autoFocus
          />
          <motion.div
            className="w-2.5 h-5 bg-arc-blue"
            animate={{ opacity: [1, 0] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        </form>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 py-2 text-[10px] font-orbitron uppercase tracking-wider border-t border-iron-gold/20 bg-iron-red-dark/80">
          <div className="flex items-center gap-4">
            <span className="text-iron-gold/50">Lines: {lines.length}</span>
            <span className="text-iron-gold/50">History: {history.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-arc-blue animate-pulse" />
            <span className="text-arc-blue">System Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
