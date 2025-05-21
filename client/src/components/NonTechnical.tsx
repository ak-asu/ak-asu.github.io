import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { audioManager } from '@/lib/audio';
import { useSelector, useDispatch } from 'react-redux';
import { setScrollSection } from '@/store/features/navigationSlice';
import type { RootState } from '@/store/store';
import { AnimationLevel } from '@/lib/types';
import { NavItems } from '@/lib/constants';
import { GameCarousel } from './games';
import EducationCard from './education';
import WorkScene from './work';
import Achievements from './achievements';
import SkillsShowcase from './skills';
import { ProjectShow } from './projects';
import { InteractiveThreeSphere } from './intro';
import RotatableSphere from './intro2/Sphere';

const sectionComponents = {
  intro: RotatableSphere,
  education: EducationCard,
  skills: SkillsShowcase,
  projects: ProjectShow,
  work: WorkScene,
  achievements: Achievements,
  games: GameCarousel,
};
type SectionKey = keyof typeof sectionComponents;
const sections = NavItems.filter((item) => Object.prototype.hasOwnProperty.call(sectionComponents, item.href.slice(1))).map((item) => ({
  id: item.href,
  label: item.label,
  component: sectionComponents[item.href.slice(1) as SectionKey],
}));

export const NonTechnical = () => {
  const [isLoading, setIsLoading] = useState(true);
  //const [activeSection, setActiveSection] = useState('intro');
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const dispatch = useDispatch();
  const { soundEnabled, animationLevel } = useSelector((state: RootState) => state.mode);
  const currentScrollSection = useSelector((state: RootState) => state.navigation.scrollSection);
  useEffect(() => {
    if (soundEnabled) {
      audioManager.playBackgroundMusic();
    }
    const delay = animationLevel === AnimationLevel.Low ? 1000 : animationLevel === AnimationLevel.Medium ? 2000 : 3000;
    const timer = setTimeout(() => setIsLoading(false), delay);
    return () => {
      clearTimeout(timer);
      audioManager.stopBackgroundMusic();
    };
  }, [soundEnabled, animationLevel]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      let currentSection = sections[0].id;
      for (const section of sections) {
        const element = sectionRefs.current[section.id];
        if (element && scrollPosition >= element.offsetTop) {
          currentSection = section.id;
        }
      }
      if (currentSection !== currentScrollSection) {
        dispatch(setScrollSection(currentSection));
        if (soundEnabled) {
          // audioManager.playUISound('sectionChange');
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentScrollSection, soundEnabled, dispatch]);

  const setSectionRef = (id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
  };

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
        {title.length > 0 && <motion.h2
          initial={{ x: -50, opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 1 } : { x: -50, opacity: 0 }}
          className="text-4xl font-bold mb-12 text-center"
        >
          {title}
        </motion.h2>}
        <div className="flex-grow">
          {children}
        </div>
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
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-600"
                initial={{ width: "0%" }}
                animate={{
                  width: ["0%", "40%", "60%", "80%", "100%"],
                }}
                transition={{
                  times: [0, 0.4, 0.6, 0.8, 1],
                  duration: animationLevel === AnimationLevel.Low ? 1 : animationLevel === AnimationLevel.Medium ? 2 : 3,
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
      <div className="min-h-screen">
        <div className="container mx-auto px-4">
          {sections.map((section, index) => (
            <Section
              key={index}
              id={section.id}
              title={section.label}
            >
              <div className="max-w-6xl mx-auto">
                {React.createElement(section.component)}
              </div>
            </Section>
          ))}
        </div>
      </div>
    </AnimatePresence>
  );
};