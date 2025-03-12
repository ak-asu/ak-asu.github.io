import { useEffect, useRef, useState, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Canvas } from '@react-three/fiber';
import { Physics, usePlane, useBox, useSphere } from '@react-three/cannon';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { motion } from 'framer-motion';
import { audioManager } from '@/lib/audio';
import { ErrorBoundary } from 'react-error-boundary';
import type { Mesh, PlaneGeometry, MeshStandardMaterial } from 'three';
import { Html } from '@react-three/drei';

// Social media link type definition
interface SocialMediaLink {
  name: string;
  url: string;
  color: string;
  icon?: string;
  position: [number, number, number];
}

// Define social media links
const socialLinks: SocialMediaLink[] = [
  { name: 'GitHub', url: 'https://github.com/', color: '#333', icon: 'github', position: [2, 2, 0] },
  { name: 'LinkedIn', url: 'https://linkedin.com/in/', color: '#0077B5', icon: 'linkedin', position: [-2, 3, 1] },
  { name: 'Twitter', url: 'https://twitter.com/', color: '#1DA1F2', icon: 'twitter', position: [1.5, 1, -1] },
  { name: 'Portfolio', url: '/', color: '#FF5722', icon: 'briefcase', position: [-1.5, 2, -1] },
];

// Social Media Sphere Component
function SocialMediaSphere({ name, url, color, position, icon }: SocialMediaLink) {
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position: position,
    args: [0.5], // radius of sphere
    restitution: 0.8, // bounciness
  }));
  
  const [isHovered, setIsHovered] = useState(false);
  const velocity = useRef<[number, number, number]>([0, 0, 0]);
  
  // Store velocity data for animation when physics is disabled
  useEffect(() => {
    api.velocity.subscribe((v) => (velocity.current = v));
  }, [api.velocity]);

  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
    audioManager.playSoundEffect('click');
  };
  
  const handleHover = (hovering: boolean) => {
    setIsHovered(hovering);
    if (hovering) audioManager.playSoundEffect('hover');
  };

  // Apply random forces periodically to keep the spheres moving
  useEffect(() => {
    const interval = setInterval(() => {
      api.applyImpulse([
        (Math.random() - 0.5) * 2,
        Math.random() * 5,
        (Math.random() - 0.5) * 2
      ], [0, 0, 0]);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [api]);
  
  // Use keyboard event handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement === ref.current && (e.key === 'Enter' || e.key === ' ')) {
        handleClick();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClick]);

  return (
    <mesh
      ref={ref as unknown as React.Ref<Mesh>}
      onClick={handleClick}
      onPointerOver={() => handleHover(true)}
      onPointerOut={() => handleHover(false)}
      scale={isHovered ? 1.2 : 1}
      userData={{
        ariaLabel: `${name} social media link`,
        tabIndex: 0
      }}
    >
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshPhongMaterial color={isHovered ? '#ffffff' : color} emissive={color} emissiveIntensity={isHovered ? 0.5 : 0.2} />
      <Html distanceFactor={10}>
        <div className="pointer-events-none select-none bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
          {name}
        </div>
      </Html>
    </mesh>
  );
}

interface LaptopMeshProps {
  ref: React.RefObject<Mesh>;
  onPointerOver: () => void;
  onPointerOut: () => void;
  onClick: () => void;
  scale: number;
  'aria-label': string;
  tabIndex: number;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

interface ScreenMeshProps {
  position: [number, number, number];
  rotation: [number, number, number];
}

function Laptop(props: any) {
  const [ref, api] = useBox(() => ({
    mass: 1,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    ...props,
  }));

  const physicsEnabled = useSelector((state: RootState) => state.mode.physicsEnabled);
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useFrame(() => {
    if (physicsEnabled && ref.current) {
      // Add physics-based movement
      api.velocity.set(0, Math.sin(Date.now() * 0.001) * 0.5, 0);
      api.rotation.set(0, Date.now() * 0.001, 0);
    }
  });

  const handleClick = () => {
    setIsOpen(!isOpen);
    audioManager.playSoundEffect('click');
  };

  const handleHover = () => {
    setIsHovered(!isHovered);
    audioManager.playSoundEffect('hover');
  };

  return (
    // @ts-ignore - mesh ref type issue with cannon
    <mesh
      ref={ref as React.RefObject<Mesh>}
      onPointerOver={handleHover}
      onPointerOut={handleHover}
      onClick={handleClick}
      scale={isHovered ? 1.1 : 1}
      //aria-label={`Interactive 3D laptop model. ${isOpen ? 'Screen is open' : 'Screen is closed'}`}
    // tabIndex={0}
    // onKeyDown={(e: React.KeyboardEvent) => {
    //   if (e.key === 'Enter' || e.key === ' ') {
    //     handleClick();
    //   }
    // }}
    >
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingSpinner />}>
          {/* Base */}
          <boxGeometry args={[2, 0.1, 1.5] as [number, number, number]} />
          <meshPhongMaterial color={isHovered ? '#999' : '#808080'} />

          {/* Screen */}
          <mesh
            position={[0, 0.8, 0]}
            rotation={[isOpen ? -0.5 : -1.5, 0, 0]}
          >
            <boxGeometry args={[2, 1.5, 0.1] as [number, number, number]} />
            <meshPhongMaterial color="#000000" />
          </mesh>
        </Suspense>
      </ErrorBoundary>
    </mesh>
  );
}

function Ground() {
  const [ref] = usePlane<Mesh>(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -2, 0],
    type: 'Static'
  }));

  return (
    <mesh
      ref={ref}
      receiveShadow
    // Remove aria-hidden as it's causing issues with r3f events
    >
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingSpinner />}>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial
            color="#f0f0f0"
            roughness={0.4}
            metalness={0.1}
          />
        </Suspense>
      </ErrorBoundary>
    </mesh>
  );
}

// Error fallback component
function ErrorFallback({ error }: { error: Error }) {
  return <div role="alert">Something went wrong: {error.message}</div>;
}

// Loading spinner component
function LoadingSpinner() {
  return <div>Loading...</div>;
}

export const ThreeLaptop = () => {
  const animationLevel = useSelector((state: RootState) => state.mode.animationLevel);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-[400px]"
      role="region"
      aria-label="Interactive 3D laptop visualization"
    >
      <Canvas
        camera={{ position: [0, 2, 5], fov: 60 }}
        shadows
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048} />
        <Physics
          gravity={[0, -9.81, 0]}
          defaultContactMaterial={{
            friction: 0.1,
            restitution: animationLevel === 'expert' ? 0.7 : 0.5,
          }}
        >
          <Laptop />
          <Ground />
          {/* Add social media spheres */}
          {socialLinks.map((link) => (
            <SocialMediaSphere key={link.name} {...link} />
          ))}
        </Physics>
      </Canvas>
      {/* Hidden instructions for screen readers */}
      <div className="sr-only">
        <p>Press Tab to focus on the laptop model or social media links. Use Enter or Space to interact with focused elements.</p>
        <p>The laptop responds to mouse hover and click interactions, with physics-based animations.</p>
        <p>Colored spheres represent links to social media profiles. Click on them to visit the respective websites.</p>
      </div>
    </motion.div>
  );
};