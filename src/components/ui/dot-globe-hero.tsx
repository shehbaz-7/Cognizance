"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import React, { useRef } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

interface DotGlobeHeroProps {
  rotationSpeed?: number;
  globeRadius?: number;
  className?: string;
  children?: React.ReactNode;
}

const Globe: React.FC<{
  rotationSpeed: number;
  radius: number;
}> = ({ rotationSpeed, radius }) => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += rotationSpeed;
      groupRef.current.rotation.x += rotationSpeed * 0.3;
      groupRef.current.rotation.z += rotationSpeed * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.25}
          wireframe
        />
      </mesh>
      {/* Inner solid glow sphere */}
      <mesh>
        <sphereGeometry args={[radius * 0.98, 32, 32]} />
        <meshBasicMaterial
          color="#0e172a"
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
};

const DotGlobeHero = React.forwardRef<HTMLDivElement, DotGlobeHeroProps>(
  (
    {
      rotationSpeed = 0.003,
      globeRadius = 1.2,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full h-[600px] overflow-hidden rounded-b-[40px] border-b border-white/5 mb-8 bg-black",
          className
        )}
        {...props}
      >
        {/* Subtle cyan spotlight glow behind globe */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Content slot */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full pointer-events-auto">
          {children}
        </div>

        {/* Globe Canvas */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, 3.5]} fov={65} />
            <ambientLight intensity={0.6} />
            <pointLight position={[5, 5, 5]} intensity={2} color="#06b6d4" />
            <Globe rotationSpeed={rotationSpeed} radius={globeRadius} />
          </Canvas>
          {/* Bottom fade */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
        </div>
      </div>
    );
  }
);

DotGlobeHero.displayName = "DotGlobeHero";

export { DotGlobeHero, type DotGlobeHeroProps };
