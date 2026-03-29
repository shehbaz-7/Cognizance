"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
    children: ReactNode;
    color?: string;
    className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, color = "rgba(99, 102, 241, 0.4)", className }) => {
    return (
        <div style={{ position: 'relative', borderRadius: '24px', isolation: 'isolate', transformOrigin: 'top' }} className={cn("w-full mb-6", className)}>
            {/* Electric Border Effect */}
            <div
                style={{
                    position: 'absolute',
                    inset: '-2px',
                    borderRadius: '26px',
                    padding: '2px',
                    background: `conic-gradient(
                        from 0deg,
                        transparent 0deg,
                        ${color} 60deg,
                        ${color.replace('0.4', '0.2')} 120deg,
                        transparent 180deg,
                        ${color.replace('0.4', '0.1')} 240deg,
                        transparent 360deg
                    )`,
                    zIndex: -1,
                    opacity: 0.5
                }}
            />

            {/* Main Card Content */}
            <div className="relative w-full h-full flex flex-col justify-center rounded-[24px] overflow-hidden"
                style={{
                    background: `linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))`,
                    backdropFilter: 'blur(25px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: `
                        0 8px 32px rgba(0, 0, 0, 0.2),
                        0 2px 8px rgba(0, 0, 0, 0.1),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1),
                        inset 0 -1px 0 rgba(255, 255, 255, 0.05)
                    `
                }}
            >
                {/* Enhanced Glass reflection overlay */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '60%',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)',
                    pointerEvents: 'none',
                    borderRadius: '24px 24px 0 0'
                }} />

                {/* Glass shine effect */}
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    right: '10px',
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                    borderRadius: '1px',
                    pointerEvents: 'none'
                }} />

                {/* Frosted glass texture */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `
                        radial-gradient(circle at 20% 30%, rgba(255,255,255,0.05) 1px, transparent 2px),
                        radial-gradient(circle at 80% 70%, rgba(255,255,255,0.03) 1px, transparent 2px)
                    `,
                    backgroundSize: '30px 30px, 25px 25px',
                    pointerEvents: 'none',
                    borderRadius: '24px',
                    opacity: 0.5
                }} />

                <div className="relative z-10 w-full h-full p-6 lg:p-8">
                    {children}
                </div>
            </div>
        </div>
    );
};
