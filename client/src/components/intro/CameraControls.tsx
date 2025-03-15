import React, { useRef, useEffect } from 'react';
import { useThree, extend } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// Extend OrbitControls for use in React Three Fiber
extend({ OrbitControls });

export default function CameraControls({ setDragging }: { setDragging: (dragging: boolean) => void }) {
  const { camera, gl } = useThree();
  const controls = useRef<any>(null);

  useEffect(() => {
    if (controls.current) {
      controls.current.addEventListener('start', () => setDragging(true));
      controls.current.addEventListener('end', () => setDragging(false));
    }
  }, [setDragging]);

  return (
    <OrbitControls
      ref={controls}
      args={[camera, gl.domElement]}
      enableDamping
      dampingFactor={0.05}
      rotateSpeed={0.5}
      enablePan={false}
      enableZoom={false}
      minDistance={3}
      maxDistance={3}
    />
  );
}
