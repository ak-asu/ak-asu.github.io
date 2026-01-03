import { useState, useCallback, useRef } from "react";

export interface PhysicsState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isDragging: boolean;
}

interface PhysicsConfig {
  structureRadius: number;
  boundaryRadius: number;
  energyLoss: number;
  maxVelocity: number;
  minVelocity: number;
}

interface DragState {
  startX: number;
  startY: number;
  startTime: number;
  lastX: number;
  lastY: number;
  lastTime: number;
}

const DEFAULT_CONFIG: PhysicsConfig = {
  structureRadius: 0,
  boundaryRadius: 0,
  energyLoss: 0.9,
  maxVelocity: 500,
  minVelocity: 1,
};

/**
 * Custom hook for physics simulation with collision detection
 */
export function usePhysicsSimulation(config: Partial<PhysicsConfig> = {}) {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  const [physics, setPhysics] = useState<PhysicsState>({
    x: 0,
    y: 0,
    vx: 100,
    vy: 80,
    isDragging: false,
  });

  const dragStateRef = useRef<DragState | null>(null);

  /**
   * Update physics state with collision detection
   */
  const updatePhysics = useCallback(
    (deltaTime: number) => {
      setPhysics((prev) => {
        if (prev.isDragging) return prev;

        // Update position based on velocity
        let newX = prev.x + prev.vx * deltaTime;
        let newY = prev.y + prev.vy * deltaTime;
        let newVx = prev.vx;
        let newVy = prev.vy;

        // Check collision with circular boundary
        const distFromCenter = Math.sqrt(newX * newX + newY * newY);

        if (
          distFromCenter + fullConfig.structureRadius >
          fullConfig.boundaryRadius
        ) {
          // Collision detected - reflect velocity

          // Normalize direction vector from center
          const nx = newX / distFromCenter;
          const ny = newY / distFromCenter;

          // Reflect velocity vector using: v' = v - 2(v·n)n
          const dotProduct = newVx * nx + newVy * ny;
          newVx = newVx - 2 * dotProduct * nx;
          newVy = newVy - 2 * dotProduct * ny;

          // Apply energy loss
          newVx *= fullConfig.energyLoss;
          newVy *= fullConfig.energyLoss;

          // Reposition to valid boundary position
          const maxDist =
            fullConfig.boundaryRadius - fullConfig.structureRadius;
          newX = nx * maxDist * 0.99; // Slight inset to prevent stuck state
          newY = ny * maxDist * 0.99;
        }

        // Stop if velocity too low
        const speed = Math.sqrt(newVx * newVx + newVy * newVy);
        if (speed < fullConfig.minVelocity) {
          newVx = 0;
          newVy = 0;
        }

        return {
          ...prev,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
        };
      });
    },
    [fullConfig],
  );

  /**
   * Handle drag start
   */
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    const now = Date.now();
    dragStateRef.current = {
      startX: clientX,
      startY: clientY,
      startTime: now,
      lastX: clientX,
      lastY: clientY,
      lastTime: now,
    };

    setPhysics((prev) => ({
      ...prev,
      isDragging: true,
      vx: 0,
      vy: 0,
    }));
  }, []);

  /**
   * Handle drag move
   */
  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!dragStateRef.current) return;

    const dx = clientX - dragStateRef.current.lastX;
    const dy = clientY - dragStateRef.current.lastY;

    dragStateRef.current.lastX = clientX;
    dragStateRef.current.lastY = clientY;
    dragStateRef.current.lastTime = Date.now();

    setPhysics((prev) => {
      if (!prev.isDragging) return prev;

      return {
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy,
      };
    });
  }, []);

  /**
   * Handle drag end - calculate velocity from drag motion
   */
  const handleDragEnd = useCallback(() => {
    if (!dragStateRef.current) return;

    const now = Date.now();
    const dt = (now - dragStateRef.current.lastTime) / 1000;

    // Calculate velocity from recent movement
    const dx = dragStateRef.current.lastX - dragStateRef.current.startX;
    const dy = dragStateRef.current.lastY - dragStateRef.current.startY;
    const totalDt = (now - dragStateRef.current.startTime) / 1000;

    let vx = 0;
    let vy = 0;

    if (totalDt > 0.05) {
      // Only calculate if drag lasted long enough
      vx = dx / totalDt;
      vy = dy / totalDt;

      // Clamp to max velocity
      const speed = Math.sqrt(vx * vx + vy * vy);
      if (speed > fullConfig.maxVelocity) {
        const scale = fullConfig.maxVelocity / speed;
        vx *= scale;
        vy *= scale;
      }
    }

    dragStateRef.current = null;

    setPhysics((prev) => ({
      ...prev,
      isDragging: false,
      vx,
      vy,
    }));
  }, [fullConfig.maxVelocity]);

  return {
    physics,
    updatePhysics,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    setPhysics,
  };
}
