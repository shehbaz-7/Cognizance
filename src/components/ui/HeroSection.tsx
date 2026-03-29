"use client";

import React from "react";
import { motion } from "framer-motion";
import { Spotlight } from "./spotlight";
import { DotGlobeHero } from "./dot-globe-hero";
import { BorderBeam } from "@/registry/magicui/border-beam";
import { CardContainer, CardBody, CardItem } from "./3d-card";
import { Sparkles, Brain, Target, CalendarClock, ArrowRight } from "lucide-react";

const featureCards = [
  {
    title: "AI Mentor",
    description:
      "Generates tailored Scenarios, Flashcards, and Notes using advanced LLM reasoning that maps to your weak areas.",
    icon: Brain,
    color: "cyan",
    glow: "rgba(6,182,212,0.15)",
    border: "border-cyan-500/20",
    iconBg: "bg-cyan-500/10",
    iconText: "text-cyan-400",
    href: "/study",
  },
  {
    title: "Retention Tracking",
    description:
      "Neural decay modeling tracks forgetting curves, displaying exact retention percentages that predict memory lapse.",
    icon: Target,
    color: "indigo",
    glow: "rgba(99,102,241,0.15)",
    border: "border-indigo-500/20",
    iconBg: "bg-indigo-500/10",
    iconText: "text-indigo-400",
    href: "/",
  },
  {
    title: "Smart Planner",
    description:
      "Autonomous calendar sequencing orchestrates your reviews exactly when your cognitive pathway is on the verge of fracturing.",
    icon: CalendarClock,
    color: "purple",
    glow: "rgba(168,85,247,0.15)",
    border: "border-purple-500/20",
    iconBg: "bg-purple-500/10",
    iconText: "text-purple-400",
    href: "/planner",
  },
];

export function HeroSection() {
  const handleStartLearning = () => {
    document.getElementById("dashboard-content")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative w-full flex flex-col items-center overflow-hidden">
      {/* ── Spotlight + DotGlobe Hero ── */}
      <div className="relative w-full h-[600px] overflow-hidden bg-black/[0.96] antialiased">
        {/* Subtle dark grid */}
        <div className="pointer-events-none absolute inset-0 [background-size:40px_40px] [background-image:linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)]" />

        {/* Spotlight rays */}
        <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="white" />
        <Spotlight className="-top-40 right-0 md:-top-20 md:right-60" fill="cyan" />

        {/* DotGlobe 3D canvas */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <DotGlobeHero className="h-full w-full mb-0 rounded-none border-none" />
        </div>

        {/* Hero text content */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col items-center text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-md mb-6">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">
                Neural Link Stabilized
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-5 drop-shadow-[0_2px_20px_rgba(0,0,0,0.9)]" style={{ textShadow: '0 0 60px rgba(6,182,212,0.3), 0 2px 10px rgba(0,0,0,1)' }}>
              <span className="bg-gradient-to-b from-white to-zinc-200 bg-clip-text text-transparent">
                Cognizance
              </span>
            </h1>

            {/* Glassmorphism text block for premium legibility over the globe */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl px-10 py-6 mb-12 border border-white/10 shadow-lg shadow-cyan-500/5 max-w-xl transition-all hover:bg-white/10 hover:border-white/20">
              <p className="text-white text-base md:text-xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                AI-Powered Cognitive Learning Platform.
              </p>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed mt-2 opacity-80">
                Stop tracking tasks. Start tracking knowledge retention.
              </p>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={handleStartLearning}
                className="relative flex items-center gap-2 px-8 py-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm shadow-[0_0_25px_rgba(6,182,212,0.45)] transition-all hover:scale-105 active:scale-95 overflow-hidden"
              >
                Start Learning
                <ArrowRight className="w-4 h-4" />
                <BorderBeam size={80} duration={4} colorFrom="#ffffff" colorTo="#06b6d4" />
              </button>

              <button
                onClick={handleStartLearning}
                className="relative flex items-center gap-2 px-8 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium text-sm backdrop-blur-md transition-all hover:scale-105 active:scale-95 overflow-hidden"
              >
                View Analytics
                <BorderBeam size={100} duration={8} colorFrom="#6366f1" colorTo="#a855f7" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Feature Cards ── */}
      <div className="w-full max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <CardContainer key={card.title} className="inter-var w-full" containerClassName="w-full p-0">
                <CardBody
                  className={`relative group/card bg-black/50 border border-white/10 hover:border-${card.color}-500/30 w-full h-auto rounded-2xl p-7 transition-all duration-300 hover:shadow-2xl overflow-hidden`}
                  style={{ boxShadow: `0 0 0 0 ${card.glow}` }}
                >
                  {/* Ambient glow blob */}
                  <div
                    className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none"
                    style={{ background: card.glow }}
                  />

                  <CardItem translateZ="30" className={`w-12 h-12 rounded-xl ${card.iconBg} border ${card.border} flex items-center justify-center mb-5`}>
                    <Icon className={`w-6 h-6 ${card.iconText}`} />
                  </CardItem>

                  <CardItem translateZ="50" className="text-xl font-bold text-white mb-3">
                    {card.title}
                  </CardItem>

                  <CardItem as="p" translateZ="40" className="text-zinc-400 text-sm leading-relaxed mb-6">
                    {card.description}
                  </CardItem>

                  <CardItem
                    translateZ="60"
                    as="a"
                    href={card.href}
                    className={`inline-flex items-center gap-1 text-xs font-semibold ${card.iconText} hover:opacity-80 transition-opacity`}
                  >
                    Explore feature <ArrowRight className="w-3 h-3" />
                  </CardItem>
                </CardBody>
              </CardContainer>
            );
          })}
        </div>
      </div>
    </div>
  );
}
