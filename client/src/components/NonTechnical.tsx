import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ThreeLaptop } from './projects/ThreeLaptop';
import { SpriteCharacter } from './SpriteCharacter';
import { TicTacToe } from './games/TicTacToe';
import { ProjectCard } from './projects/ProjectCard';
import EducationCard from './education/EducationCard';
import WorkScene from './work/WorkScene';
import CurtainedAchievements from './achievements/WallOfFame';
import SkillsShowcase from './skills/Skills';
import { audioManager } from '@/lib/audio';
import { useSelector, useDispatch } from 'react-redux';
import { setScrollSection } from '@/store/features/navigationSlice';
import type { RootState } from '@/store/store';
import projects from '@/data/projects.json';

const sections = [
  { id: 'intro', label: 'Introduction' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' },
  { id: 'work', label: 'Work Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'play', label: 'Let\'s Play' }
];

export const NonTechnical = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('intro');
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  
  const dispatch = useDispatch();
  const { soundEnabled, animationLevel } = useSelector((state: RootState) => state.mode);
  const currentScrollSection = useSelector((state: RootState) => state.navigation.scrollSection);

  useEffect(() => {
    if (soundEnabled) {
      audioManager.playBackgroundMusic();
    }

    // Simulate loading delay based on animation level
    const delay = animationLevel === 'basic' ? 1000 : animationLevel === 'medium' ? 2000 : 3000;
    const timer = setTimeout(() => setIsLoading(false), delay);

    return () => {
      clearTimeout(timer);
      audioManager.stopBackgroundMusic();
    };
  }, [soundEnabled, animationLevel]);

  // Handle scroll events to update active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Add offset to trigger earlier
      
      // Find the section that is currently in view
      let currentSection = sections[0].id;
      
      for (const section of sections) {
        const element = sectionRefs.current[section.id];
        if (element && scrollPosition >= element.offsetTop) {
          currentSection = section.id;
        }
      }
      
      if (currentSection !== activeSection) {
        setActiveSection(currentSection);
        dispatch(setScrollSection(currentSection));
        
        // Play sound effect when changing sections
        if (soundEnabled) {
          // audioManager.playUISound('sectionChange');
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [activeSection, soundEnabled, dispatch]);

  // Setup section refs
  const setSectionRef = (id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
  };

  // Section component with InView animation
  const Section = ({ 
    id, 
    title, 
    children 
  }: { 
    id: string; 
    title: string; 
    children: React.ReactNode 
  }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, amount: 0.3 });
    
    useEffect(() => {
      if (ref.current) {
        setSectionRef(id)(ref.current as HTMLElement);
      }
    }, []);
    
    return (
      <section 
        ref={ref}
        id={id}
        className="py-16 min-h-screen flex flex-col justify-center snap-start"
        aria-label={title}
      >
        <motion.h2
          initial={{ x: -50, opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 1 } : { x: -50, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-12 text-center"
        >
          {title}
        </motion.h2>
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex-grow"
        >
          {children}
        </motion.div>
      </section>
    );
  };

  if (isLoading) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        role="status"
        aria-live="polite"
      >
        <div className="text-center">
          <SpriteCharacter />
          <motion.div
            className="mt-8 flex flex-col items-center"
          >
            <motion.p
              animate={{
                scale: [1, 1.1, 1],
                transition: { repeat: Infinity, duration: 1 }
              }}
              className="mb-4 text-xl"
            >
              Loading your experience...
            </motion.p>
            
            {/* Custom loading bar */}
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-600"
                initial={{ width: "0%" }}
                animate={{ 
                  width: ["0%", "40%", "60%", "80%", "100%"],
                }}
                transition={{ 
                  times: [0, 0.4, 0.6, 0.8, 1], 
                  duration: animationLevel === 'basic' ? 1 : animationLevel === 'medium' ? 2 : 3,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen snap-y snap-mandatory"
        id="main-content"
        role="main"
      >
        <div className="container mx-auto px-4">
          {/* Introduction Section with 3D Laptop */}
          <Section id="intro" title="Welcome to My Portfolio">
            <div className="flex flex-col items-center justify-center">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto text-center mb-16"
              >
                <ThreeLaptop />
                <p className="mt-8 text-lg text-gray-600">
                  Explore my portfolio to learn more about my skills, experience, and projects.
                  Interact with the 3D elements and enjoy the journey!
                </p>
              </motion.div>
              
              {/* Floating character guide */}
              <div className="fixed right-8 bottom-8 z-50">
                <SpriteCharacter />
              </div>
            </div>
          </Section>

          {/* Education Section */}
          <Section id="education" title="Education">
            <div className="max-w-4xl mx-auto">
              <EducationCard />
            </div>
          </Section>

          {/* Skills Section */}
          <Section id="skills" title="Skills">
            <div className="max-w-5xl mx-auto">
              <SkillsShowcase />
            </div>
          </Section>

          {/* Work Experience Section */}
          <Section id="work" title="Work Experience">
            <motion.div
              className="w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <WorkScene />
            </motion.div>
          </Section>

          {/* Projects Section */}
          <Section id="projects" title="Projects">
            <div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              role="list"
              aria-label="Project list"
            >
              {projects.map((project, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.2 }}
                  role="listitem"
                  whileHover={{ 
                    y: -10,
                    transition: { 
                      type: "spring", 
                      stiffness: 300, 
                      damping: 10 
                    }
                  }}
                >
                  {/* {<ProjectCard project={project} />} */}
                </motion.div>
              ))}
            </div>
          </Section>

          {/* Achievements Section */}
          <Section id="achievements" title="Achievements">
            <div className="max-w-6xl mx-auto">
              <CurtainedAchievements />
            </div>
          </Section>

          {/* Let's Play Section */}
          <Section id="play" title="Let's Play">
            <div className="max-w-2xl mx-auto">
              <TicTacToe />
            </div>
          </Section>
        </div>

        {/* Section navigation dots */}
        <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-50">
          <ul className="space-y-4">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    activeSection === section.id
                      ? 'bg-blue-600 scale-125'
                      : 'bg-gray-300 hover:bg-blue-300'
                  }`}
                  onClick={() => {
                    const element = document.getElementById(section.id);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  aria-label={`Go to ${section.label} section`}
                  aria-current={activeSection === section.id ? 'true' : 'false'}
                />
              </li>
            ))}
          </ul>
        </nav>
      </motion.main>
    </AnimatePresence>
  );
};