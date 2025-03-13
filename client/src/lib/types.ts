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

export enum AnimationLevel {
  Low = 'low',
  Medium = 'medium',
  High = 'high'
};

export const getAnimationLevel = (level: AnimationLevel, range?: {min: number, max: number}): number => {
  let tempmin = range?.min || 1;
  let tempmax = range?.max || 3;
  switch (level) {
    case AnimationLevel.Low:
      return tempmin;
    case AnimationLevel.Medium:
      return (tempmin + tempmax) / 2;
    case AnimationLevel.High:
      return tempmax;
    default:
      return tempmin;
  }
};

export enum ThemeMode {
  Light = 'light',
  Dark = 'dark',
  System = 'system'
}

