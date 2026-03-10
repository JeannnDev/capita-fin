"use client";

import { useEffect, useState } from "react";
import { getIncomes } from "@/actions/finance";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
    ArrowUpCircle,
    Search,
    Calendar,
    TrendingUp,
    Plus,
    LayoutDashboard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SetIncomeDialog } from "@/components/SetIncomeDialog";
import { UserMenu } from "@/components/UserMenu";

export default function ReceitasPage() {
    const [incomes, setIncomes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        const data = await getIncomes();
        setIncomes(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(val);
    };

    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Carregando Entradas</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <AppSidebar />
            <SidebarInset className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-slate-50 dark:bg-slate-950/20">
                <header className="h-16 md:h-28 flex items-center justify-between px-4 md:px-6 lg:px-10 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl sticky top-0 z-40">
                    <div className="flex items-center space-x-3">
                        <SidebarTrigger className="h-10 w-10 md:h-12 md:w-12 rounded-2xl md:hidden" />
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 hidden md:flex">
                                <ArrowUpCircle size={24} />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase leading-none">Minhas <span className="text-emerald-500">Receitas</span></h1>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Configuração de Ganhos</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <SetIncomeDialog>
                            <Button className="h-10 md:h-14 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                                <Plus className="mr-2 h-4 w-4" /> Definir Renda
                            </Button>
                        </SetIncomeDialog>
                        <UserMenu />
                    </div>
                </header>

                <main className="p-4 md:p-6 lg:p-10 max-w-[1200px] mx-auto w-full space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {incomes.map((inc) => (
                            <Card key={inc.id} className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-[2rem] overflow-hidden bg-white/50 dark:bg-slate-900/40 group hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300">
                                <CardContent className="p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:rotate-12 transition-transform">
                                            <TrendingUp size={24} />
                                        </div>
                                        <Badge variant="secondary" className="rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 border-none">
                                            {inc.ano}
                                        </Badge>
                                    </div>

                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{monthNames[inc.mes - 1]}</span>
                                        <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
                                            {formatCurrency(inc.valor)}
                                        </h2>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Renda Mensal</span>
                                        <div className="flex items-center text-emerald-500">
                                            Ativo <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-2 animate-pulse" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {incomes.length === 0 && (
                            <Card className="col-span-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] bg-transparent flex flex-col items-center justify-center p-20">
                                <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-200 mb-6">
                                    <TrendingUp size={40} />
                                </div>
                                <h3 className="text-lg font-black tracking-tight text-slate-400">Nenhuma renda definida</h3>
                                <p className="text-xs text-slate-400 mt-2">Clique no botão acima para definir sua primeira renda.</p>
                            </Card>
                        )}
                    </div>
                </main>
            </SidebarInset>
        </>
    );
}
