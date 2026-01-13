/**
 * Context Manager - Smart data chunking and retrieval for portfolio data
 * Implements a keyword-based and category-based retrieval system
 * to avoid sending entire dataset to LLM at once
 */

import aboutData from "@/data/about.json";
import projectsData from "@/data/projects.json";
import skillsData from "@/data/skills.json";
import workData from "@/data/work.json";
import educationData from "@/data/education.json";
import achievementsData from "@/data/achievements.json";

// Type definitions
interface PortfolioData {
  about: typeof aboutData;
  projects: typeof projectsData;
  skills: typeof skillsData;
  work: typeof workData;
  education: typeof educationData;
  achievements: typeof achievementsData;
}

interface RetrievalResult {
  category: string;
  relevance: number;
  data: unknown;
  snippet: string;
}

/**
 * ContextManager class - Handles intelligent data retrieval
 */
export class ContextManager {
  private data: PortfolioData;
  private keywords: Map<string, string[]>;

  constructor() {
    this.data = {
      about: aboutData,
      projects: projectsData,
      skills: skillsData,
      work: workData,
      education: educationData,
      achievements: achievementsData,
    };

    // Define keyword mappings for each category
    this.keywords = new Map([
      [
        "about",
        [
          "who",
          "about",
          "aakash",
          "yourself",
          "you are",
          "introduction",
          "bio",
          "background",
          "interests",
          "passion",
        ],
      ],
      [
        "projects",
        [
          "project",
          "build",
          "built",
          "developed",
          "created",
          "app",
          "application",
          "hackathon",
          "github",
          "portfolio",
          "work sample",
          "localscholar",
          "visionforge",
          "nmtsa",
          "aim",
          "resumebotx",
        ],
      ],
      [
        "skills",
        [
          "skill",
          "technology",
          "tech",
          "stack",
          "programming",
          "language",
          "framework",
          "tool",
          "proficient",
          "expertise",
          "know",
          "python",
          "react",
          "django",
          "javascript",
          "typescript",
        ],
      ],
      [
        "work",
        [
          "work",
          "job",
          "experience",
          "professional",
          "employment",
          "company",
          "role",
          "position",
          "fractal",
          "career",
          "asu",
          "assistant",
        ],
      ],
      [
        "education",
        [
          "education",
          "degree",
          "study",
          "university",
          "college",
          "school",
          "asu",
          "arizona state",
          "iit",
          "roorkee",
          "master",
          "bachelor",
          "gpa",
          "course",
        ],
      ],
      [
        "achievements",
        [
          "achievement",
          "award",
          "recognition",
          "win",
          "winner",
          "place",
          "hackasu",
          "opportunity hack",
          "competition",
          "accomplishment",
          "honor",
        ],
      ],
    ]);
  }

  /**
   * Analyze query and determine relevant categories
   */
  private analyzeQuery(query: string): Map<string, number> {
    const lowerQuery = query.toLowerCase();
    const relevanceScores = new Map<string, number>();

    // Calculate relevance score for each category
    for (const [category, categoryKeywords] of this.keywords.entries()) {
      let score = 0;

      for (const keyword of categoryKeywords) {
        if (lowerQuery.includes(keyword)) {
          // Weight longer keywords higher
          score += keyword.length / 5 + 1;
        }
      }

      if (score > 0) {
        relevanceScores.set(category, score);
      }
    }

    // If no specific category detected, include about as general context
    if (relevanceScores.size === 0) {
      relevanceScores.set("about", 0.5);
    }

    return relevanceScores;
  }

  /**
   * Format data snippet for a category
   */
  private formatCategoryData(category: string, limit: number = 3): string {
    switch (category) {
      case "about":
        return JSON.stringify(this.data.about, null, 2);

      case "projects": {
        // Return top projects with key info
        const topProjects = this.data.projects
          .slice(0, limit)
          .map(
            (p: {
              name: string;
              shortDescription: string;
              technologies: string[];
              url: string;
            }) => ({
              name: p.name,
              shortDescription: p.shortDescription,
              technologies: p.technologies,
              url: p.url,
            }),
          );
        return JSON.stringify(topProjects, null, 2);
      }

      case "skills": {
        // Group skills by category
        const skillsByCategory: Record<string, string[]> = {};
        this.data.skills.forEach(
          (skill: { category: string; name: string; level: string }) => {
            if (!skillsByCategory[skill.category]) {
              skillsByCategory[skill.category] = [];
            }
            skillsByCategory[skill.category].push(
              `${skill.name} (${skill.level})`,
            );
          },
        );
        return JSON.stringify(skillsByCategory, null, 2);
      }

      case "work": {
        // Return work experience with key details
        const workExperience = this.data.work.map(
          (w: {
            position: string;
            company: string;
            startDate: string;
            endDate: string;
            description: string[];
            technologies: string[];
          }) => ({
            position: w.position,
            company: w.company,
            duration: `${w.startDate} to ${w.endDate}`,
            description: w.description.slice(0, 2), // First 2 points
            technologies: w.technologies,
          }),
        );
        return JSON.stringify(workExperience, null, 2);
      }

      case "education":
        return JSON.stringify(this.data.education, null, 2);

      case "achievements": {
        // Return recent achievements
        const recentAchievements = this.data.achievements
          .slice(0, limit)
          .map((a: { title: string; description: string; date: string }) => ({
            title: a.title,
            description: a.description,
            date: a.date,
          }));
        return JSON.stringify(recentAchievements, null, 2);
      }

      default:
        return "";
    }
  }

  /**
   * Get context-aware data for query
   */
  public getRelevantContext(query: string, maxCategories: number = 3): string {
    const relevanceScores = this.analyzeQuery(query);

    // Sort categories by relevance and take top N
    const sortedCategories = Array.from(relevanceScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxCategories);

    // Build context string
    let context = "# Portfolio Data\n\n";
    context += `Owner: ${this.data.about.name}\n`;
    context += `Title: ${this.data.about.title}\n\n`;

    for (const [category, score] of sortedCategories) {
      context += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;
      context += this.formatCategoryData(category);
      context += "\n\n";
    }

    return context;
  }

  /**
   * Search for specific project by name or keyword
   */
  public searchProjects(searchTerm: string): unknown[] {
    const lowerSearch = searchTerm.toLowerCase();
    return this.data.projects.filter(
      (project: {
        name: string;
        shortDescription: string;
        description: string;
        technologies: string[];
      }) =>
        project.name.toLowerCase().includes(lowerSearch) ||
        project.shortDescription.toLowerCase().includes(lowerSearch) ||
        project.description.toLowerCase().includes(lowerSearch) ||
        project.technologies.some((tech) =>
          tech.toLowerCase().includes(lowerSearch),
        ),
    );
  }

  /**
   * Get detailed project information
   */
  public getProjectDetails(projectName: string): unknown | null {
    const lowerName = projectName.toLowerCase();
    return (
      this.data.projects.find(
        (p: { name: string }) =>
          p.name.toLowerCase() === lowerName ||
          p.name.toLowerCase().includes(lowerName),
      ) || null
    );
  }

  /**
   * Get all data for a specific category
   */
  public getCategoryData(category: string): unknown {
    return this.data[category as keyof PortfolioData] || null;
  }

  /**
   * Get basic info (always included in context)
   */
  public getBasicInfo(): string {
    return `Name: ${this.data.about.name}
Title: ${this.data.about.title}
Description: ${this.data.about.description}
Interests: ${this.data.about.interests}`;
  }
}

// Export singleton instance
export const contextManager = new ContextManager();
