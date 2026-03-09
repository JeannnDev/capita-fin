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
        { title: "Stats", icon: BarChart3, url: "/estatisticas" },
        { title: "Metas", icon: Target, url: "/metas" },
    ];

    return (
        <div className="fixed bottom-6 left-6 right-6 h-20 bg-slate-950/80 dark:bg-slate-900/90 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl z-50 flex items-center justify-between px-8 md:hidden overflow-hidden transform hover:scale-[1.01] transition-all active:scale-[0.99] group mt-auto">
            {items.slice(0, 2).map((item) => (
                <NavItem key={item.title} {...item} isActive={pathname === item.url} />
            ))}

            <div className="-mt-12 group/add relative">
                <div className="absolute inset-0 bg-primary blur-3xl opacity-20 group-hover/add:opacity-40 transition-opacity" />
                <button className="w-16 h-16 bg-primary rounded-[1.5rem] shadow-2xl flex items-center justify-center text-white transform hover:rotate-90 hover:scale-110 active:scale-90 transition-all duration-500 relative z-10">
                    <Plus size={32} strokeWidth={3} />
                </button>
            </div>

            {items.slice(2, 4).map((item) => (
                <NavItem key={item.title} {...item} isActive={pathname === item.url} />
            ))}
        </div>
    );
}

function NavItem({ title, icon: Icon, url, isActive }: { title: string, icon: any, url: string, isActive: boolean }) {
    return (
        <Link href={url} className="flex flex-col items-center justify-center space-y-1 relative group">
            <div className={cn(
                "p-2 rounded-2xl transition-all duration-300",
                isActive ? "text-primary bg-primary/10" : "text-slate-400 group-hover:text-white"
            )}>
                <Icon size={24} strokeWidth={isActive ? 3 : 2} />
            </div>
            <span className={cn(
                "text-[9px] font-black uppercase tracking-widest transition-all duration-300 opacity-0 transform -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0",
                isActive ? "text-primary opacity-100 translate-y-0" : "text-slate-500"
            )}>
                {title}
            </span>
            {isActive && (
                <div className="absolute -bottom-4 w-1 h-1 bg-primary rounded-full animate-ping" />
            )}
        </Link>
    );
}
