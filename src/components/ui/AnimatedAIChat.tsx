"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import {
    ImageIcon, PenTool, MonitorIcon, User, Bot,
    Paperclip, SendIcon, XIcon, LoaderIcon, Sparkles, Command
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";

/**
 * Utility to strip markdown formatting for 'pure text' preference.
 */
function stripMarkdown(text: string): string {
  if (typeof text !== "string") return text;
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // Bold
    .replace(/\*(.*?)\*/g, "$1")     // Italic
    .replace(/__/g, "")              // Bold alt
    .replace(/_ /g, " ")             // Italic alt
    .replace(/`(.*?)`/g, "$1")       // Code
    .replace(/#/g, "")               // Headers
    .trim();
}

interface AnimatedAIChatProps {
    messages: { role: string; content: string }[];
    isTyping: boolean;
    onSendMessage: (msg: string) => void;
    contextSkill?: string;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: { minHeight: number; maxHeight?: number }) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }
            textarea.style.height = `${minHeight}px`;
            const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY));
            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) textarea.style.height = `${minHeight}px`;
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { containerClassName?: string; showRing?: boolean }>((
    { className, containerClassName, showRing = true, ...props }, ref
) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <div className={cn("relative", containerClassName)}>
            <textarea
                className={cn(
                    "flex w-full rounded-md bg-transparent px-3 py-2 text-sm",
                    "transition-all duration-200 ease-in-out",
                    "placeholder:text-white/20",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "focus:outline-none resize-none",
                    className
                )}
                ref={ref}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                {...props}
            />
            {showRing && isFocused && (
                <motion.span 
                    className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-[var(--color-accent)]/30"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                />
            )}
        </div>
    )
});
Textarea.displayName = "Textarea";

export function AnimatedAIChat({ messages, isTyping, onSendMessage, contextSkill }: AnimatedAIChatProps) {
    const [value, setValue] = useState("");
    const [attachments, setAttachments] = useState<string[]>([]);
    const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 40, maxHeight: 150 });
    const [inputFocused, setInputFocused] = useState(false);
    const commandPaletteRef = useRef<HTMLDivElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const commandSuggestions = [
        { icon: <Sparkles className="w-4 h-4" />, label: "Explain simply", prefix: "/explain" },
        { icon: <ImageIcon className="w-4 h-4" />, label: "Give an example", prefix: "/example" },
        { icon: <MonitorIcon className="w-4 h-4" />, label: "Common mistakes", prefix: "/mistakes" },
        { icon: <PenTool className="w-4 h-4" />, label: "Practice question", prefix: "/practice" },
    ];

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    useEffect(() => {
        if (value.startsWith('/') && !value.includes(' ')) {
            setShowCommandPalette(true);
            const matchingSuggestionIndex = commandSuggestions.findIndex(cmd => cmd.prefix.startsWith(value));
            setActiveSuggestion(matchingSuggestionIndex >= 0 ? matchingSuggestionIndex : -1);
        } else {
            setShowCommandPalette(false);
        }
    }, [value]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (commandPaletteRef.current && !commandPaletteRef.current.contains(target)) {
                setShowCommandPalette(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showCommandPalette) {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActiveSuggestion(p => p < commandSuggestions.length - 1 ? p + 1 : 0); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveSuggestion(p => p > 0 ? p - 1 : commandSuggestions.length - 1); }
            else if (e.key === 'Tab' || e.key === 'Enter') {
                e.preventDefault();
                if (activeSuggestion >= 0) {
                    setValue(commandSuggestions[activeSuggestion].label + " ");
                    setShowCommandPalette(false);
                }
            } else if (e.key === 'Escape') { e.preventDefault(); setShowCommandPalette(false); }
        } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSend = () => {
        if (value.trim()) {
            onSendMessage(value.trim());
            setValue("");
            adjustHeight(true);
        }
    };

    return (
        <div className="flex flex-col h-full w-full relative overflow-hidden bg-[var(--color-bg-dark)]">
            {/* Ambient Background */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-accent)]/10 rounded-full mix-blend-normal blur-[96px] animate-pulse" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/10 rounded-full mix-blend-normal blur-[96px] animate-pulse delay-700" />
            </div>

            {/* Header Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 z-10 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center py-20">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <h2 className="text-2xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white/90 to-white/40 mb-2">
                                Study Assistant
                            </h2>
                            <p className="text-sm text-white/40">Ask me anything about {contextSkill || "your studies"}</p>
                        </motion.div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((m, i) => (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-white/5" : "bg-[var(--color-accent)]/20"}`}>
                                    {m.role === "user" ? <User className="w-4 h-4 text-white/70" /> : <Bot className="w-4 h-4 text-[var(--color-accent)]" />}
                                </div>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed backdrop-blur-sm border ${
                                    m.role === "user" ? "bg-[var(--color-accent)]/10 text-white border-[var(--color-accent)]/20" : "bg-white/5 text-white/80 border-white/10"
                                }`}>
                                    <span className="whitespace-pre-wrap">{stripMarkdown(m.content)}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
                
                <AnimatePresence>
                    {isTyping && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[var(--color-accent)]/20">
                                <Bot className="w-4 h-4 text-[var(--color-accent)]" />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-white/70 bg-white/5 rounded-2xl px-4 py-3 border border-white/10">
                                <span>Thinking</span>
                                <TypingDots />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={chatEndRef} />
            </div>

            {/* Input Wrapper */}
            <div className="shrink-0 p-4 border-t border-white/5 bg-black/20 backdrop-blur z-20">
                <div className="relative backdrop-blur-2xl bg-white/[0.02] rounded-2xl border border-white/10 shadow-2xl overflow-hidden group">
                    
                    <AnimatePresence>
                        {showCommandPalette && (
                            <motion.div 
                                ref={commandPaletteRef}
                                className="absolute left-0 right-0 bottom-full bg-black/95 border-b border-white/10 z-50 overflow-hidden"
                                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                            >
                                <div className="py-1">
                                    {commandSuggestions.map((suggestion, index) => (
                                        <div key={suggestion.prefix} onClick={() => { setValue(suggestion.label + " "); setShowCommandPalette(false); }} className={cn("flex items-center gap-2 px-4 py-3 text-sm cursor-pointer", activeSuggestion === index ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5")}>
                                            <div className="w-5 h-5 text-white/60">{suggestion.icon}</div>
                                            <div className="font-medium">{suggestion.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="p-2">
                        <Textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => { setValue(e.target.value); adjustHeight(); }}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setInputFocused(true)}
                            onBlur={() => setInputFocused(false)}
                            placeholder="Type / for quick actions..."
                            className="text-white/90 text-sm"
                            showRing={false}
                        />
                    </div>
                    
                    <div className="p-2 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
                        <div className="flex gap-1">
                            <button type="button" onClick={() => setShowCommandPalette(!showCommandPalette)} className="p-2 text-white/40 hover:text-white/90 rounded-lg hover:bg-white/5 transition-colors">
                                <Command className="w-4 h-4" />
                            </button>
                            <button type="button" className="p-2 text-white/40 hover:text-white/90 rounded-lg hover:bg-white/5 transition-colors">
                                <Paperclip className="w-4 h-4" />
                            </button>
                        </div>
                        <button type="button" onClick={handleSend} disabled={isTyping || !value.trim()} className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2", value.trim() ? "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]" : "bg-white/5 text-white/40")}>
                            {isTyping ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <SendIcon className="w-4 h-4" />}
                            <span>Send</span>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Interactive Glow */}
            {inputFocused && (
                <motion.div 
                    className="absolute w-[30rem] h-[30rem] rounded-full pointer-events-none z-0 opacity-10 bg-gradient-to-r from-[var(--color-accent)] via-fuchsia-500 to-indigo-500 blur-[80px]"
                    animate={{ x: mousePosition.x - 300, y: mousePosition.y - 300 }}
                    transition={{ type: "spring", damping: 25, stiffness: 150, mass: 0.5 }}
                />
            )}
        </div>
    );
}

function TypingDots() {
    return (
        <div className="flex items-center ml-1">
            {[1, 2, 3].map((dot) => (
                <motion.div key={dot} className="w-1.5 h-1.5 bg-white/90 rounded-full mx-0.5"
                    initial={{ opacity: 0.3 }} animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.85, 1.1, 0.85] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: dot * 0.15, ease: "easeInOut" }}
                />
            ))}
        </div>
    );
}
