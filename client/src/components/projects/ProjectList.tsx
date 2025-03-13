import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { audioManager } from '@/lib/audio';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TV, type Project } from './TV';
import projects from '@/data/projects.json';
import { DisplayMode } from './utils';

export const ProjectList = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { soundEnabled } = useSelector((state: RootState) => state.mode);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(DisplayMode.Video);

  const handleProjectClick = (project: Project) => {
    if (soundEnabled) {
      audioManager.playSoundEffect('click');
    }
    setSelectedProject(project);
  };

  const handleProjectHover = () => {
    if (soundEnabled) {
      audioManager.playSoundEffect('hover');
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* TV Component (Left/Top) */}
      <div className="max-h-[500px] lg:col-span-3">
        <TV selectedProject={selectedProject} displayMode={displayMode} setDisplayMode={setDisplayMode} />
      </div>
      {/* Project List (Right/Bottom) */}
      <div className="max-h-[500px] lg:col-span-2">
        <Card className="border-palette-slate">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-palette-teal">Projects</CardTitle>
            <CardDescription className='text-md text-palette-teal opacity-80'>Select a project to view on the TV</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="pr-4 h-[352px]">
              <div className="space-y-4">
                {projects.map((project: Project) => (
                  <motion.div
                    key={project.id || project.name}
                    whileTap={{ scale: 0.98 }}
                    onHoverStart={handleProjectHover}
                    onClick={() => handleProjectClick(project)}
                  >
                    <Card
                      className={`cursor-pointer transition-colors hover:border-palette-teal ${selectedProject?.id === project.id ? 'border-palette-teal bg-palette-teal/10' : ''
                        }`}
                    >
                      <CardHeader className="py-3 px-4">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-4">
                        <p className="text-sm mb-3">{project.shortDescription}</p>
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.slice(0, 3).map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                          {project.technologies.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.technologies.length - 3}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
