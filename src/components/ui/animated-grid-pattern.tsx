"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedGridPatternProps {
  className?: string;
  width?: number;
  height?: number;
  numSquares?: number;
  maxOpacity?: number;
  duration?: number;
  repeatDelay?: number;
}

export function AnimatedGridPattern({
  className,
  width = 40,
  height = 40,
  numSquares = 50,
  maxOpacity = 0.5,
  duration = 3,
  repeatDelay = 1,
}: AnimatedGridPatternProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(document.body);
    return () => resizeObserver.disconnect();
  }, []);

  const cols = Math.floor(dimensions.width / width);
  const rows = Math.floor(dimensions.height / height);

  const getPos = () => [
    Math.floor(Math.random() * cols),
    Math.floor(Math.random() * rows),
  ];

  const [squares, setSquares] = useState(() =>
    Array.from({ length: numSquares }).map((_, i) => ({
      id: i,
      pos: getPos(),
    }))
  );

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;
    setSquares(
      Array.from({ length: numSquares }).map((_, i) => ({
        id: i,
        pos: getPos(),
      }))
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions, numSquares]);

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 z-0 h-full w-full fill-white/5 stroke-white/5",
        className
      )}
    >
      <defs>
        <pattern
          id="animated-grid-pattern"
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#animated-grid-pattern)" />
      
      {/* Animated Glowing Rects */}
      <svg x="0" y="0" className="overflow-visible">
        {squares.map(({ pos: [x, y], id }) => (
          <motion.rect
            initial={{ opacity: 0 }}
            animate={{ opacity: maxOpacity }}
            transition={{
              duration,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: Math.random() * duration * 2,
              repeatDelay,
            }}
            key={`${x}-${y}-${id}`}
            width={width - 1}
            height={height - 1}
            x={x * width + 1}
            y={y * height + 1}
            className="fill-[var(--color-accent)] stroke-none mix-blend-screen"
          />
        ))}
      </svg>
    </svg>
  );
}
