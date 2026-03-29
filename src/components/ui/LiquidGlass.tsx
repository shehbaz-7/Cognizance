"use client";

import { CSSProperties, useRef, ReactNode, useId } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

type LiquidGlassProps = {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    tintOpacity?: number;
    blur?: number;
    children?: ReactNode;
    className?: string;
};

export const LiquidGlass = (props: LiquidGlassProps) => {
    const { width = "100%", height = "100%", borderRadius = 12, tintOpacity = 0.05, blur = 10, children, className } = props;

    const glassRef = useRef<HTMLDivElement>(null);

    const filterId = `glass-distortion-${useId().replace(/:/g, "")}`;

    useGSAP(() => {
        const glass = glassRef.current;
        const parent = glass?.parentElement;

        if (!glass || !parent) return;

        const mouseMove = (e: MouseEvent) => {
            if (!glassRef.current || !glassRef.current?.parentElement) return;

            const parentRect = parent.getBoundingClientRect();
            
            // Adjust to track center
            const posX = e.clientX - parentRect.left - parentRect.width / 2;
            const posY = e.clientY - parentRect.top - parentRect.height / 2;

            gsap.to(glassRef.current, {
                duration: 0.6,
                x: posX * 0.1, // Slight parallax
                y: posY * 0.1,
                ease: "power2.out",
            });
        };

        if (parent) {
            parent.addEventListener("mousemove", mouseMove);
            // reset on leave
            parent.addEventListener("mouseleave", () => {
                gsap.to(glassRef.current, { duration: 0.6, x: 0, y: 0, ease: "power2.out" });
            });
        }

        return () => {
            if (parent) {
                parent.removeEventListener("mousemove", mouseMove);
            }
        };
    }, []);

    return (
        <div className={cn("relative overflow-hidden group/liquid", className)} style={{ borderRadius: `${borderRadius}px` }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" className="absolute overflow-hidden">
                <defs>
                    <filter id={filterId} x="0%" y="0%" width="100%" height="100%">
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.008 0.008"
                            numOctaves="2"
                            seed="92"
                            result="noise"></feTurbulence>
                        <feGaussianBlur in="noise" stdDeviation="2" result="blurred"></feGaussianBlur>
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="blurred"
                            scale="40"
                            xChannelSelector="R"
                            yChannelSelector="G"></feDisplacementMap>
                    </filter>
                </defs>
            </svg>
            <div
                ref={glassRef}
                className={cn(
                    "absolute isolate z-0 transition-transform duration-300",
                    [
                        "before:absolute before:inset-0 before:z-0 before:rounded-[var(--lg-border-radius)] before:bg-[rgba(255,255,255,var(--lg-tint-opacity))] before:content-['']",
                    ],
                    [
                        `after:absolute after:-inset-4 after:isolate after:-z-1 after:rounded-[var(--lg-border-radius)] after:[filter:url(#${filterId})_blur(var(--lg-blur))] after:content-['']`,
                    ],
                )}
                style={
                    {
                        "--lg-border-radius": `${borderRadius}px`,
                        "--lg-tint-opacity": tintOpacity,
                        "--lg-blur": `${blur}px`,
                        width: "120%",
                        height: "120%",
                        top: "-10%",
                        left: "-10%",
                    } as CSSProperties
                }></div>
            <div className="relative z-10 w-full h-full bg-white/5 border border-white/10 p-5 rounded-[inherit] backdrop-blur-md shadow-2xl">
                {children}
            </div>
        </div>
    );
};
