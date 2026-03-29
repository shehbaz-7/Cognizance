"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export const TiltCard = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Soft physics for rotation
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);
  // Optional glare effect transform
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["100%", "-100%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["100%", "-100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "relative rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl transition-all hover:border-cyan-500/30 overflow-hidden group",
        className
      )}
      {...props}
    >
      {/* Glare Reflection */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 60%)",
          x: glareX,
          y: glareY,
        }}
      />
      {/* Ambient Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-cyan-500/5 via-transparent to-indigo-500/5" />
      
      <div className="relative z-10 w-full h-full p-6 lg:p-8" style={{ transform: "translateZ(40px)" }}>
        {children}
      </div>
    </motion.div>
  );
};
