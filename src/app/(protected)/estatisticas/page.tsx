"use client";

import { useEffect, useState, useMemo } from "react";
import { getFinancialSummary, getHistoricalData } from "@/actions/finance";
import {
    BarChart3,
    TrendingUp,
    PieChart,
    LineChart,
    ChevronUp,
    ChevronDown,
    Zap,
    Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AppShell } from "@/components/AppShell";
import { HistoricalChart } from "@/components/HistoricalChart";
import { CategoryChart } from "@/components/CategoryChart";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface SummaryData {
    income: number;
    totalSpent: number;
    summary: Array<{
        id: string;
        nome: string;
        gasto: number;
        percentual: number;
        limite: number;
    }>;
}

interface HistoryItem {
    month: string;
    income: number;
    spent: number;
}

export default function EstatisticasPage() {
    const [data, setData] = useState<SummaryData | null>(null);
    const [historicalData, setHistoricalData] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [summary, history] = await Promise.all([
                getFinancialSummary(new Date().getMonth() + 1, new Date().getFullYear()),
                getHistoricalData()
            ]);
            setData(summary as unknown as SummaryData);
            setHistoricalData(history as HistoryItem[]);
        } catch (error) {
            console.error("Erro ao buscar estatísticas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const chartData = useMemo(() => {
        if (!data) return [];
        return data.summary.map((c, index) => ({
            name: c.nome,
            value: c.gasto,
            color: index === 0 ? "#8b5cf6" : index === 1 ? "#10b981" : index === 2 ? "#f59e0b" : "#6366f1"
        }));
    }, [data]);

    const metrics = useMemo(() => {
        if (historicalData.length < 2) return { incomeVar: 0, spentVar: 0, avgBalance: 0 };
        
        const currentMonth = historicalData[historicalData.length - 1];
        const prevMonth = historicalData[historicalData.length - 2];

        const incomeVar = prevMonth.income > 0 ? ((currentMonth.income - prevMonth.income) / prevMonth.income) * 100 : 0;
        const spentVar = prevMonth.spent > 0 ? ((currentMonth.spent - prevMonth.spent) / prevMonth.spent) * 100 : 0;
        
        const totalNet = historicalData.reduce((acc, curr) => acc + (curr.income - curr.spent), 0);
        const avgBalance = totalNet / historicalData.length;

        return { incomeVar, spentVar, avgBalance };
    }, [historicalData]);

    if (loading || !data) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Processando Analíticos</span>
                </div>
            </div>
        );
    }

    return (
        <AppShell title="Estatísticas">
            <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
                {/* Header Section Removed Redundant Title */}

                {/* Top Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="glass-card border-white/5 p-8 relative overflow-hidden group hover:bg-white/[0.02] transition-all">
                        <div className="relative z-10 space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                                <Zap size={12} className="text-emerald-500" /> Variação de Renda
                            </p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-4xl font-black tracking-tighter tabular-nums">{metrics.incomeVar > 0 ? "+" : ""}{metrics.incomeVar.toFixed(1)}%</h3>
                                <div className={cn(
                                    "p-3 rounded-2xl transition-transform group-hover:scale-110",
                                    metrics.incomeVar >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                )}>
                                    {metrics.incomeVar >= 0 ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="glass-card border-white/5 p-8 relative overflow-hidden group hover:bg-white/[0.02] transition-all">
                        <div className="relative z-10 space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                                <TrendingUp size={12} className="text-rose-500" /> Variação de Gastos
                            </p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-4xl font-black tracking-tighter tabular-nums">{metrics.spentVar > 0 ? "+" : ""}{metrics.spentVar.toFixed(1)}%</h3>
                                <div className={cn(
                                    "p-3 rounded-2xl transition-transform group-hover:scale-110",
                                    metrics.spentVar <= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                )}>
                                    {metrics.spentVar <= 0 ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="glass-card border-white/5 p-8 relative overflow-hidden group hover:bg-white/[0.02] transition-all">
                        <div className="relative z-10 space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                                <Target size={12} className="text-primary" /> Saldo Médio Mensal
                            </p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-3xl font-black tracking-tighter tabular-nums text-primary">{formatCurrency(metrics.avgBalance)}</h3>
                                <div className="p-3 rounded-2xl bg-primary/10 text-primary transition-transform group-hover:rotate-12">
                                    <BarChart3 size={24} />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Main Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <Card className="lg:col-span-8 glass-card border-white/5 overflow-hidden shadow-2xl">
                        <CardHeader className="p-8 border-b border-white/5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-black tracking-tight">Fluxo Histórico</CardTitle>
                                    <CardDescription className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">Performance de 6 meses</CardDescription>
                                </div>
                                <div className="h-12 w-12 rounded-2xl bg-muted/20 flex items-center justify-center text-muted-foreground/40">
                                    <LineChart size={24} />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 h-[450px]">
                            <HistoricalChart data={historicalData} />
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-4 glass-card border-white/5 overflow-hidden shadow-2xl">
                        <CardHeader className="p-8 border-b border-white/5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-black tracking-tight">Distribuição</CardTitle>
                                    <CardDescription className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">Alocação por categoria</CardDescription>
                                </div>
                                <div className="h-12 w-12 rounded-2xl bg-muted/20 flex items-center justify-center text-muted-foreground/40">
                                    <PieChart size={24} />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 flex items-center justify-center">
                            <div className="w-full h-[350px]">
                                <CategoryChart data={chartData} totalIncome={data.income} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppShell>
    );
}
