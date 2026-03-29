"use client";

import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, BarChart2, BookOpen, PenTool, Calendar, Layers, Route, LogOut, ChevronUp, LogIn, RefreshCw } from "lucide-react";
import Image from "next/image";
import { auth, googleProvider, githubProvider, microsoftProvider } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithPopup, signOut } from "firebase/auth";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: <BarChart2 className="w-5 h-5 shrink-0" /> },
  { name: "Study", href: "/study", icon: <BookOpen className="w-5 h-5 shrink-0" /> },
  { name: "Quiz", href: "/quiz", icon: <PenTool className="w-5 h-5 shrink-0" /> },
  { name: "Flashcards", href: "/flashcards", icon: <Layers className="w-5 h-5 shrink-0" /> },
  { name: "Scenarios", href: "/scenarios", icon: <Route className="w-5 h-5 shrink-0" /> },
  { name: "Planner", href: "/planner", icon: <Calendar className="w-5 h-5 shrink-0" /> },
];

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider");
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);
  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;
  return <SidebarContext.Provider value={{ open, setOpen, animate }}>{children}</SidebarContext.Provider>;
};

const DesktopSidebar = ({ className, children, ...props }: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn("h-full px-4 py-4 hidden md:flex md:flex-col bg-zinc-950/80 border-r border-white/5 w-[240px] flex-shrink-0 z-50", className)}
      animate={{ width: animate ? (open ? "240px" : "80px") : "240px" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

const MobileSidebar = ({ className, children, ...props }: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <div className={cn("h-14 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-zinc-950 border-b border-white/5 w-full z-50")} {...props}>
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 shrink-0 relative flex items-center justify-center">
          <Image 
            src="/logo/cognizance-icon.png" 
            alt="Cognizance" 
            width={44} 
            height={44} 
            style={{ mixBlendMode: 'screen', filter: 'brightness(1.1) contrast(1.2)' }}
            className="object-contain drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]"
          />
        </div>
      </div>
      <div className="flex justify-end z-20">
        <Menu className="text-neutral-200 cursor-pointer w-6 h-6" onClick={() => setOpen(!open)} />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn("fixed h-full w-full inset-0 bg-zinc-950 p-10 z-[100] flex flex-col justify-between", className)}
          >
            <div className="absolute right-6 top-6 z-50 text-neutral-200 cursor-pointer p-2 bg-white/5 rounded-full" onClick={() => setOpen(!open)}>
              <X className="w-6 h-6" />
            </div>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AccountSwitcher = () => {
  const [user] = useAuthState(auth);
  const [isOpen, setIsOpen] = useState(false);
  const { open: sidebarOpen } = useSidebar();

  const handleSignIn = async (provider: any) => {
    try { await signInWithPopup(auth, provider); } catch (e) { console.error(e); }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/5 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden border border-white/10">
          {user?.photoURL ? <Image src={user.photoURL} alt="User" width={40} height={40} /> : <span className="text-sm font-semibold text-white/70 flex items-center justify-center w-full h-full">{user?.email?.[0].toUpperCase() || 'U'}</span>}
        </div>
        {sidebarOpen && (
          <div className="flex flex-col items-start overflow-hidden">
            <span className="text-sm text-white font-medium truncate w-32">{user?.displayName || 'Guest'}</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Account</span>
          </div>
        )}
        {sidebarOpen && <ChevronUp className={cn("w-4 h-4 text-zinc-500 transition-transform", isOpen && "rotate-180")} />}
      </button>

      <AnimatePresence>
        {isOpen && sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 w-full mb-2 bg-zinc-900 border border-white/10 rounded-xl p-2 shadow-2xl z-[100]"
          >
            {!user ? (
              <>
                <button onClick={() => handleSignIn(googleProvider)} className="flex items-center gap-2 w-full p-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors leading-none"><LogIn className="w-4 h-4" /> Sign in with Google</button>
              </>
            ) : (
              <button 
                onClick={() => signOut(auth)} 
                className="flex items-center gap-2 w-full p-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" /> 
                Sign Out
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function Sidebar() {
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/signin") return null;

  return (
    <SidebarProvider>
      <DesktopSidebar className="backdrop-blur-xl relative">
        <div className="absolute top-0 right-0 w-32 h-64 bg-[var(--color-accent)]/10 blur-[80px] pointer-events-none -mr-16" />
        <div className="flex flex-col gap-2 flex-1 pt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <SidebarLink 
                key={item.href} 
                link={{ label: item.name, href: item.href, icon: item.icon }} 
                active={isActive} 
              />
            );
          })}
        </div>
        <div className="mt-auto border-t border-white/5 pt-4 mb-2 relative group-footer px-2">
           <AccountSwitcher />
        </div>
      </DesktopSidebar>
      <MobileSidebar>
        <div className="flex flex-col gap-6 pt-12">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <SidebarLink 
                key={item.href} 
                link={{ label: item.name, href: item.href, icon: item.icon }} 
                active={isActive} 
                className="text-lg py-4"
              />
            );
          })}
        </div>
      </MobileSidebar>
    </SidebarProvider>
  );
}

const SidebarLink = ({
  link,
  active,
  className,
  ...props
}: {
  link: { label: string; href: string; icon: React.ReactNode };
  active?: boolean;
  className?: string;
  props?: LinkProps;
}) => {
  const { open, animate } = useSidebar();
  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-3 group/sidebar px-3 py-3 rounded-xl transition-all relative overflow-hidden",
        active ? "bg-white/10 text-cyan-400 shadow-[inset_0_1px_rgba(255,255,255,0.1),0_0_20px_rgba(6,182,212,0.15)]" : "text-zinc-400 hover:text-white hover:bg-white/5",
        className
      )}
      {...props}
    >
      {active && (
        <>
          <motion.div 
            layoutId="sidebar-active"
            className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-transparent pointer-events-none" 
          />
          <motion.div 
            layoutId="sidebar-pill"
            className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-cyan-400 rounded-r-md shadow-[0_0_10px_rgba(6,182,212,0.8)]"
          />
        </>
      )}
      
      {/* Tooltip on collapse */}
      {!open && animate && (
        <div className="absolute left-16 px-2 py-1 bg-zinc-800 border border-white/10 text-white text-xs rounded opacity-0 group-hover/sidebar:opacity-100 pointer-events-none z-[100] transition-opacity whitespace-nowrap hidden md:block">
          {link.label}
        </div>
      )}

      <div className={cn("relative z-10 shrink-0", active ? "drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]" : "")}>{link.icon}</div>
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-[14px] font-medium transition duration-150 whitespace-nowrap !p-0 !m-0 relative z-10"
      >
        {link.label}
      </motion.span>
    </Link>
  );
};
