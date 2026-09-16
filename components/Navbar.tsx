"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpenText, Moon, Sun, Github, Sparkles } from "lucide-react";

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const stored = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setTheme(stored);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 w-full border-b border-border/40 glass"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <BookOpenText className="h-5 w-5 text-primary" />
            <div className="absolute inset-0 rounded-xl bg-primary/5 animate-pulse-ring" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight">
              DeepCite
            </span>
            <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">
              Multi-Agent Research
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="font-medium">Groq GPT-OSS 120B</span>
          </div>

          <a
            href="https://github.com/Prakhar00001/DeepCite"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Github className="h-4 w-4" />
          </a>

          {mounted && (
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
