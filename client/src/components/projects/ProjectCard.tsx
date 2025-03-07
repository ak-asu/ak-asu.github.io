import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from '../ui/card';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { audioManager } from '@/lib/audio';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface Project {
  title: string;
  description: string;
  techStack: string[];
  duration: string;
  videoUrl: string;
}

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const { soundEnabled, animationLevel } = useSelector((state: RootState) => state.mode);

  const handleHover = () => {
    if (soundEnabled) {
      audioManager.playSoundEffect('hover');
    }
  };

  const getAnimationProps = () => {
    switch (animationLevel) {
      case 'expert':
        return {
          whileHover: { scale: 1.05, rotateY: 5 },
          transition: { type: "spring", stiffness: 400, damping: 10 }
        };
      case 'medium':
        return {
          whileHover: { scale: 1.03 },
          transition: { type: "spring", stiffness: 300 }
        };
      default:
        return {
          whileHover: { scale: 1.01 },
          transition: { duration: 0.2 }
        };
    }
  };

  return (
    <motion.div
      {...getAnimationProps()}
      onHoverStart={handleHover}
      role="article"
      aria-label={`Project: ${project.title}`}
    >
      <Card className="overflow-hidden border-2 border-transparent hover:border-primary/20 transition-colors duration-300">
        <CardHeader className="relative">
          <h3 className="text-xl font-bold group flex items-center gap-2">
            {project.title}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
                    aria-label={`More information about ${project.title}`}
                  >
                    <Info className="h-4 w-4 opacity-50 hover:opacity-100 transition-opacity cursor-help" aria-hidden="true" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div className="space-y-2">
                    <p>{project.description}</p>
                    <p className="text-sm opacity-70">Duration: {project.duration}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h3>
        </CardHeader>
        <CardContent>
          <div 
            className="aspect-video mb-4 overflow-hidden rounded-lg bg-black/5"
            role="presentation"
          >
            <iframe
              src={project.videoUrl}
              className="w-full h-full"
              allowFullScreen
              title={`Demo video for ${project.title}`}
            />
          </div>
          <div 
            className="flex flex-wrap gap-2"
            role="list"
            aria-label="Technologies used"
          >
            {project.techStack.map((tech) => (
              <motion.span
                key={tech}
                className="px-2 py-1 bg-primary/10 rounded-full text-sm"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                role="listitem"
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};