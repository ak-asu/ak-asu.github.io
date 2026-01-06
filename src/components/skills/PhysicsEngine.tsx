import { useCallback, useRef } from "react";
import { usePhysicsSimulation } from "../../hooks/usePhysicsSimulation";
import { useRequestAnimationFrame } from "../../hooks/useRequestAnimationFrame";

interface PhysicsEngineProps {
  children: React.ReactNode;
  structureRadius: number;
  boundaryRadius: number;
  isActive: boolean;
  animationEnabled: boolean;
}

export function PhysicsEngine({
  children,
  structureRadius,
  boundaryRadius,
  isActive,
  animationEnabled,
}: PhysicsEngineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    physics,
    updatePhysics,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  } = usePhysicsSimulation({
    structureRadius,
    boundaryRadius,
    energyLoss: 0.9,
    maxVelocity: 500,
    minVelocity: 1,
    animationEnabled,
  });

  // Update physics on each frame
  useRequestAnimationFrame(updatePhysics, isActive && !physics.isDragging);

  // Pointer event handlers
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      handleDragStart(e.clientX, e.clientY);

      if (containerRef.current) {
        containerRef.current.setPointerCapture(e.pointerId);
      }
    },
    [handleDragStart],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (physics.isDragging) {
        e.preventDefault();
        handleDragMove(e.clientX, e.clientY);
      }
    },
    [physics.isDragging, handleDragMove],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (physics.isDragging) {
        e.preventDefault();
        handleDragEnd();

        if (containerRef.current) {
          containerRef.current.releasePointerCapture(e.pointerId);
        }
      }
    },
    [physics.isDragging, handleDragEnd],
  );

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{
        transform: `translate(${physics.x}px, ${physics.y}px)`,
        cursor: physics.isDragging ? "grabbing" : "grab",
        touchAction: "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {children}
    </div>
  );
}
