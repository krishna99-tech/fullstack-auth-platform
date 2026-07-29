"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Copy,
  LayoutDashboard,
  Settings,
  Home,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface Position {
  x: number;
  y: number;
}

export function GlobalContextMenu() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Allow default right-click if Shift key is held or if clicking inside an input/textarea
      const target = e.target as HTMLElement;
      if (
        e.shiftKey ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      e.preventDefault();

      // Get window dimensions
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Estimate menu dimensions (approx 240px wide, 350px high)
      const menuWidth = 240;
      const menuHeight = 350;

      // Calculate safe coordinates
      let x = e.clientX;
      let y = e.clientY;

      if (x + menuWidth > windowWidth) {
        x = windowWidth - menuWidth - 8;
      }
      if (y + menuHeight > windowHeight) {
        y = windowHeight - menuHeight - 8;
      }

      setPosition({ x, y });
      setIsOpen(true);
    };

    const handleClick = () => {
      if (isOpen) setIsOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const copyUrl = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95, y: -5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -5 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{ top: position.y, left: position.x }}
          className="fixed z-[9999] w-[240px] flex flex-col gap-1 p-1.5 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl rounded-xl text-black dark:text-white select-none overflow-hidden"
          onContextMenu={(e) => e.preventDefault()} // Prevent context menu inside context menu
        >
          {/* Top Actions Group */}
          <div className="flex items-center justify-between p-1 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-lg mb-1">
            <button
              onClick={() => handleAction(() => window.history.back())}
              className="p-2 rounded-md hover:bg-white dark:hover:bg-zinc-800 transition-colors flex-1 flex justify-center text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white group"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4 group-active:-translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => handleAction(() => window.history.forward())}
              className="p-2 rounded-md hover:bg-white dark:hover:bg-zinc-800 transition-colors flex-1 flex justify-center text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white group"
              title="Forward"
            >
              <ArrowRight className="w-4 h-4 group-active:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => handleAction(() => window.location.reload())}
              className="p-2 rounded-md hover:bg-white dark:hover:bg-zinc-800 transition-colors flex-1 flex justify-center text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white group"
              title="Reload"
            >
              <RotateCw className="w-4 h-4 group-active:rotate-90 transition-transform" />
            </button>
          </div>

          <MenuSeparator />

          <MenuItem
            icon={<Copy className="w-4 h-4" />}
            label="Copy Current URL"
            onClick={() => handleAction(copyUrl)}
          />

          <MenuSeparator />

          <MenuItem
            icon={<Home className="w-4 h-4" />}
            label="Home"
            onClick={() => handleAction(() => router.push("/"))}
          />
          <MenuItem
            icon={<LayoutDashboard className="w-4 h-4" />}
            label="Dashboard"
            onClick={() => handleAction(() => router.push("/dashboard"))}
          />
          <MenuItem
            icon={<Settings className="w-4 h-4" />}
            label="Settings"
            onClick={() => handleAction(() => router.push("/dashboard/settings"))}
          />
          <MenuItem
            icon={theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            label={theme === 'dark' ? "Light Mode" : "Dark Mode"}
            onClick={() => handleAction(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}
          />

          <MenuSeparator />

          <MenuItem
            icon={<LogOut className="w-4 h-4 text-rose-500" />}
            label="Sign Out"
            onClick={() => handleAction(() => {
              localStorage.removeItem("token");
              router.push("/login");
            })}
            danger
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center w-full gap-3 px-3 py-2 text-[13px] font-medium rounded-md transition-colors",
        danger
          ? "hover:bg-rose-500/10 text-rose-600 dark:text-rose-400"
          : "hover:bg-black/5 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function MenuSeparator() {
  return <div className="h-[1px] w-full bg-zinc-200/50 dark:bg-zinc-800/50 my-1" />;
}
