"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Sparkles, ChevronRight, LogIn } from 'lucide-react';
import { cn } from "@/lib/utils";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, updateProfile, signInWithEmailAndPassword } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";

// ─── Utility Components ───────────────────────────────────────────────────────

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

// ─── Main SignIn Page ────────────────────────────────────────────────────────

export default function SignInPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  const [step, setStep] = useState<"auth" | "onboarding" | "success">("auth");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  // 3D Card Effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Auth Redirects
  useEffect(() => {
    if (!loading && user && user.displayName && step !== "success") {
      router.push("/dashboard");
    } else if (!loading && user && !user.displayName) {
      setStep("onboarding");
    }
  }, [user, loading, router, step]);

  const handleSignInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (!result.user.displayName) {
        setStep("onboarding");
      } else {
        setStep("success");
      }
    } catch (e) {
      console.error("Sign in failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!email || !password) return;
     setIsLoading(true);
     try {
       await signInWithEmailAndPassword(auth, email, password);
       // useAuthState will handle redirect
     } catch (e) {
       console.error("Login failed", e);
     } finally {
       setIsLoading(false);
     }
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !auth.currentUser) return;
    setIsLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName: userName });
      setStep("success");
    } catch (e) {
      console.error("Update profile failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-black relative overflow-hidden flex items-center justify-center p-6 selection:bg-purple-500/30 selection:text-purple-200">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/10 to-black" />
      
      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-soft-light" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}
      />

      {/* Radial Glows */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-purple-500/5 blur-[120px]" />
      <motion.div 
        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[100vh] h-[60vh] rounded-b-full bg-purple-400/5 blur-[100px]"
        animate={{ opacity: [0.05, 0.1, 0.05], scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "mirror" }}
      />
      <motion.div 
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[90vh] h-[90vh] rounded-t-full bg-purple-500/5 blur-[100px]"
        animate={{ opacity: [0.1, 0.15, 0.1], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, repeatType: "mirror", delay: 1 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-sm relative z-10"
        style={{ perspective: 1500 }}
      >
        <motion.div
          className="relative"
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative group">
            {/* Card glow effect */}
            <motion.div 
              className="absolute -inset-[1px] rounded-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none"
              animate={{
                boxShadow: [
                  "0 0 10px 2px rgba(168,85,247,0.1)",
                  "0 0 15px 5px rgba(168,85,247,0.15)",
                  "0 0 10px 2px rgba(168,85,247,0.1)"
                ],
              }}
              transition={{ duration: 4, repeat: Infinity, repeatType: "mirror" }}
            />

            {/* Traveling light beam effect */}
            <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
              <motion.div 
                className="absolute top-0 left-0 h-[2px] w-[50%] bg-gradient-to-r from-transparent via-purple-300 to-transparent opacity-40"
                animate={{ left: ["-50%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
              />
              <motion.div 
                className="absolute bottom-0 right-0 h-[2px] w-[50%] bg-gradient-to-r from-transparent via-purple-300 to-transparent opacity-40"
                animate={{ right: ["-50%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 1, delay: 1.5 }}
              />
            </div>

            {/* Glass card background */}
            <div className="relative bg-black/60 backdrop-blur-3xl rounded-2xl p-8 border border-white/5 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
                  style={{
                    backgroundImage: `linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)`,
                    backgroundSize: '30px 30px'
                  }}
                />

                <div className="relative z-10">
                <AnimatePresence mode="wait">
                  {step === "auth" ? (
                    <motion.div
                      key="auth-ui"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      {/* Logo and header */}
                      <div className="text-center space-y-2 mb-8">
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                          Welcome Back
                        </h1>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-wide">
                          Neural Link Initialization
                        </p>
                      </div>

                      {/* Login form */}
                      <form onSubmit={handleLoginSubmit} className="space-y-4">
                        <div className="space-y-3">
                          <motion.div 
                            className="relative"
                            whileFocus={{ scale: 1.01 }}
                          >
                            <Mail className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors", focusedInput === "email" ? "text-purple-400" : "text-white/30")} />
                            <Input
                              type="email"
                              placeholder="Architect Email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              onFocus={() => setFocusedInput("email")}
                              onBlur={() => setFocusedInput(null)}
                              className="pl-10 h-11 bg-white/5 border-white/10 focus:border-purple-500/50 focus:bg-white/10 text-white placeholder:text-white/20 rounded-xl"
                              required
                            />
                          </motion.div>

                          <motion.div 
                            className="relative"
                            whileFocus={{ scale: 1.01 }}
                          >
                            <Lock className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors", focusedInput === "password" ? "text-purple-400" : "text-white/30")} />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Access Key"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              onFocus={() => setFocusedInput("password")}
                              onBlur={() => setFocusedInput(null)}
                              className="pl-10 pr-10 h-11 bg-white/5 border-white/10 focus:border-purple-500/50 focus:bg-white/10 text-white placeholder:text-white/20 rounded-xl"
                              required
                            />
                            <button 
                              type="button"
                              onClick={() => setShowPassword(!showPassword)} 
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4 text-white/30 hover:text-white transition-colors" /> : <Eye className="w-4 h-4 text-white/30 hover:text-white transition-colors" />}
                            </button>
                          </motion.div>
                        </div>

                        <div className="flex items-center justify-between px-1">
                          <label className="flex items-center gap-2 cursor-pointer group">
                             <div className="relative">
                               <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} className="sr-only" />
                               <div className={cn("w-4 h-4 border rounded transition-all", rememberMe ? "bg-purple-500 border-purple-500" : "bg-white/5 border-white/20")} />
                               {rememberMe && <div className="absolute inset-0 flex items-center justify-center text-white"><div className="w-1.5 h-1.5 bg-white rounded-full" /></div>}
                             </div>
                             <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 group-hover:text-white/60 transition-colors">Remember link</span>
                          </label>
                          <Link href="#" className="text-[10px] uppercase font-bold tracking-widest text-white/40 hover:text-white/60 transition-colors">Lost link?</Link>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={isLoading}
                          className="w-full relative group/btn h-11 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2"
                        >
                          {isLoading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : (
                            <>
                              Initialize Protocol
                              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </>
                          )}
                        </motion.button>

                        <div className="relative flex items-center gap-4 py-2">
                          <div className="flex-grow border-t border-white/5"></div>
                          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">or</span>
                          <div className="flex-grow border-t border-white/5"></div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={handleSignInWithGoogle}
                          disabled={isLoading}
                          className="w-full h-11 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all flex items-center justify-center gap-3 group/google"
                        >
                          <img src="https://www.google.com/favicon.ico" alt="G" className="w-4 h-4 rounded-full opacity-70 group-hover/google:opacity-100 transition-opacity" />
                          <span className="text-sm text-white/80 group-hover/google:text-white">Sign in with Google</span>
                        </motion.button>

                        <p className="text-center text-[10px] text-white/40 uppercase tracking-widest font-bold mt-6">
                          Don't have a neural link?{' '}
                          <Link href="#" className="text-purple-400 hover:text-purple-300 transition-colors">Establish Now</Link>
                        </p>
                      </form>
                    </motion.div>
                  ) : step === "onboarding" ? (
                    <motion.div
                      key="onboarding-ui"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-8 text-center"
                    >
                      <div className="space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                          <User className="w-8 h-8 text-purple-400" />
                        </div>
                        <div className="space-y-1">
                          <h1 className="text-2xl font-bold text-white">Neural Alias</h1>
                          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">How should the terminal greet you?</p>
                        </div>
                      </div>
                      
                      <form onSubmit={handleOnboardingSubmit} className="space-y-4">
                        <Input 
                          type="text" 
                          placeholder="Architect Alias (e.g. Alex)"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          className="h-12 bg-white/5 border-purple-500/20 focus:border-purple-400 focus:bg-white/10 text-white placeholder:text-white/20 rounded-xl text-center text-lg"
                          required
                          autoFocus
                        />
                        <button 
                          type="submit"
                          disabled={isLoading}
                          className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-400 text-white font-bold h-12 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                        >
                          {isLoading ? "Syncing..." : "Initialize Link"} <ChevronRight className="w-4 h-4" />
                        </button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success-ui"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-8 text-center"
                    >
                      <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                        <Sparkles className="w-10 h-10 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                      </div>
                      <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-white leading-tight">Link Established</h1>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Neural Link Sync Complete</p>
                      </div>
                      
                      <motion.button 
                        onClick={() => router.push("/dashboard")}
                        className="w-full h-12 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-all shadow-2xl flex items-center justify-center gap-2"
                      >
                        Enter Master Terminal <LogIn className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
                </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
