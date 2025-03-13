export interface Skill {
  name: string;
  level: string;
  icon: string;
  category?: string;
}

export type AnimationStyle = 'linear' | 'easeInOut' | 'bounce' | 'spring' | 'none';

export const levelToPercentage = (level: string): number => {
  switch (level.toLowerCase()) {
    case 'beginner': return 25;
    case 'intermediate': return 60;
    case 'advanced': return 85;
    case 'expert': return 95;
    default: return 50;
  }
};
