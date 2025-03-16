import React, { useEffect, useState } from 'react';
import { Physics } from '@react-three/cannon';
import { socialLinks, SPHERE_RADIUS, BALL_RADIUS } from './utils';
import SphericalContainer from './SphericalContainer';
import Face from './Face';
import { Ball } from './Ball';
import CameraControls from './CameraControls';
import { Vector3 } from 'three';

export default function Scene({containerCenter}: {containerCenter?: Vector3}) {
  // Use the correct type for the refs
  const [ballRefs, setBallRefs] = useState<React.MutableRefObject<any>[]>([]);
  
  useEffect(() => {
    // Initialize array of proper React refs
    const refs = socialLinks.map(() => React.createRef<any>());
    setBallRefs(refs);
  }, []);

  function randomSphericalPosition(): [number, number, number] {
    const r = Math.random() * (SPHERE_RADIUS - BALL_RADIUS - 0.01);
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    return [
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
    ];
  }

  // Wait until refs are initialized
  if (ballRefs.length === 0) {
    return null;
  }

  return (
    <group>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      <Physics
        gravity={[0, 0, 0]}
        defaultContactMaterial={{ restitution: 0.8, friction: 0.1 }}
        stepSize={1 / 120}
      >
        <SphericalContainer />
        <Face ballsRef={ballRefs} />
        {socialLinks.map((link, i) => (
          <Ball
            key={link.name}
            position={randomSphericalPosition()}
            name={link.name}
            url={link.url}
            color={link.color}
            icon={link.icon}
            ballIndex={i}
            ref={ballRefs[i]}
            containerCenter={containerCenter}
          />
        ))}
      </Physics>
      <CameraControls setDragging={(b: boolean) => {}} />
    </group>
  );
}