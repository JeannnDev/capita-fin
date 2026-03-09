"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => setMounted(true), []);

    if (!mounted) {
        return <div className="w-16 h-8 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10" />;
    }

    return (
        <div
            className="flex items-center p-1 bg-slate-200/50 dark:bg-slate-800/50 border border-slate-300 dark:border-white/10 rounded-full cursor-pointer relative w-14 h-7"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
            <div className={cn(
                "absolute w-5 h-5 rounded-full shadow-sm transition-all duration-300 ease-in-out flex items-center justify-center",
                theme === "dark"
                    ? "translate-x-7 bg-indigo-600 text-white"
                    : "translate-x-0 bg-white text-slate-900"
            )}>
                {theme === "dark" ? <Moon size={12} fill="currentColor" /> : <Sun size={12} />}
            </div>
            <div className="flex-1 flex justify-center z-0 opacity-40">
                <Sun size={12} className={cn(theme === "dark" ? "text-slate-400" : "hidden")} />
            </div>
            <div className="flex-1 flex justify-center z-0 opacity-40">
                <Moon size={12} className={cn(theme === "light" ? "text-slate-400" : "hidden")} />
            </div>
        </div>
    );
}
