import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Physics, useSphere, usePlane, useBox } from '@react-three/cannon';
import { Vector3, Quaternion } from 'three';

// Constants for the cube
const CUBE_SIZE = 5;
const HALF_SIZE = CUBE_SIZE / 2;
const BALL_RADIUS = 0.5;
const DAMPING = 0.8; // Bounce damping factor

// Define props interface for Ball component
interface BallProps {
  position: [number, number, number];
  text: string;
  url?: string;
}

// Ball component with collision detection and containment
function Ball({ position, text, url }: BallProps) {
  const [ref, api] = useSphere(() => ({ 
    mass: 1, 
    position, 
    args: [BALL_RADIUS],
    linearDamping: 0.2 
  }));

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const velocity = useRef([0, 0, 0]);
  
  // Keep track of the ball's velocity for containment check
  useEffect(() => {
    const unsubscribe = api.velocity.subscribe(v => {
      velocity.current = v;
    });
    return unsubscribe;
  }, [api]);

  // Check if ball is going to exit the cube boundaries and bounce it back
  useFrame(() => {
    const [x, y, z] = position;
    
    // Check if ball is near the boundaries
    if (Math.abs(x) > HALF_SIZE - BALL_RADIUS) {
      api.velocity.set(-velocity.current[0] * DAMPING, velocity.current[1], velocity.current[2]);
      api.position.set(
        x > 0 ? HALF_SIZE - BALL_RADIUS - 0.01 : -HALF_SIZE + BALL_RADIUS + 0.01,
        y,
        z
      );
    }
    
    if (Math.abs(y) > HALF_SIZE - BALL_RADIUS) {
      api.velocity.set(velocity.current[0], -velocity.current[1] * DAMPING, velocity.current[2]);
      api.position.set(
        x,
        y > 0 ? HALF_SIZE - BALL_RADIUS - 0.01 : -HALF_SIZE + BALL_RADIUS + 0.01,
        z
      );
    }
    
    if (Math.abs(z) > HALF_SIZE - BALL_RADIUS) {
      api.velocity.set(velocity.current[0], velocity.current[1], -velocity.current[2] * DAMPING);
      api.position.set(
        x,
        y,
        z > 0 ? HALF_SIZE - BALL_RADIUS - 0.01 : -HALF_SIZE + BALL_RADIUS + 0.01
      );
    }
  });

  // Dragging and interaction handlers
  const { camera } = useThree();
  const [dragStartPoint] = useState(new Vector3());
  const [dragStartVelocity] = useState(new Vector3());

  // Handle dragging
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setIsDragging(true);
    
    // Store initial position for drag calculation
    dragStartPoint.set(e.point.x, e.point.y, e.point.z);
    dragStartVelocity.set(velocity.current[0], velocity.current[1], velocity.current[2]);
    
    // Stop the ball while dragging
    api.velocity.set(0, 0, 0);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handlePointerMove = (e: any) => {
    if (isDragging) {
      e.stopPropagation();
      
      // Calculate throw velocity based on movement
      const dragVector = new Vector3(
        e.point.x - dragStartPoint.x,
        e.point.y - dragStartPoint.y,
        e.point.z - dragStartPoint.z
      );
      
      // Apply force based on drag distance and direction
      api.velocity.set(dragVector.x * 10, dragVector.y * 10, dragVector.z * 10);
      
      // Update drag start point
      dragStartPoint.set(e.point.x, e.point.y, e.point.z);
    }
  };

  const handleClick = (e: any) => {
    // Only open URL if not dragging
    if (!isDragging && url) {
      // Prevent opening link during drag
      e.stopPropagation();
    }
  };

  return (
    <mesh
      ref={ref as any}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
    >
      <sphereGeometry args={[BALL_RADIUS, 32, 32]} />
      <meshStandardMaterial color={isHovered ? '#2196f3' : '#1e88e5'} />
      <Text
        position={[0, 0, BALL_RADIUS + 0.1]}
        rotation={[0, 0, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {text}
      </Text>
    </mesh>
  );
}

// Create cube walls as invisible planes to contain the balls
function CubeWalls() {
  // Back wall
  usePlane(() => ({
    rotation: [0, 0, 0],
    position: [0, 0, -HALF_SIZE],
    type: 'Static',
  }));
  
  // Front wall
  usePlane(() => ({
    rotation: [0, Math.PI, 0],
    position: [0, 0, HALF_SIZE],
    type: 'Static',
  }));
  
  // Right wall
  usePlane(() => ({
    rotation: [0, -Math.PI / 2, 0],
    position: [HALF_SIZE, 0, 0],
    type: 'Static',
  }));
  
  // Left wall
  usePlane(() => ({
    rotation: [0, Math.PI / 2, 0],
    position: [-HALF_SIZE, 0, 0],
    type: 'Static',
  }));
  
  // Top wall
  usePlane(() => ({
    rotation: [Math.PI / 2, 0, 0],
    position: [0, HALF_SIZE, 0],
    type: 'Static',
  }));
  
  // Bottom wall
  usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -HALF_SIZE, 0],
    type: 'Static',
  }));
  
  return null;
}

// Visible cube frame
function CubeFrame() {
  const [ref] = useBox(() => ({
    args: [CUBE_SIZE, CUBE_SIZE, CUBE_SIZE],
    type: 'Static',
  }));

  return (
    <mesh ref={ref as any}>
      <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} />
      <meshBasicMaterial wireframe color="#aaaaaa" transparent opacity={0.3} />
    </mesh>
  );
}

export const ThreeCube = () => {
  const skills = [
    { name: 'React', url: '' },
    { name: 'TypeScript', url: '' },
    { name: 'Node.js', url: '' },
    { name: 'Python', url: '' },
    { name: 'Three.js', url: '' },
    { name: 'GraphQL', url: '' },
    { name: 'Docker', url: '' },
    { name: 'AWS', url: '' }
  ];

  return (
    <div className="w-full h-[500px]">
      <Canvas camera={{ position: [0, 0, 10], fov: 40 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        <Physics
          gravity={[0, 0, 0]}
          defaultContactMaterial={{
            friction: 0.1,
            restitution: 0.8,
          }}
        >
          <CubeWalls />
          <CubeFrame />
          
          {skills.map((skill, i) => (
            <Ball
              key={skill.name}
              position={[
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4
              ]}
              text={skill.name}
              url={skill.url}
            />
          ))}
        </Physics>
        
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minDistance={8}
          maxDistance={12}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
};
