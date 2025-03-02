export interface Project {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: string;
}

export interface Company {
  name: string;
  location: string;
  projects: Project[];
}

export interface WorkData {
  companies: Company[];
}

export type AnimationLevel = 'basic' | 'medium' | 'expert';