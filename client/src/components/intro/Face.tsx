import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Mesh, Box3, Raycaster } from 'three';
import { SPHERE_RADIUS, PUSH_FORCE } from './utils';


export default function Face({ ballsRef }: { ballsRef: React.MutableRefObject<any[]> }) {
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

  // Handle face click with stronger push and spin
  const handleClick = () => {
    setIsAngry(true);
    ballsRef.current.forEach((ball) => {
      if (!ball || !ball.api) return;
      const ballPos = new Vector3();
      ball.ref.current?.getWorldPosition(ballPos);
      const direction = ballPos.sub(mesh.current!.position).normalize();
      ball.api.applyImpulse(
        [direction.x * PUSH_FORCE, direction.y * PUSH_FORCE, direction.z * PUSH_FORCE],
        [0, 0, 0]
      );
      ball.api.applyAngularImpulse([
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5
      ]);
    });
    setTimeout(() => setIsAngry(false), 500);
  };

  return (
    <mesh ref={mesh} onClick={handleClick} position={[0, 0, 0]}>
      <sphereGeometry args={[0.4, 16, 16]} />
      <meshStandardMaterial color="#555" />
      <mesh position={[-0.15, 0.12, 0.3]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.15, 0.12, 0.3]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.15, 0.12, 0.36]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#000" />
      </mesh>
      <mesh position={[0.15, 0.12, 0.36]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#000" />
      </mesh>
      <mesh position={[0, -0.06, 0.3]} rotation={[0, 0, isAngry ? Math.PI : 0]}>
        <torusGeometry args={[0.18, 0.03, 8, 8, Math.PI]} />
        <meshBasicMaterial color="#000" />
      </mesh>
      {isAngry && (
        <mesh position={[0, -0.18, 0.3]}>
          <torusGeometry args={[0.12, 0.03, 8, 8, Math.PI]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
      )}
      {isAngry && (
        <>
          <mesh position={[-0.15, 0.21, 0.3]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.12, 0.03, 0.03]} />
            <meshBasicMaterial color="#000" />
          </mesh>
          <mesh position={[0.15, 0.21, 0.3]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.12, 0.03, 0.03]} />
            <meshBasicMaterial color="#000" />
          </mesh>
        </>
      )}
    </mesh>
  );
}
