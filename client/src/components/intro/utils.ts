import { Object3D, Vector3 } from 'three';
import { PublicApi } from '@react-three/cannon';

export const socialLinks = [
  { name: 'GitHub', url: 'https://github.com/', color: '#333', icon: '🐙' },
  { name: 'LinkedIn', url: 'https://linkedin.com/', color: '#0077B5', icon: '🔗' },
  { name: 'Inventak', url: 'https://twitter.com/', color: '#1DA1F2', icon: '🐦' }
];

export const SPHERE_RADIUS = 1; // Radius of the containing sphere
export const BALL_RADIUS = 0.1;   // Radius of each ball
export const PUSH_FORCE = 2.0;    // Force applied when clicking the face
export const MIN_VELOCITY = 0.4;  // Minimum speed for balls
export const INITIAL_VELOCITY_MULTIPLIER = 2; // Initial speed multiplier
export const ENERGY_REMAIN = 0.92; // Energy remaining after collision

// Animation presets that can be used by BallObject instances
export const ANIMATION_PRESETS = {
  SPIN: (angle: number): [number, number, number] => {
    const r = SPHERE_RADIUS * 0.7;
    return [
      Math.cos(angle) * r,
      Math.sin(angle) * r,
      0,
    ];
  },
  HELIX: (angle: number, height: number): [number, number, number] => {
    const r = SPHERE_RADIUS * 0.6;
    return [
      Math.cos(angle) * r,
      Math.sin(angle) * r,
      height,
    ];
  },
  PULSE: (centerPos: [number, number, number], time: number): [number, number, number] => {
    const pulseRadius = (Math.sin(time) + 1) * 0.5 * SPHERE_RADIUS * 0.8;
    const [x, y, z] = centerPos;
    return [
      x * pulseRadius,
      y * pulseRadius,
      z * pulseRadius,
    ];
  }
};

export type BallObject = {
  ref: React.RefObject<Object3D>;
  api: PublicApi;
  link?: { name: string; url: string; color: string; icon: string };
  initialPosition?: [number, number, number]; 
  index?: number;
  velocity?: Vector3;
  
  // Physics methods
  applyImpulse: (force: [number, number, number], worldPoint?: [number, number, number]) => void;
  setVelocity: (velocity: [number, number, number]) => void;
  
  // Utility methods
  getPosition: () => Vector3;
  getVelocity: () => Vector3;
  moveTo: (position: [number, number, number], duration?: number) => void;
  
  // Collision and interaction methods
  onCollideWithBall?: (otherBall: BallObject) => void;
  highlight?: (duration?: number) => void;
};