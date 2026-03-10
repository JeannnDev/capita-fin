"use client";

import {
    LayoutDashboard,
    ArrowUpCircle,
    ArrowDownCircle,
    BarChart3,
    Settings,
    Search,
    Plus,
    Sparkles,
    Wallet,
    Target,
    Calendar
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/UserMenu";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { getAIInsights } from "@/actions/finance";

export function AppSidebar() {
    const pathname = usePathname();

    const menuItems = [
        { title: "Dashboard", icon: LayoutDashboard, url: "/" },
        { title: "Receitas", icon: ArrowUpCircle, url: "/receitas" },
        { title: "Despesas", icon: ArrowDownCircle, url: "/despesas" },
        { title: "Estatísticas", icon: BarChart3, url: "/estatisticas" },
        { title: "Metas", icon: Target, url: "/metas" },
    ];

    return (
        <Sidebar className="border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl">
            <SidebarHeader className="h-20 flex items-center px-6">
                <Link href="/" className="flex items-center space-x-3 group">
                    <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 group-hover:bg-primary transition-all duration-300">
                        <LayoutDashboard className="h-6 w-6 text-primary group-hover:text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-lg tracking-tighter uppercase leading-none">Capita<span className="text-primary">Fin</span></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Premium</span>
                    </div>
                </Link>
            </SidebarHeader>

            <SidebarContent className="px-3 pt-4">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 px-3">Principal</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-1">
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.url}
                                        className={cn(
                                            "h-12 rounded-2xl px-4 font-bold transition-all duration-200",
                                            pathname === item.url
                                                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl shadow-slate-200 dark:shadow-none"
                                                : "hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400"
                                        )}
                                    >
                                        <Link href={item.url} className="flex items-center space-x-3">
                                            <item.icon className="h-5 w-5" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <div className="mt-8 px-3">
                    <AIAnalysisCard />
                </div>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-slate-100 dark:border-slate-800">
                <CalendarBadge />
            </SidebarFooter>
        </Sidebar>
    );
}

function AIAnalysisCard() {
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleAnalyze = async () => {
        if (cooldown > 0) return;

        setLoading(true);
        try {
            const res = await getAIInsights();
            setInsight(res);
            setCooldown(60); // Inicia cooldown de 1 minuto
        } catch (e) {
            setInsight("Limite de requisições atingido. Tente novamente em breve.");
            setCooldown(30); // Cooldown menor para erros
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10 relative overflow-hidden group">
            <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                    <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                    {insight && !loading && (
                        <button
                            onClick={() => setInsight(null)}
                            className="text-[10px] font-black uppercase text-slate-400 hover:text-primary transition-colors"
                        >
                            Limpar
                        </button>
                    )}
                </div>
                <div>
                    <h3 className="text-sm font-black uppercase tracking-tight">Análise IA</h3>
                    {!insight && !loading ? (
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">Clique para receber conselhos personalizados do seu assistente Gemini.</p>
                    ) : loading ? (
                        <div className="flex flex-col items-center py-4 space-y-2">
                            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <span className="text-[9px] font-black uppercase text-primary animate-pulse">Consultando o Cérebro...</span>
                        </div>
                    ) : (
                        <div className="text-[11px] text-slate-600 font-bold leading-relaxed mt-2 whitespace-pre-wrap max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {insight}
                        </div>
                    )}
                </div>
                <Button
                    onClick={handleAnalyze}
                    disabled={loading || cooldown > 0}
                    className="w-full h-10 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
                >
                    {loading ? "Processando..." : cooldown > 0 ? `Aguarde ${cooldown}s` : insight ? "Recalcular" : "Analisar Agora"}
                </Button>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/20 transition-all duration-700" />
        </div>
    );
}

function SidebarSearch() {
    return (
        <div className="px-3 mb-6">
            <div className="relative group">
                <Search className="absolute left-4 top-4 h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                <input
                    type="text"
                    placeholder="Pesquisar..."
                    className="w-full h-12 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                />
            </div>
        </div>
    );
}

function CalendarBadge() {
    const date = new Date();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return (
        <div className="flex items-center space-x-3 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm shadow-slate-200 dark:shadow-none">
            <div className="flex flex-col items-end px-2">
                <span className="text-[10px] font-black tracking-widest text-primary uppercase">{month}/{year}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase px-1">Ativo</span>
            </div>
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center">
                <Calendar className="h-4 w-4" />
            </div>
        </div>
    );
}
