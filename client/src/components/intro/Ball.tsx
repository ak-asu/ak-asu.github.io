import React, { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";

// Import logo images or use URLs
const githubLogoUrl =
  "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png";
const linkedinLogoUrl =
  "https://content.linkedin.com/content/dam/me/business/en-us/amp/brand-site/v2/bg/LI-Bug.svg.original.svg";

type BallProps = {
  position: [number, number, number];
  size?: number;
  logoType: "github" | "linkedin" | "none";
  color?: string;
  opacity?: number;
  speed?: number;
  url?: string; // Add URL for clicking
};

const Ball: React.FC<BallProps> = ({
  position,
  size = 0.5,
  logoType = "none",
  color = "#ffffff",
  opacity = 0.7,
  speed = 0.01,
  url,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Load texture using useLoader properly - without try/catch in render
  // useLoader already works with Suspense for loading states
  const texture =
    logoType !== "none"
      ? useLoader(
          TextureLoader,
          logoType === "github" ? githubLogoUrl : linkedinLogoUrl,
        )
      : null;

  // Small animation for each ball
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += speed * 0.5;
      meshRef.current.rotation.y += speed;
    }
  });

  // Handle click to open URL
  const handleClick = (e: THREE.Event) => {
    e.stopPropagation();
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={handleClick}
      cursor={url ? "pointer" : "auto"}
    >
      <Sphere args={[size, 16, 16]}>
        <meshPhysicalMaterial
          color={color}
          transparent={true}
          opacity={opacity}
          roughness={0.2}
          metalness={0.8}
          map={texture || undefined}
          envMapIntensity={0.8}
        />
      </Sphere>
    </mesh>
  );
};

export default Ball;
