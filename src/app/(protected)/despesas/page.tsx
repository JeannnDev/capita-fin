"use client";

import { useEffect, useState, useMemo } from "react";
import { getTransactions, deleteTransaction } from "@/actions/finance";
import { 
    ArrowDownCircle, 
    Search, 
    Trash2, 
    Calendar,
    Plus,
    TrendingDown,
    Filter
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { AppShell } from "@/components/AppShell";
import { PremiumBalanceCard } from "@/components/ui/premium-balance-card";
import { formatCurrency } from "@/lib/format";

interface Transaction {
    id: string;
    valor: number;
    descricao: string;
    createdAt: Date;
    category?: {
        nome: string;
    } | null;
}

export default function DespesasPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchData = async () => {
        try {
            const data = await getTransactions();
            setTransactions(data as Transaction[]);
        } catch (error) {
            console.error("Erro ao buscar despesas:", error);
        } finally {
            setLoading(false);
        }
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

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t =>
            t.descricao.toLowerCase().includes(search.toLowerCase()) ||
            t.category?.nome.toLowerCase().includes(search.toLowerCase())
        );
    }, [transactions, search]);

    const totalMonthlyExpenses = useMemo(() => {
        const now = new Date();
        return transactions
            .filter(t => {
                const d = new Date(t.createdAt);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            })
            .reduce((sum, t) => sum + t.valor, 0);
    }, [transactions]);

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Carregando Despesas</span>
                </div>
            </div>
        );
    }

    return (
        <AppShell title="Minhas Despesas">
            <div className="space-y-8 max-w-[1200px] mx-auto">
                {/* Summary Card with Action */}
                <PremiumBalanceCard
                    title="Gasto Mensal Total"
                    amount={formatCurrency(totalMonthlyExpenses)}
                    icon={TrendingDown}
                    color="#f43f5e"
                    action={
                        <AddTransactionDialog>
                            <Button className="h-12 px-8 rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl shadow-black/10 hover:scale-105 transition-all bg-white text-rose-500 hover:bg-white/90 border-none transition-all active:scale-[0.98]">
                                <Plus className="mr-2 h-5 w-5" /> Novo Gasto
                            </Button>
                        </AddTransactionDialog>
                    }
                />

                {/* Filters and Search */}
                <div className="glass-card p-6 md:p-8 rounded-[2rem] border-white/5 shadow-2xl space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Buscar Gasto</label>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Descrição ou categoria..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-muted/20 border border-white/10 text-base font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-hidden"
                                />
                            </div>
                        </div>
                        
                        <div className="flex items-end pb-1">
                             <Button variant="outline" className="h-14 px-6 rounded-2xl border-white/10 bg-muted/20 font-black uppercase tracking-widest text-[10px]">
                                <Filter className="mr-2 h-4 w-4" /> Filtros
                             </Button>
                        </div>
                    </div>
                </div>

                {/* Transactions Timeline */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-lg font-black tracking-tight uppercase">Histórico de Saídas ({filteredTransactions.length})</h3>
                    </div>

                    <div className="grid gap-4">
                        {filteredTransactions.map((t) => (
                            <Card key={t.id} className="glass-card border-white/5 shadow-sm transition-all group hover:bg-white/50 dark:hover:bg-white/5 overflow-hidden">
                                <CardContent className="p-4 px-6 md:p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-6 group transition-transform hover:translate-x-1">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-sm transform group-hover:rotate-3 transition-transform">
                                            <ArrowDownCircle size={28} />
                                        </div>
                                        <div>
                                            <p className="text-lg font-black tracking-tight text-foreground">{t.descricao}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Badge className="bg-primary/5 text-primary border-none font-bold text-[9px] px-2 py-0.5 uppercase tracking-widest">
                                                    {t.category?.nome || "Geral"}
                                                </Badge>
                                                <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                                                <div className="flex items-center text-[10px] font-bold text-muted-foreground">
                                                    <Calendar size={12} className="mr-1.5 opacity-60" />
                                                    {new Date(t.createdAt).toLocaleDateString("pt-BR")}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <p className="text-xl font-black tabular-nums tracking-tight text-foreground">
                                            {formatCurrency(t.valor)}
                                        </p>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(t.id)}
                                            className="h-10 w-10 rounded-xl text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {filteredTransactions.length === 0 && (
                            <Card className="col-span-full border-2 border-dashed border-white/10 rounded-[2.5rem] bg-transparent flex flex-col items-center justify-center p-20">
                                <div className="w-20 h-20 rounded-3xl bg-muted/20 flex items-center justify-center text-muted-foreground/30 mb-6">
                                    <ArrowDownCircle size={40} />
                                </div>
                                <h3 className="text-xl font-black tracking-tight text-muted-foreground">Nenhuma despesa encontrada</h3>
                                <p className="text-sm text-muted-foreground/60 mt-2">Clique em &quot;Novo Gasto&quot; para começar o controle.</p>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
