"use client";

import * as React from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogOut, User, Moon, Sun, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "./ui/dropdown-menu";

const themeColors = [
    { name: "default", color: "bg-[#f59e0b]", hex: "#f59e0b" }, // Gold
    { name: "blue", color: "bg-[#3b82f6]", hex: "#3b82f6" },
    { name: "green", color: "bg-[#22c55e]", hex: "#22c55e" },
    { name: "red", color: "bg-[#ef4444]", hex: "#ef4444" },
    { name: "pink", color: "bg-[#ec4899]", hex: "#ec4899" },
    { name: "purple", color: "bg-[#8b5cf6]", hex: "#8b5cf6" },
    { name: "orange", color: "bg-[#f97316]", hex: "#f97316" },
];

export function UserMenu() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { data: session } = authClient.useSession();
    const user = session?.user;

    const [activeColor, setActiveColor] = React.useState("default");

    // Initialize theme color from localStorage on mount
    React.useEffect(() => {
        const savedColor = localStorage.getItem("capitafin-theme-color") || "default";
        setActiveColor(savedColor);
        document.documentElement.setAttribute("data-theme", savedColor);
    }, []);

    const changeColor = (colorName: string) => {
        setActiveColor(colorName);
        localStorage.setItem("capitafin-theme-color", colorName);
        document.documentElement.setAttribute("data-theme", colorName);
    };

    const initials = user?.name
        ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
        : "?";

    const handleSignOut = async () => {
        await authClient.signOut();
        router.push("/login");
        router.refresh();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center overflow-hidden">
                    <span className="text-sm font-black text-primary">{initials}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 rounded-[2.5rem] border-none shadow-2xl p-6 bg-background/95 backdrop-blur-2xl animate-in zoom-in-95 duration-200" align="end" sideOffset={8}>
                {/* Profile Header */}
                <div className="flex flex-col items-center py-2">
                    <div className="h-24 w-24 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-900 shadow-xl flex items-center justify-center mb-4 overflow-hidden relative group">
                        <span className="text-3xl font-black text-slate-400 dark:text-slate-500">{initials}</span>
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                            <User className="text-white h-6 w-6" />
                        </div>
                    </div>
                    <h2 className="text-xl font-black tracking-tight truncate max-w-full">{user?.name ?? "Usuário"}</h2>
                    <p className="text-[11px] text-muted-foreground font-medium truncate max-w-full mt-1 mb-5">{user?.email ?? ""}</p>

                </div>

                <DropdownMenuSeparator className="bg-muted/30 my-2" />

                {/* Menu Options */}
                <div className="space-y-1">
                    <DropdownMenuItem 
                        onClick={() => router.push("/configuracoes")}
                        className="rounded-2xl py-3.5 px-4 font-bold cursor-pointer focus:bg-primary/10 focus:text-primary space-x-4 transition-all active:scale-[0.98]">
                        <User size={18} className="text-slate-400" />
                        <span className="text-sm">Editar Perfil</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-muted/10 my-2" />

                    {/* Theme Customizer Section */}
                    <div className="px-4 py-4 space-y-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                    {theme === 'dark' ? <Moon size={16} className="text-primary" /> : <Sun size={16} className="text-primary" />}
                                </div>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Modo {theme === 'dark' ? 'Escuro' : 'Claro'}</span>
                            </div>
                            <div
                                className="w-11 h-6 bg-slate-200 dark:bg-slate-800 rounded-full p-1 cursor-pointer transition-all hover:bg-slate-300 dark:hover:bg-slate-700 relative"
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            >
                                <div className={cn(
                                    "w-4 h-4 rounded-full transition-all duration-300 shadow-sm",
                                    theme === 'dark' ? 'translate-x-5 bg-primary' : 'translate-x-0 bg-white'
                                )} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Cor do Tema</span>
                                <div className="flex flex-wrap gap-3">
                                    {themeColors.map((c) => (
                                        <button
                                            key={c.name}
                                            onClick={() => changeColor(c.name)}
                                            className={cn(
                                                "w-7 h-7 rounded-full transition-all hover:scale-110 active:scale-95 flex items-center justify-center shadow-md",
                                                c.color,
                                                activeColor === c.name ? "ring-2 ring-offset-2 ring-primary ring-offset-background scale-110" : "opacity-80 hover:opacity-100"
                                            )}
                                            title={c.name}
                                        >
                                            {activeColor === c.name && <Check size={12} className="text-white" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DropdownMenuSeparator className="bg-muted/30 my-2" />

                    <DropdownMenuItem
                        onClick={handleSignOut}
                        className="rounded-2xl py-3.5 px-4 font-bold cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive space-x-4 transition-all active:scale-[0.98] mt-2"
                    >
                        <LogOut size={18} />
                        <span className="text-sm">Sair da conta</span>
                    </DropdownMenuItem>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
