"use client";

import { useEffect, useState } from "react";
import { getFinancialSummary, updateCategoryPercent, deleteCategory } from "@/actions/finance";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
    Target,
    ShieldCheck,
    PieChart,
    TrendingUp,
    AlertCircle,
    Save,
    Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UserMenu } from "@/components/UserMenu";
import { Progress } from "@/components/ui/progress";
import { AddCategoryDialog } from "@/components/AddCategoryDialog";

export default function MetasPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editingPercents, setEditingPercents] = useState<Record<string, number>>({});

    const fetchData = async () => {
        setLoading(true);
        const res = await getFinancialSummary(new Date().getMonth() + 1, new Date().getFullYear());
        setData(res);
        const initialPercents: Record<string, number> = {};
        res.summary.forEach((cat: any) => {
            initialPercents[cat.id] = cat.percentual;
        });
        setEditingPercents(initialPercents);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdatePercent = async (id: string) => {
        const val = editingPercents[id];
        if (val < 0 || val > 100) return alert("Percentual deve ser entre 0 e 100");
        await updateCategoryPercent(id, val);
        fetchData();
    };

    const handleDeleteCategory = async (id: string) => {
        if (confirm("Deseja excluir esta categoria? Isso afetará o histórico de gastos nela.")) {
            await deleteCategory(id);
            fetchData();
        }
    };

    const totalPercent = Object.values(editingPercents).reduce((a, b) => a + b, 0);

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Configurando Metas</span>
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
                            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 hidden md:flex">
                                <Target size={24} />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase leading-none">Minhas <span className="text-amber-500">Metas</span></h1>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Planejamento 50-25-15</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <AddCategoryDialog onSuccess={fetchData} />
                        <UserMenu />
                    </div>
                </header>

                <main className="p-4 md:p-6 lg:p-10 max-w-[1000px] mx-auto w-full space-y-8">
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center">
                                <ShieldCheck className="mr-2 h-4 w-4 text-primary" />
                                Regras de Distribuição
                            </h2>
                            {totalPercent !== 100 && (
                                <Badge variant="destructive" className="rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest animate-bounce">
                                    <AlertCircle className="mr-1 h-3 w-3" /> Total deve ser 100% (atual: {totalPercent}%)
                                </Badge>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {data.summary.map((cat: any) => (
                                <Card key={cat.id} className="border border-slate-200 dark:border-slate-800 rounded-[2rem] bg-white/50 dark:bg-slate-900/40 overflow-hidden group">
                                    <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="flex-1 space-y-4 w-full">
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">{cat.nome}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Peso no Planejamento</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Input
                                                        type="number"
                                                        value={editingPercents[cat.id]}
                                                        onChange={(e) => setEditingPercents({ ...editingPercents, [cat.id]: parseInt(e.target.value) || 0 })}
                                                        className="w-20 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-center font-black text-lg focus:ring-2 focus:ring-primary/20"
                                                    />
                                                    <span className="font-black text-slate-400 text-lg">%</span>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => handleUpdatePercent(cat.id)}
                                                        className="h-12 w-12 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Save size={18} />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => handleDeleteCategory(cat.id)}
                                                        className="h-12 w-12 rounded-xl bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={18} />
                                                    </Button>
                                                </div>
                                            </div>
                                            <Progress value={editingPercents[cat.id]} className="h-2 rounded-full bg-slate-100 dark:bg-slate-800" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    <Card className="bg-primary/5 border border-primary/10 rounded-[2rem] p-8 md:p-12 relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center text-primary rotate-3 group-hover:rotate-6 transition-transform">
                                <PieChart size={40} />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-xl font-black tracking-tight uppercase">Por que seguir metas?</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed mt-2">
                                    A regra <span className="text-primary font-black">50-25-15</span> ajuda você a manter um equilíbrio saudável entre gastos essenciais, investimentos para o futuro e lazer, garantindo sua liberdade financeira a longo prazo.
                                </p>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                    </Card>
                </main>
            </SidebarInset>
        </>
    );
}
