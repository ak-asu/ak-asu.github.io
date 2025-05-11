/* eslint-disable react/display-name */
/* eslint-disable react/no-unknown-property */
import React, { forwardRef, useRef, useState, useEffect } from 'react';
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
  containerCenter?: Vector3;
}

export const Ball = forwardRef<any, BallProps>((props, ref) => {
  const { position, name, url, color, ballIndex } = props;
  const containerCenter = props.containerCenter || new Vector3(0, 0, 0);
  const [sphereRef, api] = useSphere(() => ({
    mass: 1,
    position,
    args: [BALL_RADIUS]
  }));

  const [isHovered, setIsHovered] = useState(false);
  const velocity = useRef<Vector3>(new Vector3());

  // Improved ref handling with proper type safety
  useEffect(() => {
    if (!ref) return;
    // Ensure we're setting both sphereRef and api in the ref
    if (typeof ref === 'function') {
      ref({ ref: sphereRef, api });
    } else {
      ref.current = { ref: sphereRef, api };
    }
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
  }, []);

  // Cleanup function when unmounting
  useEffect(() => {
    const unsubscribe = api.velocity.subscribe((v) => velocity.current.set(v[0], v[1], v[2]));
    return unsubscribe;
  }, [api]);

  useFrame(() => {
    if (sphereRef.current) {
      const position = sphereRef.current.position.clone();
      // Calculate distance from the container center
      const distanceFromCenter = position.distanceTo(containerCenter);
      // Check if the ball is hitting or outside the container boundary
      if (distanceFromCenter >= SPHERE_RADIUS - BALL_RADIUS) {
        // Calculate normal vector pointing from center to ball position
        const normal = position.clone().sub(containerCenter).normalize();
        const currentVelocity = velocity.current.clone();
        // Calculate reflection: v' = v - 2(v·n)n
        const velocityDot = currentVelocity.dot(normal);
        const reflection = currentVelocity.clone().sub(
          normal.clone().multiplyScalar(2 * velocityDot)
        );
        api.velocity.set(
          reflection.x * ENERGY_REMAIN,
          reflection.y * ENERGY_REMAIN,
          reflection.z * ENERGY_REMAIN
        );
      }
      // Maintain minimum velocity
      const speed = velocity.current.distanceTo(new Vector3(0, 0, 0));
      if (speed < MIN_VELOCITY) {
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
      {isHovered && <Text
        position={[0, -BALL_RADIUS - 0.1, 0]}
        fontSize={0.05}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>}
    </mesh>
  );
});