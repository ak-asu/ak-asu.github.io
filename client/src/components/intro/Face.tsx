/* eslint-disable react/no-unknown-property */
import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Mesh, Box3, Raycaster } from 'three';
import { SPHERE_RADIUS } from './utils';

export default function Face({ handleFaceClick }: { handleFaceClick: () => void }) {
  const mesh = useRef<Mesh>(null);
  const [isAngry, setIsAngry] = useState(false);
  const { camera, mouse, scene } = useThree();
  const raycaster = useRef(new Raycaster());
  const cubeBounds = useMemo(() => new Box3(new Vector3(-SPHERE_RADIUS, -SPHERE_RADIUS, -SPHERE_RADIUS), new Vector3(SPHERE_RADIUS, SPHERE_RADIUS, SPHERE_RADIUS)), []);

  // Make the face follow the cursor
  useFrame(() => {
    if (!mesh.current) return;
    raycaster.current.setFromCamera(mouse, camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);
    const insideIntersection = intersects.find((intersection) => cubeBounds.containsPoint(intersection.point));
    if (insideIntersection) {
      mesh.current.lookAt(insideIntersection.point);
    }
  });

  const handleClick = () => {
    setIsAngry(true);
    handleFaceClick();
    setTimeout(() => setIsAngry(false), 320);
  };

  return (
    <mesh ref={mesh} onClick={handleClick} position={[0, 0, 0]}>
      <sphereGeometry args={[0.4, 16, 16]} />
      <meshStandardMaterial color="#555" />
      {/* Eyes */}
      <mesh position={[-0.15, 0.12, 0.3]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.15, 0.12, 0.3]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>      
      {/* Happy/Angry Mouth */}
      {isAngry ? (
        // Happy smiling mouth - upward curve
        <>
          <mesh position={[0, -0.15, 0.3]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.18, 0.03, 16, 16, Math.PI]} />
            <meshBasicMaterial color="#cc3333" />
          </mesh>
          {/* Additional happy elements */}
          <mesh position={[0, -0.18, 0.3]}>
            <torusGeometry args={[0.12, 0.03, 8, 8, Math.PI]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
        </>
      ) : (
        // Angry frowning mouth - downward curve
        <>
          <mesh position={[0, -0.15, 0.3]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.18, 0.03, 16, 16, Math.PI]} />
            <meshBasicMaterial color="#cc3333" />
          </mesh>
          {/* Additional angry elements */}
          <mesh position={[0, -0.18, 0.3]}>
            <torusGeometry args={[0.12, 0.03, 8, 8, Math.PI]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
        </>
      )}      
      {/* Eyebrows - only visible when angry */}
      {!isAngry && (
        <>
          <mesh position={[-0.15, 0.21, 0.3]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.12, 0.03, 0.03]} />
            <meshBasicMaterial color="#cc3333" />
          </mesh>
          <mesh position={[0.15, 0.21, 0.3]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.12, 0.03, 0.03]} />
            <meshBasicMaterial color="#cc3333" />
          </mesh>
        </>
      )}
    </mesh>
  );
}
