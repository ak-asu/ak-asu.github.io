/* eslint-disable react/no-unknown-property */
import React, { useEffect, useState, useRef, createRef } from 'react';
import { Physics } from '@react-three/cannon';
import { socialLinks, SPHERE_RADIUS, BALL_RADIUS, BallObject, PUSH_FORCE, ANIMATION_PRESETS } from './utils';
import SphericalContainer from './SphericalContainer';
import Face from './Face';
import { Ball } from './Ball';
import CameraControls from './CameraControls';
import { Vector3 } from 'three';
import { createPortal } from 'react-dom';
import DebugOverlay from './DebugOverlay';

export default function Scene({containerCenter}: {containerCenter: Vector3}) {
  const [ballRefs, setBallRefs] = useState<React.RefObject<BallObject>[]>([]);
  // State to track current animation mode
  const [animationMode, setAnimationMode] = useState<'random' | 'orbit' | 'spin' | 'helix' | 'pulse'>('random');
  // State to control debug overlay visibility
  const [showDebug, setShowDebug] = useState(false);
  
  // Track key combinations for Easter eggs
  const keysPressed = useRef<Set<string>>(new Set());
  
  // Animation frame tracking
  const animationFrameId = useRef<number | null>(null);
  const animationTime = useRef<number>(0);  useEffect(() => {
    // Create refs array properly using Array(n).fill() pattern
    const refs = socialLinks.map(() => createRef<BallObject>());
    setBallRefs(refs);
  }, []);
  
  // Initial animation sequence when the scene first loads
  useEffect(() => {
    if (ballRefs.length > 0) {
      // First highlight all balls in sequence
      setTimeout(() => {
        highlightBallsInSequence(300);
      }, 1000);
      
      // Then place them in an orbital arrangement
      setTimeout(() => {
        arrangeInOrbit();
      }, 1000 + ballRefs.length * 300 + 500);
      
      // Finally, push them with random forces after a delay
      setTimeout(() => {
        pushAllBalls();
        setAnimationMode('random');
      }, 1000 + ballRefs.length * 300 + 3000);
    }
  }, [ballRefs.length]);

  function randomSphericalPosition(): [number, number, number] {
    const r = Math.random() * (SPHERE_RADIUS - BALL_RADIUS - 0.01);
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    return [
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
    ];
  }
  // Method to apply force to all balls (example)
  const pushAllBalls = () => {
    ballRefs.forEach(ballRef => {
      if (ballRef.current) {
        // Generate random direction
        const direction: [number, number, number] = [
          (Math.random() - 0.5) * PUSH_FORCE,
          (Math.random() - 0.5) * PUSH_FORCE,
          (Math.random() - 0.5) * PUSH_FORCE
        ];
        
        // Apply impulse using the method from BallObject
        ballRef.current.applyImpulse(direction);
      }
    });
  };

  // Method to create an orbital arrangement of balls
  const arrangeInOrbit = () => {
    const ballCount = ballRefs.length;
    
    ballRefs.forEach((ballRef, index) => {
      if (ballRef.current) {
        // Calculate evenly spaced positions around a circle
        const angle = (index / ballCount) * Math.PI * 2;
        const orbitRadius = SPHERE_RADIUS * 0.7; // 70% of sphere radius
        
        const newPosition: [number, number, number] = [
          Math.cos(angle) * orbitRadius,
          Math.sin(angle) * orbitRadius,
          0 // All on the same plane for simplicity
        ];
        
        // Use the moveTo method to smoothly transition
        ballRef.current.moveTo(newPosition, 1500);
      }
    });
  };

  // Method to get a specific ball to a target position
  const moveBallTo = (ballIndex: number, position: [number, number, number]) => {
    if (ballRefs[ballIndex]?.current) {
      ballRefs[ballIndex].current.moveTo(position, 1000);
    }
  };
  // Method to highlight balls in sequence
  const highlightBallsInSequence = (delay: number = 300) => {
    ballRefs.forEach((ballRef, index) => {
      setTimeout(() => {
        if (ballRef.current && ballRef.current.highlight) {
          ballRef.current.highlight(1000);
        }
      }, delay * index);
    });
  };
  const handleFaceClick = () => {
    // First highlight balls in sequence for a cool effect
    highlightBallsInSequence(200);
    
    // Cycle through different formations when clicking the face
    setTimeout(() => {
      switch (animationMode) {
        case 'random':
          arrangeInOrbit();
          setAnimationMode('orbit');
          break;
        case 'orbit':
          setAnimationMode('spin');
          animationTime.current = 0;
          break;
        case 'spin':
          setAnimationMode('helix');
          animationTime.current = 0;
          break;
        case 'helix':
          setAnimationMode('pulse');
          animationTime.current = 0;
          break;
        case 'pulse':
        default:
          pushAllBalls();
          setAnimationMode('random');
          break;
      }
    }, ballRefs.length * 200 + 100); // Wait for the highlight sequence to complete
  }
  // Special formations and Easter eggs
  const createSpecialFormation = (formationType: string) => {
    let basePositions: [number, number, number][] = [];
    const radius = SPHERE_RADIUS * 0.7;
    
    switch (formationType) {
      case 'triangle': {
        // Triangle formation
        basePositions = [
          [0, radius * 0.8, 0],
          [-radius * 0.7, -radius * 0.4, 0],
          [radius * 0.7, -radius * 0.4, 0]
        ];
        break;
      }
        
      case 'cube': {
        // Cube corners (scaled down)
        basePositions = [
          [radius/2, radius/2, radius/2],
          [radius/2, radius/2, -radius/2],
          [radius/2, -radius/2, radius/2],
          [radius/2, -radius/2, -radius/2],
          [-radius/2, radius/2, radius/2],
          [-radius/2, radius/2, -radius/2],
          [-radius/2, -radius/2, radius/2],
          [-radius/2, -radius/2, -radius/2]
        ];
        break;
      }
        
      case 'line': {
        // Straight line
        const lineLength = radius * 1.5;
        const stepSize = lineLength / (ballRefs.length - 1 || 1);
        basePositions = ballRefs.map((_, i) => {
          return [
            -lineLength/2 + i * stepSize, 
            0, 
            0
          ] as [number, number, number];
        });
        break;
      }
        
      default:
        return;
    }
    
    // If we have more balls than defined positions, repeat the pattern
    const positions = [...Array(ballRefs.length)].map((_, i) => 
      basePositions[i % basePositions.length]
    );
    
    // Move balls to their positions
    ballRefs.forEach((ballRef, i) => {
      if (ballRef.current && i < positions.length) {
        ballRef.current.moveTo(positions[i], 1500);
      }
    });
    
    // Also highlight in sequence for visual effect
    highlightBallsInSequence(200);
  };
  
  // Key combination handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
      
      // Check for Easter egg key combinations
      if (keysPressed.current.has('control') && keysPressed.current.has('t')) {
        createSpecialFormation('triangle');
        keysPressed.current.clear();
      } else if (keysPressed.current.has('control') && keysPressed.current.has('c')) {
        createSpecialFormation('cube');
        keysPressed.current.clear();
      } else if (keysPressed.current.has('control') && keysPressed.current.has('l')) {
        createSpecialFormation('line');
        keysPressed.current.clear();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [ballRefs]);

  // Add keyboard event listener to showcase moveBallTo function
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Check if 1-9 keys are pressed (keyboard numbers)
      const num = parseInt(event.key);
      if (!isNaN(num) && num >= 1 && num <= ballRefs.length) {
        // Key 1-9 moves the corresponding ball to center
        const ballIndex = num - 1;
        moveBallTo(ballIndex, [0, 0, 0]);
      } else if (event.key === 'o') {
        // 'o' key triggers orbit arrangement
        arrangeInOrbit();
        setAnimationMode('orbit');
      } else if (event.key === 'r') {
        // 'r' key randomizes positions
        pushAllBalls();
        setAnimationMode('random');
      } else if (event.key === 'd') {
        // 'd' key toggles debug overlay
        setShowDebug(prevState => !prevState);
      } else if (event.key === 's') {
        // 's' key starts spin animation
        setAnimationMode('spin');
        // Reset animation time
        animationTime.current = 0;
      } else if (event.key === 'h') {
        // 'h' key starts helix animation
        setAnimationMode('helix');
        // Reset animation time
        animationTime.current = 0;
      } else if (event.key === 'p') {
        // 'p' key starts pulse animation
        setAnimationMode('pulse');
        // Reset animation time
        animationTime.current = 0;
      } else if (event.key === 'l') {
        // 'l' key highlights balls in sequence
        highlightBallsInSequence(300);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [ballRefs]);

  // Animation loop for continuous animations
  useEffect(() => {
    // Stop any existing animation
    if (animationFrameId.current !== null) {
      cancelAnimationFrame(animationFrameId.current);
    }

    // Only run continuous animations for certain modes
    if (animationMode === 'random' || animationMode === 'orbit') {
      return;
    }

    const animate = () => {
      animationTime.current += 0.01;
      const time = animationTime.current;

      if (animationMode === 'spin') {
        // Spinning animation
        ballRefs.forEach((ballRef, index) => {
          if (ballRef.current) {
            const angle = time + (index / ballRefs.length) * Math.PI * 2;
            const position = ANIMATION_PRESETS.SPIN(angle);
            ballRef.current.moveTo(position, 100);
          }
        });
      } else if (animationMode === 'helix') {
        // Helix animation
        ballRefs.forEach((ballRef, index) => {
          if (ballRef.current) {
            const angle = time + (index / ballRefs.length) * Math.PI * 2;
            const height = Math.sin(time + index * 0.5) * SPHERE_RADIUS * 0.5;
            const position = ANIMATION_PRESETS.HELIX(angle, height);
            ballRef.current.moveTo(position, 100);
          }
        });
      } else if (animationMode === 'pulse') {
        // Pulse animation
        const normalizedPositions: [number, number, number][] = ballRefs.map((_, index) => {
          const angle = (index / ballRefs.length) * Math.PI * 2;
          return [Math.cos(angle), Math.sin(angle), 0];
        });

        ballRefs.forEach((ballRef, index) => {
          if (ballRef.current) {
            const position = ANIMATION_PRESETS.PULSE(normalizedPositions[index], time);
            ballRef.current.moveTo(position, 100);
          }
        });
      }

      // Continue animation loop
      animationFrameId.current = requestAnimationFrame(animate);
    };

    // Start animation loop
    animationFrameId.current = requestAnimationFrame(animate);

    // Cleanup function
    return () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [animationMode, ballRefs]);

  // Wait until refs are initialized
  if (ballRefs.length === 0) {
    return null;
  }  return (
    <>
      <group>
        <ambientLight intensity={0} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <Physics
          gravity={[0, 0, 0]}
          defaultContactMaterial={{ restitution: 0.8, friction: 0.1 }}
          stepSize={1 / 120}
        >
          <SphericalContainer />
          <Face handleFaceClick={handleFaceClick} />
          {socialLinks.map((link, i) => (
            <Ball
              key={link.name}
              position={randomSphericalPosition()}
              name={link.name}
              url={link.url}
              color={link.color}
              icon={link.icon}
              ballIndex={i}
              ref={ballRefs[i]}
              containerCenter={containerCenter}
            />
          ))}
        </Physics>
        <CameraControls setDragging={() => {}} />
      </group>
      {showDebug && createPortal(<DebugOverlay visible={true} currentMode={animationMode} />, document.body)}
    </>
  );
}