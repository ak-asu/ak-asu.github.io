/* eslint-disable react/display-name */
/* eslint-disable react/no-unknown-property */
import React, { forwardRef, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { Text } from '@react-three/drei';
import { Vector3, Mesh } from 'three';
import { BALL_RADIUS, SPHERE_RADIUS, INITIAL_VELOCITY_MULTIPLIER, ENERGY_REMAIN, MIN_VELOCITY, BallObject } from './utils';

interface BallProps {
  position: [number, number, number];
  name: string;
  url: string;
  color: string;
  icon: string;
  ballIndex: number;
  containerCenter?: Vector3;
}

export const Ball = forwardRef<BallObject, BallProps>((props, ref) => {
  const { position, name, url, color, ballIndex } = props;
  const containerCenter = props.containerCenter || new Vector3(0, 0, 0);
  const [sphereRef, api] = useSphere(() => ({
    mass: 1,
    position,
    args: [BALL_RADIUS],
    collisionFilterGroup: 1,
    collisionFilterMask: 1,
  }));

  const [isHovered, setIsHovered] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const velocity = useRef<Vector3>(new Vector3());
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);  // Improved ref handling with proper type safety
  useEffect(() => {
    if (!ref) return;
    
    // Create the BallObject with required properties and methods
    const ballObject = {
      ref: sphereRef,
      api,
      link: { name, url, color, icon: props.icon },
      initialPosition: position,
      index: ballIndex,
      velocity: velocity.current,
      
      // Physics methods
      applyImpulse: (force: [number, number, number], worldPoint?: [number, number, number]) => {
        api.applyImpulse(force, worldPoint || position);
      },
      setVelocity: (newVelocity: [number, number, number]) => {
        api.velocity.set(newVelocity[0], newVelocity[1], newVelocity[2]);
      },
      
      // Utility methods
      getPosition: () => {
        if (sphereRef.current) {
          return sphereRef.current.position.clone();
        }
        return new Vector3(...position);
      },
      getVelocity: () => {
        return velocity.current.clone();
      },
      moveTo: (newPosition: [number, number, number], duration = 1000) => {
        if (sphereRef.current) {
          const currentPos = sphereRef.current.position.clone();
          const targetPos = new Vector3(...newPosition);
          
          // Calculate direction vector
          const direction = targetPos.clone().sub(currentPos);
          
          // Calculate velocity needed to reach target in given duration
          const requiredVelocity: [number, number, number] = [
            direction.x / (duration / 1000),
            direction.y / (duration / 1000),
            direction.z / (duration / 1000)
          ];
          
          // Set the velocity
          api.velocity.set(...requiredVelocity);
          
          // Schedule velocity reset after duration
          setTimeout(() => {
            api.velocity.set(0, 0, 0);
          }, duration);
        }
      },
      
      // Highlight ball
      highlight: (duration = 1000) => {
        // Clear any existing timeout
        if (highlightTimeoutRef.current) {
          clearTimeout(highlightTimeoutRef.current);
        }
        
        // Activate highlight
        setIsHighlighted(true);
        
        // Set timeout to remove highlight
        highlightTimeoutRef.current = setTimeout(() => {
          setIsHighlighted(false);
          highlightTimeoutRef.current = null;
        }, duration);
      },
      
      // Collision handler 
      onCollideWithBall: (otherBall: BallObject) => {
        // Implement collision behavior if needed
        console.log(`Ball ${ballIndex} collided with Ball ${otherBall.index}`);
      }
    };
    
    // Ensure we're setting the complete BallObject in the ref
    if (typeof ref === 'function') {
      ref(ballObject);
    } else {
      ref.current = ballObject;
    }
  }, [ref, sphereRef, api, name, url, color, props.icon, position, ballIndex]);

  // Set initial random velocity
  useEffect(() => {
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    const speed = INITIAL_VELOCITY_MULTIPLIER;
    const newVelocity = new Vector3(
      speed * Math.sin(phi) * Math.cos(theta),
      speed * Math.sin(phi) * Math.sin(theta),
      speed * Math.cos(phi)
    );
    api.velocity.set(newVelocity.x, newVelocity.y, newVelocity.z);
  }, []);

  // Cleanup function when unmounting
  useEffect(() => {
    const unsubscribe = api.velocity.subscribe((v) => velocity.current.set(v[0], v[1], v[2]));
    return unsubscribe;
  }, [api]);

  useFrame(() => {
    if (sphereRef.current) {
      const newPosition = sphereRef.current.position.clone();
      // Calculate distance from the container center
      const distanceFromCenter = newPosition.distanceTo(containerCenter);
      // Check if the ball is hitting or outside the container boundary
      if (distanceFromCenter >= SPHERE_RADIUS - BALL_RADIUS) {
        // Calculate normal vector pointing from center to ball position
        const normal = newPosition.clone().sub(containerCenter).normalize();
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
        color={isHighlighted ? '#ffffff' : isHovered ? '#ffffff' : color}
        emissive={color}
        emissiveIntensity={isHighlighted ? 1.0 : isHovered ? 0.5 : 0.2}
        metalness={0.3}
        roughness={0.4}
      />
      {(isHovered || isHighlighted) && <Text
        position={[0, -BALL_RADIUS - 0.1, 0]}
        fontSize={0.05}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>}
      {isHighlighted && (
        <mesh>
          <sphereGeometry args={[BALL_RADIUS * 1.2, 16, 16]} />
          <meshStandardMaterial 
            color={color}
            transparent={true}
            opacity={0.3}
            wireframe={true}
          />
        </mesh>
      )}
    </mesh>
  );
});