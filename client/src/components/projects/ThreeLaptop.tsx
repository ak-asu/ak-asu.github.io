import { useEffect, useRef, useState, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Canvas } from '@react-three/fiber';
import { Physics, usePlane, useBox } from '@react-three/cannon';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { motion } from 'framer-motion';
import { audioManager } from '@/lib/audio';
import { ErrorBoundary } from 'react-error-boundary';
import type { Mesh, PlaneGeometry, MeshStandardMaterial } from 'three';

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
        </Physics>
      </Canvas>
      {/* Hidden instructions for screen readers */}
      <div className="sr-only">
        <p>Press Tab to focus on the laptop model. Use Enter or Space to open/close the laptop screen.</p>
        <p>The laptop responds to mouse hover and click interactions, with physics-based animations.</p>
      </div>
    </motion.div>
  );
};