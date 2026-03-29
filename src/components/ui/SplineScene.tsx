"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import dynamic from "next/dynamic";

const Spline = dynamic(() => import("@splinetool/react-spline"), { 
  ssr: false,
  loading: () => null
});

interface SplineSceneProps {
  scene: string
  className?: string
}

class SplineErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("Spline integration failed to load gracefully. Ignoring buffer error.", error);
  }

  render() {
    if (this.state.hasError) {
      return null; // Fallback entirely, the background CSS will still show.
    }
    return this.props.children;
  }
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <div className={className}>
      <SplineErrorBoundary>
        <Spline scene={scene} />
      </SplineErrorBoundary>
    </div>
  )
}
