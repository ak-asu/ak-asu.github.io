import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WorkEntry {
  position: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  description: string[];
  technologies: string[];
  links: Array<{
    title: string;
    url: string;
    type: string;
  }>;
  type: string;
}

interface WorkDetailsProps {
  selectedWork: WorkEntry;
  isMobile: boolean;
}

const WorkDetails: React.FC<WorkDetailsProps> = ({
  selectedWork,
  isMobile,
}) => {
  const [activeTab, setActiveTab] = useState<
    "description" | "technologies" | "links"
  >("description");

  return (
    <motion.div
      key={`${selectedWork.company}-${selectedWork.position}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-palette-teal/10 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-palette-teal"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 8v6a2 2 0 002 2h4a2 2 0 002-2V8M8 8V6a2 2 0 012-2h4a2 2 0 002-2V8"
              />
            </svg>
          </div>
          <div>
            <h3
              className={`${isMobile ? "text-lg" : "text-xl"} font-bold text-foreground`}
            >
              {selectedWork.position}
            </h3>
            <p className="text-palette-teal font-medium">
              {selectedWork.company}
            </p>
          </div>
        </div>

        {/* Meta Information */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>
              {new Date(selectedWork.startDate).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}{" "}
              -
              {selectedWork.endDate
                ? new Date(selectedWork.endDate).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })
                : " Present"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{selectedWork.location}</span>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium
            ${
              selectedWork.type === "professional"
                ? "bg-palette-teal/10 text-palette-teal border border-palette-teal/20"
                : "bg-amber-500/10 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-500/20 dark:border-amber-800"
            }`}
          >
            {selectedWork.type.charAt(0).toUpperCase() +
              selectedWork.type.slice(1)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border px-4">
        {["description", "technologies", "links"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 ${isMobile ? "text-xs" : "text-sm"} font-medium rounded-t-md transition-colors ${
              activeTab === tab
                ? "bg-palette-teal/10 text-palette-teal border-b-2 border-palette-teal"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab(tab as typeof activeTab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-palette-teal/30 scrollbar-track-transparent">
        <AnimatePresence mode="wait">
          {activeTab === "description" && (
            <motion.div
              key="description"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h4 className="text-lg font-semibold text-foreground mb-3">
                Key Responsibilities & Achievements
              </h4>
              <ul className="space-y-3">
                {selectedWork.description.map((desc, index) => (
                  <li
                    key={`work-detail-${index}`}
                    className="flex items-start gap-3"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-palette-teal mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground leading-relaxed">
                      {desc}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {activeTab === "technologies" && (
            <motion.div
              key="technologies"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h4 className="text-lg font-semibold text-foreground mb-3">
                Technologies & Tools
              </h4>
              {selectedWork.technologies.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {selectedWork.technologies.map((tech, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-palette-teal/5 dark:bg-palette-teal/10 rounded-lg border border-palette-teal/20 dark:border-palette-teal/10"
                    >
                      <div className="w-2 h-2 rounded-full bg-palette-teal"></div>
                      <span className="text-sm text-foreground">{tech}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  No specific technologies listed for this position.
                </p>
              )}
            </motion.div>
          )}

          {activeTab === "links" && (
            <motion.div
              key="links"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h4 className="text-lg font-semibold text-foreground mb-3">
                Related Links
              </h4>
              {selectedWork.links.length > 0 ? (
                <div className="space-y-3">
                  {selectedWork.links.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-palette-teal/5 dark:bg-palette-teal/10 rounded-lg border border-palette-teal/20 dark:border-palette-teal/10 hover:bg-palette-teal/10 dark:hover:bg-palette-teal/20 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-full bg-palette-teal/10 dark:bg-palette-teal/20 flex items-center justify-center group-hover:bg-palette-teal/20 dark:group-hover:bg-palette-teal/30 transition-colors">
                        {link.type === "github" ? (
                          <svg
                            className="w-4 h-4 text-palette-teal"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4 text-palette-teal"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h5 className="font-medium text-foreground group-hover:text-palette-teal transition-colors">
                          {link.title}
                        </h5>
                        <p className="text-xs text-muted-foreground">
                          {link.type}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  No related links available for this position.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default WorkDetails;
