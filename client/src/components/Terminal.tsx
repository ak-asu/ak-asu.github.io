import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { Command } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { RootState } from '@/store/store';
import { setThemeMode } from '@/store/features/modeSlice';
import { audioManager } from '@/lib/audio';
import { AnimationLevel, ThemeMode } from '@/lib/types';
import achievements from '@/data/achievements.json';
import education from '@/data/education.json';
import projects from '@/data/projects.json';
import skills from '@/data/skills.json';
import work from '@/data/work.json';
import contact from '@/data/contact.json';

type Command = {
  input: string;
  output: string[];
  timestamp: string;
};

const AVAILABLE_COMMANDS = {
  help: 'List all available commands',
  clear: 'Clear the terminal',
  about: 'Display information about me',
  projects: 'List my projects',
  contact: 'Show contact information',
  skills: 'Display my technical skills',
  education: 'Display my educational background',
  work: 'Show my work experience',
  achievements: 'List my achievements',
  theme: 'Toggle terminal theme (light/dark)',
  whoami: 'Display current user information',
  ls: 'List directory contents',
  cd: 'Change directory',
  cat: 'Display file contents',
};

export const Terminal = () => {
  const dispatch = useDispatch();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<Command[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentPath, setCurrentPath] = useState('~/portfolio');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { animationLevel, soundEnabled, themeMode } = useSelector((state: RootState) => state.mode);

  const scrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  };

  useEffect(scrollToBottom, [history]);

  useEffect(() => {
    const welcomeCommand: Command = {
      input: "welcome",
      output: [
        "Welcome to my Interactive Portfolio Terminal!",
        "Type 'help' to see available commands.",
        "You can switch to the non-technical mode using the toggle in the top-right corner."
      ],
      timestamp: getTimestamp()
    };
    setHistory([welcomeCommand]);
  }, []);

  const getTimestamp = () => {
    return new Date().toLocaleTimeString();
  };

  const updateSuggestions = (value: string) => {
    if (!value) {
      setSuggestions([]);
      return;
    }
    const matches = Object.keys(AVAILABLE_COMMANDS).filter(cmd =>
      cmd.startsWith(value.toLowerCase())
    );
    setSuggestions(matches);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    updateSuggestions(e.target.value);
  };

  const processCommand = (cmd: string): string[] => {
    const command = cmd.toLowerCase().trim();
    const args = command.split(' ');
    switch (args[0]) {
      case 'help':
        return Object.entries(AVAILABLE_COMMANDS).map(([cmd, desc]) => `${cmd}: ${desc}`);
      case 'clear':
        return [];
      case 'about':
        return [
          'Hi there! I\'m a passionate software developer specializing in full-stack development.',
          'With expertise in modern web technologies, I create engaging and scalable applications.',
          'My goal is to build software that makes a difference, focusing on user experience and performance.',
          'Type "skills", "projects", or "contact" to learn more about me.'
        ];
      case 'contact':
        return [
          `Email: ${contact.email}`,
          `GitHub: ${contact.github}`,
          `LinkedIn: ${contact.linkedin}`
        ];
      case 'achievements':
        return [
          'My Achievements:',
          ...achievements.map(achievement => `${achievement.title} - ${achievement.date}`),
          'For more details on a specific achievement, visit the achievements directory.'
        ];
      case 'education':
        return [
          'My Education:',
          ...education.map(edu => `${edu.degree} at ${edu.institution} (${edu.startDate} - ${edu.endDate || 'Present'})`),
          'For more details on a specific education, visit the education directory'
        ];
      case 'skills':
        const lines: string[] = [];
        const skillsByCategory: Record<string, string[]> = {};
        skills.forEach(skill => {
          if (!skillsByCategory[skill.category]) {
            skillsByCategory[skill.category] = [];
          }
          skillsByCategory[skill.category].push(skill.name);
        });

        Object.entries(skillsByCategory).forEach(([category, skillNames]) => {
          lines.push(`${category}: ${skillNames.join(', ')}`);
        });
        return [
          'My Skills:',
          ...lines,
          'For more details on a specific skill category, visit the skills directory.'
        ];
      case 'projects':
        return [
          'My Projects:',
          ...projects.map((project, index) => `${index + 1}. ${project.name} - ${project.shortDescription}`),
          'For more details on a specific project, visit the projects directory.'
        ];
      case 'work':
        return [
          'My Work Experience:',
          ...work.map(job => `${job.position} at ${job.company} (${job.startDate} - ${job.endDate || 'Present'})`),
          'For more details on a specific job, visit the work directory.'
        ];
      case 'theme':
        const newTheme = themeMode === ThemeMode.Dark ? 'light' : 'dark';
        dispatch(setThemeMode(themeMode === ThemeMode.Dark ? ThemeMode.Light : ThemeMode.Dark));
        return [`Switched to ${newTheme} theme`];
      case 'whoami':
        return ['You are a visitor exploring my portfolio in technical mode. Welcome!', 'Type "help" to see available commands.'];
      case 'ls':
        if (currentPath === '~/portfolio') {
          return ['achievements/', 'education/', 'projects/', 'skills/', 'work/'];
        } else if (currentPath === '~/portfolio/achievements') {
          return achievements.map(a => `${a.title.toLowerCase().replace(/\s+/g, '-')}.json`);
        } else if (currentPath === '~/portfolio/education') {
          return education.map(edu => `${edu.institution.toLowerCase().replace(/\s+/g, '-')}.json`);
        } else if (currentPath === '~/portfolio/projects') {
          return projects.map((p, i) => `${i + 1}-${p.name.toLowerCase().replace(/\s+/g, '-')}.json`);
        } else if (currentPath === '~/portfolio/skills') {
          return Array.from(new Set(skills.map(s => `${s.category.toLowerCase().replace(/\s+/g, '-')}.json`)));
        } else if (currentPath === '~/portfolio/work') {
          return work.map((j, i) => `${i + 1}-${j.company.toLowerCase().replace(/\s+/g, '-')}.json`);
        }
        return ['Directory not found'];
      case 'cd':
        if (!args[1] || args[1] === '~' || args[1] === '/') {
          setCurrentPath('~/portfolio');
          return ['Changed directory to ~/portfolio'];
        } else if (args[1] === '..') {
          if (currentPath !== '~/portfolio') {
            setCurrentPath('~/portfolio');
            return ['Changed directory to ~/portfolio'];
          }
          return ['Already at root directory'];
        } else if (args[1] === 'achievements' && currentPath === '~/portfolio') {
          setCurrentPath('~/portfolio/achievements');
          return ['Changed directory to ~/portfolio/achievements'];
        } else if (args[1] === 'education' && currentPath === '~/portfolio') {
          setCurrentPath('~/portfolio/education');
          return ['Changed directory to ~/portfolio/education'];
        } else if (args[1] === 'projects' && currentPath === '~/portfolio') {
          setCurrentPath('~/portfolio/projects');
          return ['Changed directory to ~/portfolio/projects'];
        } else if (args[1] === 'skills' && currentPath === '~/portfolio') {
          setCurrentPath('~/portfolio/skills');
          return ['Changed directory to ~/portfolio/skills'];
        } else if (args[1] === 'work' && currentPath === '~/portfolio') {
          setCurrentPath('~/portfolio/work');
          return ['Changed directory to ~/portfolio/work'];
        }
        return [`Directory ${args[1]} not found`];
      case 'cat':
        if (!args[1]) return ['Usage: cat <filename>'];
        if (currentPath === '~/portfolio/achievements') {
          const achievementIndex = achievements.findIndex(a => a.title.toLowerCase().replace(/\s+/g, '-') === args[1]);
          if (achievementIndex >= 0) {
            const achievement = achievements[achievementIndex];
            return [
              `{`,
              `  "title": "${achievement.title}",`,
              `  "date": "${achievement.date}",`,
              `  "description": "${achievement.description}",`,
              `}`
            ];
          }
        } else if (currentPath === '~/portfolio/education') {
          const educationIndex = education.findIndex(edu => edu.institution.toLowerCase().replace(/\s+/g, '-') === args[1]);
          if (educationIndex >= 0) {
            const edu = education[educationIndex];
            return [
              `{`,
              `  "institution": "${edu.institution}",`,
              `  "date": "${edu.startDate} - ${edu.endDate || 'Present'}",`,
              `  "degree": "${edu.degree}",`,
              `  "field": "${edu.field}",`,
              `  "gpa": "${edu.gpa}",`,
              `  "courses": [${edu.subjects.map(s => `"${s}"`).join(', ')}],`,
              `}`
            ];
          }
        } else if (currentPath === '~/portfolio/projects') {
          const projectIndex = parseInt(args[1].split('-')[0]) - 1;
          if (projectIndex >= 0 && projectIndex < projects.length) {
            const project = projects[projectIndex];
            return [
              `{`,
              `  "name": "${project.name}",`,
              `  "description": "${project.description}",`,
              `  "technologies": [${project.technologies.map(t => `"${t}"`).join(', ')}],`,
              `  "duration": "${project.duration}",`,
              `  "link": "${project.url || ''}",`,
              `}`
            ];
          }
        } else if (currentPath === '~/portfolio/work') {
          const jobIndex = parseInt(args[1].split('-')[0]) - 1;
          if (jobIndex >= 0 && jobIndex < work.length) {
            const job = work[jobIndex];
            return [
              `{`,
              `  "position": "${job.position}",`,
              `  "company": "${job.company}",`,
              `  "date": "${job.startDate} - ${job.endDate || 'Present'}",`,
              `  "description": "${job.description}",`,
              `}`
            ];
          }
        } else if (currentPath === '~/portfolio/skills') {
          const category = args[1].replace('.json', '');
          const specificSkills = skills.filter(s => s.category.toLowerCase().replace(/\s+/g, '-') === category);
          if (specificSkills.length > 0) {
            return [
              `{`,
              `  "category": "${category}",`,
              `  "skills": [${specificSkills.map(s => `"${s.name}"`).join(', ')}]`,
              `}`
            ];
          } else {
            return [`File ${args[1]} not found or cannot be displayed`];
          }
        }
        return [`File ${args[1]} not found or cannot be displayed`];
      default:
        return [`Command not found: ${command}. Type 'help' for available commands.`];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (soundEnabled) {
      audioManager.playSoundEffect('click');
    }
    // Handle clear command specially
    if (input.trim().toLowerCase() === 'clear') {
      setHistory([]);
      setCommandHistory([...commandHistory, input]);
      setHistoryIndex(-1);
      setInput('');
      setSuggestions([]);
      return;
    }
    const newCommand: Command = {
      input,
      output: processCommand(input),
      timestamp: getTimestamp(),
    };
    setHistory([...history, newCommand]);
    setCommandHistory([...commandHistory, input]);
    setHistoryIndex(-1);
    setInput('');
    setSuggestions([]);
    // Announce command execution for screen readers
    const announceMessage = `Command executed: ${input}. ${newCommand.output.join('. ')}`;
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = announceMessage;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && suggestions.length > 0) {
      e.preventDefault();
      setInput(suggestions[0]);
      setSuggestions([]);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const handleTerminalClick = (e: React.MouseEvent) => {
    // Don't focus if clicking on interactive elements
    const target = e.target as HTMLElement;
    const isInteractiveElement =
      target.tagName === 'BUTTON' ||
      target.tagName === 'A' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.getAttribute('contenteditable') === 'true' ||
      target.getAttribute('role') === 'option' ||
      target.classList.contains('interactive') ||
      target.closest('[role="option"]') ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('[contenteditable="true"]');

    // Only focus the input if not clicking on an interactive element
    if (!isInteractiveElement && inputRef.current) {
      e.preventDefault(); // Prevent any default behavior
      // e.stopPropagation(); // Stop the event from bubbling up      
      // Focus with a slight delay to ensure the focus isn't lost
      // This helps prevent the focus from being immediately lost after clicking
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      // inputRef.current.focus();
    }
  };

  // Determine animation properties based on animation level
  const getAnimationProps = () => {
    switch (animationLevel) {
      case AnimationLevel.High:
        return {
          initial: { opacity: 0, y: 20, scale: 0.95 },
          animate: { opacity: 1, y: 0, scale: 1 },
          transition: { type: 'spring', damping: 12 }
        };
      case AnimationLevel.Medium:
        return {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { type: 'tween' }
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
        };
    }
  };

  useEffect(() => {
    // Focus the input when the component mounts
    inputRef.current?.focus();
    // Add a click event listener to the window to refocus when clicking outside
    const handleWindowClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if click is outside the terminal
      if (terminalRef.current && !terminalRef.current.contains(target)) {
        // Don't refocus if clicking on another interactive element
        if (!target.closest('button') && !target.closest('a') && !target.closest('input') && !target.closest('textarea') && !target.closest('[contenteditable="true"]')) {
          inputRef.current?.focus();
        }
      }
    };
    window.addEventListener('click', handleWindowClick);
    return () => { window.removeEventListener('click', handleWindowClick); };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className='font-mono w-full h-[calc(100vh-4rem)] overflow-hidden relative bg-background text-foreground'
      role="region"
      aria-label="Interactive Terminal"
      // Remove the onClick handler from here
      style={{ cursor: 'default' }} // Change cursor to default
      // Use -1 to make the container focusable but not in tab order
      tabIndex={-1}
      // When container gets focus, forward to input
      onFocus={(e) => {
        // Only focus the input if the focus event is on the container itself
        if (e.target === e.currentTarget) {
          inputRef.current?.focus();
        }
      }}
      ref={terminalRef}
    >
      {/* Add a clickable overlay that covers only 2/3 of the width */}
      <div
        className="absolute top-0 left-0 w-2/3 h-full cursor-text"
        onClick={handleTerminalClick}
        aria-hidden="true"
      />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Command className="absolute top-2 right-2 opacity-50 hover:opacity-100 transition-opacity h-4 w-4" aria-hidden="true" />
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-2">
              <p className="font-bold">Terminal Tips:</p>
              <ul className="text-sm space-y-1">
                <li>↑↓ Navigate command history</li>
                <li>Tab for auto-completion</li>
                <li>Type 'help' for commands</li>
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div
        className="overflow-y-auto h-full p-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
        role="log"
        aria-live="polite"
        aria-label="Terminal Output"
      // Remove onClick handler from here too to prevent conflicts
      >
        <AnimatePresence mode="popLayout">
          {history.map((cmd, i) => (
            <motion.div
              key={i}
              {...getAnimationProps()}
              role="article"
              aria-label={`Command: ${cmd.input}`}
            >
              <div className="flex items-center gap-2 opacity-50 text-sm">
                <span>{cmd.timestamp}</span>
                <span>{currentPath}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary">$</span>
                <span>{cmd.input}</span>
              </div>
              {cmd.output.map((line, j) => (
                <motion.div
                  key={j}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: j * 0.1 }}
                  className="ml-4"
                >
                  {line}
                </motion.div>
              ))}
            </motion.div>
          ))}
        </AnimatePresence>
        <form
          onSubmit={handleSubmit}
          className="mt-4"
          role="search"
          aria-label="Command Input"
        >
          <div className="flex items-center gap-2 relative">
            <span className="flex items-center gap-2">
              <span className="opacity-50">{currentPath}</span>
              <span className="text-primary">$</span>
            </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="bg-transparent outline-none flex-1 w-full caret-primary focus:caret-visible"
              autoFocus
              spellCheck={false}
              aria-label="Enter command"
              aria-describedby="command-suggestions"
              role="combobox"
              aria-expanded={suggestions.length > 0}
              aria-controls="command-suggestions"
              aria-autocomplete="list"
              // Add onBlur handler to help maintain focus within the terminal
              onBlur={(e) => {
                // Only refocus if the focus is leaving the terminal component altogether
                // Check if the new focus target is within our terminal component
                if (!e.currentTarget.contains(e.relatedTarget as Node) &&
                  !terminalRef.current?.contains(e.relatedTarget as Node)) {
                  // If focus is leaving terminal entirely, don't refocus
                  // This prevents focus trapping but allows normal tab navigation
                } else {
                  // Otherwise keep focus in the input
                  requestAnimationFrame(() => {
                    inputRef.current?.focus();
                  });
                }
              }}
            />
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-0 right-0 bottom-full mb-2 bg-background/80 backdrop-blur-sm border border-border rounded-lg p-2"
                id="command-suggestions"
                role="listbox"
                aria-label="Command suggestions"
              >
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion}
                    className="px-2 py-1 hover:bg-primary/10 rounded cursor-pointer"
                    onClick={() => {
                      setInput(suggestion);
                      setSuggestions([]);
                      inputRef.current?.focus();
                    }}
                    role="option"
                    aria-selected={input === suggestion}
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setInput(suggestion);
                        setSuggestions([]);
                        inputRef.current?.focus();
                      }
                    }}
                  >
                    {suggestion}
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  );
};