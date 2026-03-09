"use client";

import { LayoutDashboard, Receipt, BarChart3, Plus, Target } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const pathname = usePathname();

    const items = [
        { title: "Home", icon: LayoutDashboard, url: "/" },
        { title: "Gasto", icon: Receipt, url: "/gastos" },
        { title: "Metas", icon: Target, url: "/metas" },
        { title: "Stats", icon: BarChart3, url: "/estatisticas" },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-background/80 backdrop-blur-2xl border-t border-slate-200 dark:border-slate-800 z-50 flex items-center justify-around px-4 md:hidden pb-safe">
            {/* Left side items */}
            <div className="flex items-center justify-around flex-1">
                {items.slice(0, 2).map((item) => (
                    <NavItem key={item.title} {...item} isActive={pathname === item.url} />
                ))}
            </div>

            {/* Central Action Button */}
            <div className="relative -mt-10 mx-4">
                <div className="absolute inset-0 bg-primary blur-2xl opacity-40 animate-pulse" />
                <button className="w-16 h-16 bg-primary rounded-full shadow-[0_8px_30px_rgb(var(--primary),0.4)] flex items-center justify-center text-white transform active:scale-90 transition-all duration-300 relative z-10 border-4 border-background">
                    <Plus size={32} strokeWidth={3} />
                </button>
            </div>

            {/* Right side items */}
            <div className="flex items-center justify-around flex-1">
                {items.slice(2, 4).map((item) => (
                    <NavItem key={item.title} {...item} isActive={pathname === item.url} />
                ))}
            </div>
        </div>
    );
}

function NavItem({ title, icon: Icon, url, isActive }: { title: string, icon: any, url: string, isActive: boolean }) {
    return (
        <Link href={url} className="flex flex-col items-center justify-center space-y-1.5 flex-1 py-2 outline-none">
            <div className={cn(
                "p-1 rounded-full transition-all duration-300",
                isActive ? "text-primary transform scale-110" : "text-slate-500 dark:text-slate-400"
            )}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={cn(
                "text-[10px] font-bold tracking-tight transition-all duration-300",
                isActive ? "text-primary" : "text-slate-400 dark:text-slate-500"
            )}>
                {title}
            </span>
            {isActive && (
                <div className="w-1 h-1 bg-primary rounded-full mt-0.5" />
            )}
        </Link>
    );
}
