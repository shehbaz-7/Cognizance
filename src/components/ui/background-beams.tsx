"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "absolute inset-0 z-0 flex items-center justify-center overflow-hidden bg-transparent pointer-events-none",
        className
      )}
    >
      <div className="absolute top-0 w-full h-[150%] left-0 z-0">
        <svg
          className="absolute h-full w-full inset-0 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g
            className="stroke-cyan-500/20 stroke-[1.5]"
            fill="none"
            fillRule="evenodd"
          >
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.path
                key={i}
                d={`M${-200 + i * 40} 0C${-100 + i * 40} 300 ${200 + i * 40} 600 ${
                  500 + i * 40
                } 1000`}
                initial={{
                  strokeDasharray: "10 500",
                  strokeDashoffset: "500",
                }}
                animate={{
                  strokeDasharray: ["10 500", "50 500", "10 500"],
                  strokeDashoffset: ["500", "250", "0"],
                }}
                transition={{
                  duration: Math.random() * 5 + 5,
                  repeat: Infinity,
                  ease: "linear",
                  delay: Math.random() * 2,
                }}
              />
            ))}
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.path
                key={`reverse-${i}`}
                d={`M${1500 - i * 40} 0C${1000 - i * 40} 300 ${800 - i * 40} 600 ${
                  200 - i * 40
                } 1000`}
                initial={{
                  strokeDasharray: "20 600",
                  strokeDashoffset: "600",
                }}
                animate={{
                  strokeDasharray: ["20 600", "80 600", "20 600"],
                  strokeDashoffset: ["600", "300", "0"],
                }}
                transition={{
                  duration: Math.random() * 5 + 5,
                  repeat: Infinity,
                  ease: "linear",
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
};
