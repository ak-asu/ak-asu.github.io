import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { Text } from '@react-three/drei';
import { Vector3, Mesh } from 'three';
import { BALL_RADIUS, SPHERE_RADIUS, INITIAL_VELOCITY_MULTIPLIER, ENERGY_REMAIN, MIN_VELOCITY } from './utils';


interface BallProps {
  position: [number, number, number];
  name: string;
  url: string;
  color: string;
  icon: string;
  ballIndex: number;
}

export const Ball = React.forwardRef(({ position, name, url, color, icon, ballIndex }: BallProps, ref: any) => {
  const [sphereRef, api] = useSphere(() => ({
    mass: 1,
    position,
    args: [BALL_RADIUS],
    linearDamping: 0.05,
    material: { restitution: 0.8, friction: 0.1 },
  }));

  const [isHovered, setIsHovered] = useState(false);
  const velocity = useRef<Vector3>(new Vector3());

  // Pass ref and api to parent
  useEffect(() => {
    if (ref) ref.current = { ref: sphereRef, api };
  }, [ref, sphereRef, api]);

  // Set initial random velocity
  useEffect(() => {
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    const speed = INITIAL_VELOCITY_MULTIPLIER;
    const velocity = new Vector3(
      speed * Math.sin(phi) * Math.cos(theta),
      speed * Math.sin(phi) * Math.sin(theta),
      speed * Math.cos(phi)
    );
    api.velocity.set(velocity.x, velocity.y, velocity.z);
  }, [api]);

  // Cleanup function when unmounting
  useEffect(() => {
    const unsubscribe = api.velocity.subscribe((v) => velocity.current.set(v[0], v[1], v[2]));
    return unsubscribe;
  }, [api]);

  // Handle bouncing and minimum velocity
  useFrame(() => {
    if (sphereRef.current) {
      // Get current position
      const position = sphereRef.current.position.clone();
      const distanceFromCenter = position.length();

      // Check if the ball is hitting or outside the container boundary
      if (distanceFromCenter >= SPHERE_RADIUS - BALL_RADIUS) {
        // Calculate normal vector pointing from center to ball position
        const normal = position.clone().normalize();

        // Force position to be exactly at boundary with a small buffer
        const correctedPosition = normal.clone().multiplyScalar(SPHERE_RADIUS - BALL_RADIUS - 0.01);
        api.position.set(correctedPosition.x, correctedPosition.y, correctedPosition.z);

        // Get current velocity
        const currentVelocity = velocity.current.clone();

        // Calculate reflection: v' = v - 2(v·n)n
        const velocityDot = currentVelocity.dot(normal);
        const reflection = currentVelocity.clone().sub(
          normal.clone().multiplyScalar(2 * velocityDot)
        );

        // Apply the reflected velocity with energy loss
        api.velocity.set(
          reflection.x * ENERGY_REMAIN,
          reflection.y * ENERGY_REMAIN,
          reflection.z * ENERGY_REMAIN
        );
      }

      // Maintain minimum velocity
      const speed = velocity.current.length();
      if (speed > 0 && speed < MIN_VELOCITY) {
        const direction = velocity.current.clone().normalize();
        api.velocity.set(
          direction.x * MIN_VELOCITY,
          direction.y * MIN_VELOCITY,
          direction.z * MIN_VELOCITY
        );
      }
    }
  });

  return (
    <mesh
      ref={sphereRef as React.RefObject<Mesh>}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
      onClick={() => window.open(url, '_blank')}
      userData={{ ballIndex }}
    >
      <sphereGeometry args={[BALL_RADIUS, 32, 32]} />
      <meshStandardMaterial
        color={isHovered ? '#ffffff' : color}
        emissive={color}
        emissiveIntensity={isHovered ? 0.5 : 0.2}
        metalness={0.3}
        roughness={0.4}
      />
      <Text
        position={[0, 0, BALL_RADIUS + 0.05]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {icon}
      </Text>
      <Text
        position={[0, -BALL_RADIUS - 0.1, 0]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </mesh>
  );
});