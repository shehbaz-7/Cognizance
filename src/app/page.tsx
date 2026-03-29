"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Brain, 
  Target, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  Globe, 
  Cpu, 
  BarChart3,
  Sparkles,
  ChevronRight,
  LogIn
} from "lucide-react";
import { DotGlobeHero } from "@/components/ui/dot-globe-hero";
import { Spotlight } from "@/components/ui/spotlight";
import { BorderBeam } from "@/registry/magicui/border-beam";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";

const features = [
  {
    title: "Neural Retention Analysis",
    description: "Advanced cognitive decay modeling tracks your forgetting curve in real-time, predicting exactly when knowledge pathways will fracture.",
    icon: Target,
    color: "cyan"
  },
  {
    title: "Situational Deep-Dives",
    description: "Immersive architectural scenarios that shift from simple MCQ to high-stakes professional decision simulations with tactical post-mortems.",
    icon: Brain,
    color: "indigo"
  },
  {
    title: "Autonomous Planner",
    description: "AI-orchestrated revision sequencing that prioritizes critical decay points across your entire neural mastery blueprint.",
    icon: Zap,
    color: "purple"
  }
];

export default function LandingPage() {
  const [user] = useAuthState(auth);
  const router = useRouter();

  const handleSignIn = async () => {
    if (user) {
      router.push("/dashboard");
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (e) {
      console.error("Sign in error", e);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* ── Header ── */}
      <nav className="fixed top-0 w-full z-[100] border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative flex items-center justify-center">
              <Image 
                src="/logo/cognizance-icon.png" 
                alt="Cognizance" 
                width={40} 
                height={40} 
                style={{ mixBlendMode: 'screen', filter: 'brightness(1.1) contrast(1.2)' }}
                className="object-contain drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]"
              />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Cognizance
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Features</a>
            <a href="#methodology" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Methodology</a>
            <Link 
              href="/signin"
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              {user ? "Enter Dashboard" : "Initiate Neural Link"}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-32 pb-20 px-6">
        <Spotlight className="-top-40 left-0 md:left-60" fill="white" />
        <Spotlight className="top-40 right-0 md:right-60" fill="cyan" />
        
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="z-10"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">v2.4 Cognitive Engine Live</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6 leading-[1.1]">
                Architect Your <br />
                <span className="bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">Neural Mastery</span>
              </h1>
              
              <p className="text-xl text-zinc-400 max-w-lg mb-10 leading-relaxed font-medium">
                Cognizance isn't a task manager. It's a proactive neural mastery engine. 
                We track how you forget, so you never actually do.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/signin"
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-base transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(6,182,212,0.3)] relative overflow-hidden group text-center"
                >
                  {user ? "Go to Dashboard" : "Get Started Free"}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  <BorderBeam size={100} duration={4} colorFrom="#ffffff" colorTo="#06b6d4" />
                </Link>
                <button
                  onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-base transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  The Neural Edge
                </button>
              </div>

              <div className="mt-12 flex items-center gap-8 border-t border-white/5 pt-8">
                <div>
                  <div className="text-2xl font-bold text-white">99.4%</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Retention Accuracy</div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <div className="text-2xl font-bold text-white">12k+</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Skills Synced</div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <div className="text-2xl font-bold text-white">Institutional</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Grade AI Models</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-cyan-500/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
              <DotGlobeHero 
                className="border-none bg-transparent h-[700px] overflow-visible rounded-none mb-0 w-full" 
                globeRadius={1.5}
                rotationSpeed={0.002}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features Overlay ── */}
      <section id="features" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Technical Mastery Infrastructure</h2>
            <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
              Our autonomous learning engine eliminates cognitive decay through real-time neural link analysis and adaptive retrieval scheduling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <CardContainer className="inter-var w-full">
                  <CardBody className="bg-zinc-950/50 border border-white/10 p-8 rounded-[2rem] h-full transition-all group/card hover:border-cyan-500/30">
                    <CardItem translateZ="50" className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                      <feature.icon className={`w-6 h-6 text-${feature.color}-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]`} />
                    </CardItem>
                    <CardItem translateZ="60" className="text-xl font-bold text-white mb-4">
                      {feature.title}
                    </CardItem>
                    <CardItem translateZ="100" className="text-zinc-400 text-sm leading-relaxed mb-6 font-medium">
                      {feature.description}
                    </CardItem>
                    <CardItem translateZ="40" className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-2">
                       Protocol 0{i+1} Ready <ChevronRight className="w-3 h-3" />
                    </CardItem>
                  </CardBody>
                </CardContainer>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Call to Action ── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[3rem] p-16 shadow-2xl overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none" />
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Initialize Neural Link</h2>
            <p className="text-zinc-400 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
              Join 5,000+ architects and developers orchestrating their mastery with neural telemetry. No more manual tracking.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signin"
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-5 rounded-full bg-white text-black font-bold text-lg hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-2xl text-center"
              >
                {user ? "Go to Dashboard" : "Launch Protocol"}
                <LogIn className="w-5 h-5" />
              </Link>
              <button
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-5 rounded-full bg-white/5 border border-white/10 text-zinc-400 font-bold text-sm"
              >
                View Changelog
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-20 border-t border-white/5 bg-black z-10 relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 relative">
                 <Image src="/logo/cognizance-icon.png" alt="Cognizance" width={32} height={32} style={{ mixBlendMode: 'screen' }} />
              </div>
              <span className="text-lg font-bold">Cognizance</span>
            </div>
            <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
              Institutional-grade cognitive infrastructure for the next generation of technical masters.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-6">Autonomous Nodes</h4>
            <ul className="space-y-4 text-sm text-zinc-500 font-medium">
              <li><Link href="/study" className="hover:text-cyan-400 transition-colors">Neural Study</Link></li>
              <li><Link href="/scenarios" className="hover:text-cyan-400 transition-colors">Deep Scenarios</Link></li>
              <li><Link href="/quiz" className="hover:text-cyan-400 transition-colors">Tactical Quizzes</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-6">Structural</h4>
            <ul className="space-y-4 text-sm text-zinc-500 font-medium">
              <li><Link href="/planner" className="hover:text-cyan-400 transition-colors">Smart Planner</Link></li>
              <li><Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Telemetry Hub</Link></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Neural Docs</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between gap-4 text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
          <span>© 2026 COGNIZANCE NEURAL SYSTEMS — ALL PATHWAYS SECURED</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">SLA</a>
            <a href="#" className="hover:text-white transition-colors">Neural Analytics Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Node Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
