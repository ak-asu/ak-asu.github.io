import React from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { audioManager } from "@/lib/audio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAnimationLevel, ThemeMode } from "@/lib/types";
import { DisplayMode } from "./utils";
import { Monitor, PlayCircle, BadgeInfo, Code2 } from "lucide-react";

interface TVProps {
  selectedProject: Project | null;
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
}

export interface Project {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  technologies: string[];
  duration: string;
  url: string;
  media: string;
  type: string;
}

// Utility function to convert YouTube URLs to embed format
const getEmbedUrl = (url: string): string => {
  // Return empty string if no URL
  if (!url) return "";

  // Check if it's already an embed URL
  if (url.includes("youtube.com/embed/")) return url;

  // Extract video ID from various YouTube URL formats
  let videoId = "";

  // Standard YouTube URL: https://www.youtube.com/watch?v=VIDEO_ID
  const standardMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?]+)/,
  );
  if (standardMatch && standardMatch[1]) {
    videoId = standardMatch[1];
  }

  // Return the embed URL if we found a video ID, otherwise return original URL
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};

export const TV = ({
  selectedProject,
  displayMode,
  setDisplayMode,
}: TVProps) => {
  const { soundEnabled, animationLevel } = useSelector(
    (state: RootState) => state.mode,
  );
  const themeMode = useSelector((state: RootState) => state.mode.themeMode);

  const handleButtonClick = (mode: DisplayMode) => {
    if (soundEnabled) {
      audioManager.playSoundEffect("click");
    }
    // If video button is clicked but no media, show description instead
    if (mode === DisplayMode.Video && (!selectedProject?.media || selectedProject.media.trim() === "")) {
      setDisplayMode(DisplayMode.Description);
    } else {
      setDisplayMode(mode);
    }
  };

  const getAnimationProps = () => {
    const level = getAnimationLevel(animationLevel, { min: 0, max: 2 });
    switch (level) {
      case 2:
        return {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { type: "spring", bounce: 0.4 },
        };
      case 1:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.3 },
        };
      default:
        return {
          transition: { duration: 0.1 },
        };
    }
  };

  return (
    <motion.div className="flex flex-col h-full" {...getAnimationProps()}>
      <Card
        className={`relative border-palette-slate w-full h-full max-w-3xl mx-auto overflow-hidden rounded-lg flex flex-col ${themeMode !== ThemeMode.Light ? "bg-palette-gray-dark" : "bg-palette-gray-light"}`}
      >
        <div className="flex flex-col h-full w-full">
          {/* TV Screen (square, as large as possible, never overflows) */}
          <div className="flex justify-center items-start flex-shrink-0" style={{height: 'calc(100% - 40px)'}}>
            <div className="w-full h-full max-h-full max-w-full aspect-square relative flex items-center justify-center">
              <div className="absolute inset-[5%] bg-black rounded-lg overflow-hidden opacity-100 transition-opacity duration-300 border-2 border-palette-teal flex flex-col">
                {selectedProject ? (
                  <div className="w-full h-full flex flex-col">
                {displayMode === "video" && (
                  <iframe
                    src={getEmbedUrl(selectedProject.media)}
                    title={`${selectedProject.name} demo video`}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                )}
                {displayMode === "description" && (
                  <div
                    className={`p-6 h-full overflow-auto ${themeMode !== ThemeMode.Light ? "bg-palette-gray-dark/90 text-white" : "bg-palette-gray-light/90 text-palette-gray-dark"}`}
                  >
                    <h2 className="text-2xl font-bold mb-4 text-palette-teal">
                      {selectedProject.name}
                    </h2>
                    <p className="mb-4">{selectedProject.description}</p>
                    <p>
                      <span className="font-semibold text-palette-teal">
                        Duration:
                      </span>{" "}
                      {selectedProject.duration}
                    </p>
                  </div>
                )}
                {displayMode === "skills" && (
                  <div
                    className={`p-6 h-full overflow-auto ${themeMode !== ThemeMode.Light ? "bg-palette-gray-dark/90 text-white" : "bg-palette-gray-light/90 text-palette-gray-dark"}`}
                  >
                    <h3 className="text-xl font-bold mb-4 text-palette-teal">
                      Technologies Used
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedProject.technologies.map((tech) => (
                        <Badge
                          key={tech}
                          className="bg-palette-teal px-3 py-1 text-white"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    {(selectedProject.url || selectedProject.media) && (
                      <div className="mt-2">
                        <h4 className="text-lg font-semibold mb-2 text-palette-teal">Links</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {selectedProject.url && (
                            <li>
                              <a
                                href={selectedProject.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline text-palette-teal hover:text-palette-teal/80"
                              >
                                Project Link
                              </a>
                            </li>
                          )}
                          {selectedProject.media && selectedProject.media.trim() !== "" && (
                            <li>
                              <a
                                href={selectedProject.media}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline text-palette-teal hover:text-palette-teal/80"
                              >
                                Demo/Media Link
                              </a>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div
                className={`flex items-center justify-center h-full ${themeMode !== ThemeMode.Light ? "bg-palette-gray-dark/90 text-white" : "bg-palette-gray-light/90 text-palette-gray-dark"}`}
              >
                <div className="text-center p-6">
                  <Monitor
                    size={60}
                    className="mx-auto mb-4 text-palette-teal"
                  />
                  <h3 className="text-2xl font-bold mb-2">Welcome!</h3>
                  <p>Select a project from the list to get started</p>
                </div>
              </div>
            )}
          </div>
            </div>
          </div>
          {/* TV Stand & Buttons (always visible, never overflows) */}
          <div className="w-full flex justify-center items-end">
            <div className={`w-24 h-10 relative ${themeMode !== ThemeMode.Light ? "bg-palette-gray-dark" : "bg-palette-gray-light"} rounded-b-lg flex items-center justify-center`}>
              <div className="flex gap-2 z-10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleButtonClick(DisplayMode.Video)}
                  className={`border-palette-teal hover:bg-palette-slate/20 
                    ${themeMode !== ThemeMode.Light ? "bg-palette-gray-dark" : "bg-palette-gray-light"} 
                    ${displayMode === DisplayMode.Video ? "ring-2 ring-palette-teal" : ""}`}
                  disabled={!selectedProject?.media}
                >
                  <PlayCircle size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleButtonClick(DisplayMode.Description)}
                  className={`border-palette-teal hover:bg-palette-slate/20
                    ${themeMode !== ThemeMode.Light ? "bg-palette-gray-dark" : "bg-palette-gray-light"}
                    ${displayMode === DisplayMode.Description ? "ring-2 ring-palette-teal" : ""}`}
                  disabled={!selectedProject?.description}
                >
                  <BadgeInfo size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleButtonClick(DisplayMode.Skills)}
                  className={`border-palette-teal hover:bg-palette-slate/20
                    ${themeMode !== ThemeMode.Light ? "bg-palette-gray-dark" : "bg-palette-gray-light"}
                    ${displayMode === DisplayMode.Skills ? "ring-2 ring-palette-teal" : ""}`}
                  disabled={!selectedProject?.technologies.length}
                >
                  <Code2 size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
