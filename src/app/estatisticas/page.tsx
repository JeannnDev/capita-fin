"use client";

import { useEffect, useState } from "react";
import { getFinancialSummary, getHistoricalData } from "@/actions/finance";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
    BarChart3,
    TrendingUp,
    PieChart,
    LineChart,
    ChevronUp,
    ChevronDown,
    LayoutDashboard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserMenu } from "@/components/UserMenu";
import { HistoricalChart } from "@/components/HistoricalChart";
import { CategoryChart } from "@/components/CategoryChart";

export default function EstatisticasPage() {
    const [data, setData] = useState<any>(null);
    const [historicalData, setHistoricalData] = useState<any>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const [summary, history] = await Promise.all([
                getFinancialSummary(new Date().getMonth() + 1, new Date().getFullYear()),
                getHistoricalData()
            ]);
            setData(summary);
            setHistoricalData(history);
            setLoading(false);
        }
        fetchData();
    }, []);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(val);
    };

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Processando Analíticos</span>
                </div>
            </div>
        );
    }

    const chartData = data.summary.map((c: any, index: number) => ({
        name: c.nome,
        value: c.gasto,
        color: index === 0 ? "#8b5cf6" : index === 1 ? "#10b981" : index === 2 ? "#f59e0b" : "#6366f1"
    }));

    // Calculate variations
    const currentMonth = historicalData[historicalData.length - 1];
    const prevMonth = historicalData[historicalData.length - 2];

    const incomeVar = prevMonth?.income > 0 ? ((currentMonth.income - prevMonth.income) / prevMonth.income) * 100 : 0;
    const spentVar = prevMonth?.spent > 0 ? ((currentMonth.spent - prevMonth.spent) / prevMonth.spent) * 100 : 0;

    return (
        <>
            <AppSidebar />
            <SidebarInset className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-slate-50 dark:bg-slate-950/20">
                <header className="h-16 md:h-28 flex items-center justify-between px-4 md:px-6 lg:px-10 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl sticky top-0 z-40">
                    <div className="flex items-center space-x-3">
                        <SidebarTrigger className="h-10 w-10 md:h-12 md:w-12 rounded-2xl md:hidden" />
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500 hidden md:flex">
                                <BarChart3 size={24} />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase leading-none">Minhas <span className="text-indigo-500">Estatísticas</span></h1>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Deep Intelligence</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <UserMenu />
                    </div>
                </header>

                <main className="p-4 md:p-6 lg:p-10 max-w-[1600px] mx-auto w-full space-y-8 pb-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Variação Mensal</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Card className="border border-slate-200 dark:border-slate-800 rounded-[2rem] bg-white/50 dark:bg-slate-900/40 p-6">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Crescimento Entradas</span>
                                    <div className="flex items-end justify-between">
                                        <h3 className="text-2xl font-black">{incomeVar > 0 ? "+" : ""}{incomeVar.toFixed(1)}%</h3>
                                        <div className={`p-1.5 rounded-lg ${incomeVar >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                                            {incomeVar >= 0 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </div>
                                    </div>
                                </Card>
                                <Card className="border border-slate-200 dark:border-slate-800 rounded-[2rem] bg-white/50 dark:bg-slate-900/40 p-6">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Crescimento Saídas</span>
                                    <div className="flex items-end justify-between">
                                        <h3 className="text-2xl font-black">{spentVar > 0 ? "+" : ""}{spentVar.toFixed(1)}%</h3>
                                        <div className={`p-1.5 rounded-lg ${spentVar <= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                                            {spentVar <= 0 ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Eficiência de Gasto</h2>
                            </div>
                            <Card className="border border-slate-200 dark:border-slate-800 rounded-[2rem] bg-white/50 dark:bg-slate-900/40 p-6 flex items-center justify-between">
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 block">Saldo Médio</span>
                                    <h3 className="text-2xl font-black text-primary">{formatCurrency(historicalData.reduce((a: any, b: any) => a + (b.income - b.spent), 0) / historicalData.length)}</h3>
                                </div>
                                <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                                    <TrendingUp size={24} />
                                </div>
                            </Card>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8">
                            <Card className="border border-slate-200 dark:border-slate-800 rounded-[2.5rem] bg-white/50 dark:bg-slate-900/40 overflow-hidden h-[500px]">
                                <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between border-transparent">
                                    <div>
                                        <CardTitle className="text-xl font-black tracking-tight">Fluxo Histórico</CardTitle>
                                        <CardDescription className="text-xs font-medium text-slate-400">Entradas vs Saídas nos últimos 6 meses</CardDescription>
                                    </div>
                                    <LineChart className="text-primary opacity-20" size={32} />
                                </CardHeader>
                                <CardContent className="p-8 h-[400px]">
                                    <HistoricalChart data={historicalData} />
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-4">
                            <Card className="border border-slate-200 dark:border-slate-800 rounded-[2.5rem] bg-white/50 dark:bg-slate-900/40 overflow-hidden h-[500px]">
                                <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between border-transparent">
                                    <div>
                                        <CardTitle className="text-xl font-black tracking-tight">Distribuição</CardTitle>
                                        <CardDescription className="text-xs font-medium text-slate-400">Divisão de gastos atuais</CardDescription>
                                    </div>
                                    <PieChart className="text-primary opacity-20" size={32} />
                                </CardHeader>
                                <CardContent className="p-8 flex items-center justify-center">
                                    <div className="w-full h-[300px]">
                                        <CategoryChart data={chartData} totalIncome={data.income} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </>
    );
}
