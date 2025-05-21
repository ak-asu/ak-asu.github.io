import React, { useRef, useState, useMemo, Suspense, useCallback, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import {
  PerspectiveCamera, 
  Environment, 
  Html, 
  useProgress,
  Line,
  Ring
} from '@react-three/drei';
import * as THREE from 'three';
import Ball from './Ball';

type LogoType = 'github' | 'linkedin' | 'none';

// Loading indicator component
const Loader = () => {
  const { progress } = useProgress();
  return <Html center><div style={{ color: 'white' }}>Loading... {progress.toFixed(0)}%</div></Html>;
};

// This allows us to catch Three.js specific errors
class ThreeErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Three.js error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div style={{ color: 'red', padding: '20px' }}>
        Something went wrong with the 3D rendering. Please refresh the page.
      </div>;
    }

    return this.props.children;
  }
}

// Custom hook to track mouse position in 3D space
const useMouseInSphere = (sphereRadius = 8) => {
  const { camera, mouse, raycaster, scene } = useThree();
  const [isInside, setIsInside] = useState(false);
  const [intersection, setIntersection] = useState<THREE.Vector3 | null>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (!sphereRef.current) return;
    
    // Update the raycaster with the current mouse position
    raycaster.setFromCamera(mouse, camera);
    
    // Check if the ray intersects with the invisible sphere
    const intersects = raycaster.intersectObject(sphereRef.current);
    
    if (intersects.length > 0) {
      setIsInside(true);
      setIntersection(intersects[0].point);
    } else {
      setIsInside(false);
      setIntersection(null);
    }
  });
  
  return { isInside, intersection, sphereRef };
};

// Arrow component that follows the mouse
const CursorArrow = ({ from = [0, 0, 0], to, visible = false }: { 
  from?: [number, number, number], 
  to: THREE.Vector3 | null, 
  visible: boolean 
}) => {
  if (!visible || !to) return null;
  
  const points = [
    new THREE.Vector3(...from),
    to
  ];
  
  return (
    <Line
      points={points}
      color="white"
      lineWidth={1}
      dashed
      dashSize={0.2}
      dashScale={1}
      dashOffset={0}
    />
  );
};

// Simple circular boundary that always faces the camera
const CircularBoundary = ({ radius }: { radius: number }) => {
  const { camera } = useThree();
  const circleRef = useRef<THREE.Mesh>(null);
  
  // Make circle always face the camera
  useFrame(() => {
    if (circleRef.current) {
      circleRef.current.quaternion.copy(camera.quaternion);
    }
  });
  
  return (
    <mesh ref={circleRef}>
      <ringGeometry args={[radius * 0.98, radius, 64]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.3} side={THREE.DoubleSide} />
    </mesh>
  );
};

// Bullet component
const Bullet = ({ 
  initialPosition = [0, 0, 0], 
  direction, 
  speed = 0.2, 
  onHit 
}: { 
  initialPosition?: [number, number, number], 
  direction: THREE.Vector3,
  speed?: number,
  onHit: () => void
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const normalizedDirection = useMemo(() => direction.clone().normalize(), [direction]);
  
  useFrame(() => {
    if (meshRef.current) {
      // Move bullet in its direction
      meshRef.current.position.add(normalizedDirection.clone().multiplyScalar(speed));
    }
  });
  
  return (
    <mesh ref={meshRef} position={initialPosition}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
  );
};

// Enhanced ball data type with physics properties
type BallDataWithPhysics = {
  position: [number, number, number];
  velocity: THREE.Vector3;
  size: number;
  logoType: LogoType;
  color: string;
  opacity: number;
  speed: number;
};

// Inner component that will use R3F hooks properly inside Canvas
type SphereSceneProps = {
  isDragging: boolean;
  onGroupRef: (ref: THREE.Group) => void;
  ballsData: Array<{
    position: [number, number, number];
    size: number;
    logoType: LogoType;
    color: string;
    opacity: number;
    speed: number;
  }>;
}

const SphereScene: React.FC<SphereSceneProps> = ({ 
  isDragging, 
  onGroupRef, 
  ballsData 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const sphereRadius = 8.5; // Slightly larger than the ball positions
  const { isInside, intersection, sphereRef } = useMouseInSphere(sphereRadius);
  const { mouse, camera } = useThree();
  const [bullets, setBullets] = useState<Array<{
    id: number,
    position: [number, number, number],
    direction: THREE.Vector3
  }>>([]);
  const [nextBulletId, setNextBulletId] = useState(0);
  const [isLeftClicking, setIsLeftClicking] = useState(false);
  const bulletInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Add physics to balls - initialize with velocities
  const [physicsBalls, setPhysicsBalls] = useState<BallDataWithPhysics[]>(() => 
    ballsData.map(ball => ({
      ...ball,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.05,
        (Math.random() - 0.5) * 0.05,
        (Math.random() - 0.5) * 0.05
      )
    }))
  );
  
  // Set ref to parent component
  useEffect(() => {
    if (groupRef.current) {
      onGroupRef(groupRef.current);
    }
  }, [onGroupRef]);
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (bulletInterval.current) {
        clearInterval(bulletInterval.current);
      }
    };
  }, []);
  
  // Create ray from camera through mouse position
  const getMouseRay = useCallback(() => {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    return raycaster.ray;
  }, [mouse, camera]);
  
  // Handle bullet firing
  const startFiringBullets = useCallback(() => {
    if (bulletInterval.current) return;
    
    // Fire initial bullet
    const ray = getMouseRay();
    const newBullet = {
      id: nextBulletId,
      position: [0, 0, 0] as [number, number, number],
      direction: ray.direction.clone()
    };
    
    setBullets(prev => [...prev, newBullet]);
    setNextBulletId(prevId => prevId + 1);
    
    // Set up interval for continuous firing while holding click
    bulletInterval.current = setInterval(() => {
      const ray = getMouseRay();
      const newBullet = {
        id: nextBulletId,
        position: [0, 0, 0] as [number, number, number],
        direction: ray.direction.clone()
      };
      
      setBullets(prev => [...prev, newBullet]);
      setNextBulletId(prevId => prevId + 1);
    }, 200); // Fire bullet every 200ms
  }, [nextBulletId, getMouseRay]);
  
  // Handle stopping bullet firing
  const stopFiringBullets = useCallback(() => {
    if (bulletInterval.current) {
      clearInterval(bulletInterval.current);
      bulletInterval.current = null;
    }
  }, []);
  
  // Handle mouse events for bullet firing
  const handleMouseDown = useCallback((e: any) => {
    if (e.button === 0 && isInside && !e.object.isBall) { // Left click and not on a ball
      setIsLeftClicking(true);
      startFiringBullets();
    }
  }, [isInside, startFiringBullets]);
  
  const handleMouseUp = useCallback(() => {
    if (isLeftClicking) {
      setIsLeftClicking(false);
      stopFiringBullets();
    }
  }, [isLeftClicking, stopFiringBullets]);
  
  // Check for bullet collisions with sphere boundary or balls
  useFrame(() => {
    // Update ball physics
    setPhysicsBalls(prevBalls => {
      // Create a new array to hold updated balls
      const updatedBalls = [...prevBalls];
      
      // Update each ball position based on velocity
      for (let i = 0; i < updatedBalls.length; i++) {
        const ball = updatedBalls[i];
        
        // Create Vector3 from position array for easier math
        const posVec = new THREE.Vector3(...ball.position);
        
        // Add velocity to position
        posVec.add(ball.velocity);
        
        // Check for sphere boundary collision
        const distanceFromCenter = posVec.length();
        const maxAllowedDistance = sphereRadius - ball.size;
        
        if (distanceFromCenter > maxAllowedDistance) {
          // Ball hit sphere boundary - reflect velocity and reduce by 10%
          const normal = posVec.clone().normalize();
          ball.velocity.reflect(normal);
          ball.velocity.multiplyScalar(0.9); // Reduce momentum by 10%
          
          // Adjust position to be exactly at boundary
          posVec.normalize().multiplyScalar(maxAllowedDistance);
        }
        
        // Check for ball-to-ball collisions
        for (let j = i + 1; j < updatedBalls.length; j++) {
          const otherBall = updatedBalls[j];
          const otherPos = new THREE.Vector3(...otherBall.position);
          
          const minDistance = ball.size + otherBall.size;
          const actualDistance = posVec.distanceTo(otherPos);
          
          if (actualDistance < minDistance) {
            // Balls are colliding - calculate collision response
            const collisionNormal = new THREE.Vector3().subVectors(posVec, otherPos).normalize();
            
            // Calculate relative velocity
            const relativeVelocity = new THREE.Vector3().subVectors(
              ball.velocity, 
              otherBall.velocity
            );
            
            // Apply impulse to both balls
            const impulse = collisionNormal.clone().multiplyScalar(
              relativeVelocity.dot(collisionNormal)
            );
            
            ball.velocity.sub(impulse);
            otherBall.velocity.add(impulse);
            
            // Reduce momentum for both balls
            ball.velocity.multiplyScalar(0.9);
            otherBall.velocity.multiplyScalar(0.9);
            
            // Separate balls to prevent sticking
            const overlap = minDistance - actualDistance;
            posVec.add(collisionNormal.clone().multiplyScalar(overlap * 0.5));
            otherPos.sub(collisionNormal.clone().multiplyScalar(overlap * 0.5));
            
            // Update other ball position
            otherBall.position = [otherPos.x, otherPos.y, otherPos.z];
          }
        }
        
        // Update position
        ball.position = [posVec.x, posVec.y, posVec.z];
      }
      
      return updatedBalls;
    });
    
    // Remove bullets that have hit something
    setBullets(prevBullets => {
      return prevBullets.filter(bullet => {
        if (!groupRef.current) return false;
        
        // Convert bullet position to a Vector3
        const bulletPos = new THREE.Vector3(...bullet.position);
        
        // Check if bullet has reached or crossed the sphere boundary
        // Use squared distance for performance and exact boundary checking
        const distanceSquared = bulletPos.lengthSq();
        const radiusSquared = sphereRadius * sphereRadius;
        
        if (distanceSquared >= radiusSquared) {
          return false; // Remove bullet exactly at the boundary
        }
        
        // Check collision with balls - directly use ball positions without refs
        for (let i = 0; i < physicsBalls.length; i++) {
          const ballPos = new THREE.Vector3(...physicsBalls[i].position);
          
          // Calculate distance
          const distance = bulletPos.distanceTo(ballPos);
          
          // Check if bullet hit ball (using ball size for collision)
          if (distance < (physicsBalls[i]?.size || 0.5) + 0.1) {
            // Apply impulse to the ball in the bullet's direction
            setPhysicsBalls(prevBalls => {
              const updatedBalls = [...prevBalls];
              // Add bullet's momentum to the ball
              const impulseStrength = 0.2; // Adjust for desired effect
              const impulse = bullet.direction.clone().multiplyScalar(impulseStrength);
              updatedBalls[i].velocity.add(impulse);
              return updatedBalls;
            });
            
            return false; // Remove bullet
          }
        }
        
        // Update bullet position
        const newPos = new THREE.Vector3(...bullet.position);
        newPos.add(bullet.direction.clone().multiplyScalar(0.2));
        bullet.position = [newPos.x, newPos.y, newPos.z];
        
        return true; // Keep bullet
      });
    });
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 15]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      {/* Invisible sphere for mouse detection */}
      <mesh 
        ref={sphereRef} 
        visible={false}
        onPointerDown={handleMouseDown}
        onPointerUp={handleMouseUp}
      >
        <sphereGeometry args={[sphereRadius, 32, 32]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Simple 2D circular boundary */}
      <CircularBoundary radius={sphereRadius} />
      
      {/* Cursor-following arrow */}
      <CursorArrow from={[0, 0, 0]} to={intersection} visible={isInside} />
      
      {/* Bullets */}
      {bullets.map((bullet) => (
        <Bullet 
          key={bullet.id}
          initialPosition={bullet.position}
          direction={bullet.direction}
          onHit={() => {
            setBullets(prev => prev.filter(b => b.id !== bullet.id));
          }}
        />
      ))}
      
      <group ref={groupRef}>
        {/* Render balls with physics properties */}
        {physicsBalls.map((ball, index) => (
          <Ball 
            key={index}
            position={ball.position}
            size={ball.size}
            logoType={ball.logoType}
            color={ball.color}
            opacity={ball.opacity}
            speed={ball.speed}
            url={ball.logoType === 'github' ? 'https://github.com' : 
                ball.logoType === 'linkedin' ? 'https://linkedin.com' : undefined}
          />
        ))}
      </group>
      
      <Environment preset="sunset" />
    </>
  );
};

const RotatableSphere: React.FC = () => {
  const [groupRef, setGroupRef] = useState<THREE.Group | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPointerPosition, setLastPointerPosition] = useState({ x: 0, y: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  // Detect touch device
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Handle group ref from child component
  const handleGroupRef = useCallback((ref: THREE.Group) => {
    setGroupRef(ref);
  }, []);
  
  // Generate positions for balls in a spherical pattern with URLs
  const ballsData = useMemo(() => {
    const data = [];
    const radius = 8; // Sphere radius
    const innerFactor = 0.6; // Place balls at 60% of the radius
    
    // Positions for exactly 2 balls inside the sphere
    const positions = [
      [radius * innerFactor, 0, 0], // Right side, inside sphere
      [-radius * innerFactor, 0, 0]  // Left side, inside sphere
    ];
    
    // Create the balls - one GitHub and one LinkedIn
    data.push({
      position: positions[0] as [number, number, number],
      size: 1.5, // Larger balls
      logoType: 'github' as LogoType,
      color: '#24292e',
      opacity: 0.7,
      speed: 0.005
    });
    
    data.push({
      position: positions[1] as [number, number, number],
      size: 1.5, // Larger balls
      logoType: 'linkedin' as LogoType,
      color: '#0077b5',
      opacity: 0.7,
      speed: 0.005
    });
    
    return data;
  }, []);

  // Handle pointer events in a unified way
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Right-click on desktop or any touch on mobile
    if (e.button === 2 || isTouchDevice) {
      e.preventDefault();
      setIsDragging(true);
      setLastPointerPosition({ x: e.clientX, y: e.clientY });
    }
  }, [isTouchDevice]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (isDragging && groupRef) {
      const deltaX = e.clientX - lastPointerPosition.x;
      const deltaY = e.clientY - lastPointerPosition.y;
      
      groupRef.rotation.y += deltaX * 0.01;
      groupRef.rotation.x += deltaY * 0.01;
      
      setLastPointerPosition({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, lastPointerPosition, groupRef]);

  // Handle context menu to prevent browser menu on right-click
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return (
    <ThreeErrorBoundary>
      <div 
        style={{ 
          width: '100%', 
          height: '100%',
          position: 'relative'
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onContextMenu={handleContextMenu}
      >
        <Canvas>
          <Suspense fallback={<Loader />}>
            <SphereScene 
              isDragging={isDragging}
              onGroupRef={handleGroupRef}
              ballsData={ballsData}
            />
          </Suspense>
        </Canvas>
      </div>
    </ThreeErrorBoundary>
  );
};

export default RotatableSphere;
