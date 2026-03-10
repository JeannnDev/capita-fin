"use client";

import { useEffect, useState } from "react";
import { getTransactions, deleteTransaction } from "@/actions/finance";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
    ArrowDownCircle,
    Search,
    Trash2,
    Calendar,
    Tag,
    MoreHorizontal,
    Plus,
    LayoutDashboard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { UserMenu } from "@/components/UserMenu";

export default function DespesasPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchData = async () => {
        setLoading(true);
        const data = await getTransactions();
        setTransactions(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm("Tem certeza que deseja excluir esta despesa?")) {
            await deleteTransaction(id);
            fetchData();
        }
    };

    const filteredTransactions = transactions.filter(t =>
        t.descricao.toLowerCase().includes(search.toLowerCase()) ||
        t.category?.nome.toLowerCase().includes(search.toLowerCase())
    );

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
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Carregando Despesas</span>
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
                            <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500 hidden md:flex">
                                <ArrowDownCircle size={24} />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase leading-none">Minhas <span className="text-rose-500">Despesas</span></h1>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Controle de Saídas</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="relative group hidden md:block">
                            <Search className="absolute left-4 top-4 h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Filtrar despesas..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-64 h-12 pl-12 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border-none text-[11px] font-bold focus:w-80 transition-all focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <AddTransactionDialog>
                            <Button className="h-10 md:h-14 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                                <Plus className="mr-2 h-4 w-4" /> Novo Gasto
                            </Button>
                        </AddTransactionDialog>
                        <UserMenu />
                    </div>
                </header>

                <main className="p-4 md:p-6 lg:p-10 max-w-[1600px] mx-auto w-full space-y-8">
                    <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white/50 dark:bg-slate-900/40 backdrop-blur-md">
                        <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-black tracking-tight">Histórico de Saídas</CardTitle>
                                    <CardDescription className="text-xs font-medium text-slate-400">Gerencie todos os seus gastos registrados</CardDescription>
                                </div>
                                <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 border-none">
                                    {filteredTransactions.length} Lançamentos
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800">
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Descrição</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Categoria</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Data</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Valor</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                        {filteredTransactions.map((t) => (
                                            <tr key={t.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="p-6">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform">
                                                            <ArrowDownCircle size={18} className="text-rose-500" />
                                                        </div>
                                                        <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{t.descricao}</span>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <Badge className="rounded-lg bg-primary/5 hover:bg-primary/10 text-primary border-none font-bold text-[10px] px-2.5 py-1">
                                                        {t.category?.nome || "Geral"}
                                                    </Badge>
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex items-center text-xs font-bold text-slate-400">
                                                        <Calendar size={12} className="mr-2" />
                                                        {new Date(t.createdAt).toLocaleDateString("pt-BR")}
                                                    </div>
                                                </td>
                                                <td className="p-6 text-right">
                                                    <span className="font-black text-sm text-slate-900 dark:text-white">
                                                        {formatCurrency(t.valor)}
                                                    </span>
                                                </td>
                                                <td className="p-6 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(t.id)}
                                                        className="h-9 w-9 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredTransactions.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="p-20 text-center">
                                                    <div className="flex flex-col items-center space-y-3">
                                                        <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-300">
                                                            <ArrowDownCircle size={32} />
                                                        </div>
                                                        <p className="font-bold text-slate-400 text-sm">Nenhuma despesa encontrada.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </SidebarInset>
        </>
    );
}
