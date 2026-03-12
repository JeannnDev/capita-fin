"use client";

import { useEffect, useState } from "react";
import { getIncomes } from "@/actions/finance";
import { 
    ArrowUpCircle, 
    TrendingUp, 
    Plus 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SetIncomeDialog } from "@/components/SetIncomeDialog";
import { AppShell } from "@/components/AppShell";
import { PremiumBalanceCard } from "@/components/ui/premium-balance-card";

interface Income {
    id: string;
    valor: number;
    mes: number;
    ano: number;
    tipo: string;
}

export default function ReceitasPage() {
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const data = await getIncomes();
            setIncomes(data as Income[]);
        } catch (error) {
            console.error("Erro ao buscar receitas:", error);
        } finally {
            setLoading(false);
        }
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

    const currentMonthIncome = incomes.find(inc => 
        inc.mes === new Date().getMonth() + 1 && 
        inc.ano === new Date().getFullYear()
    )?.valor || 0;

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Carregando Entradas</span>
                </div>
            </div>
        );
    }

    return (
        <AppShell title="Minhas Receitas">
            <div className="space-y-8 max-w-[1200px] mx-auto">
                <PremiumBalanceCard
                    title="Renda do Mês Atual"
                    amount={formatCurrency(currentMonthIncome)}
                    icon={TrendingUp}
                    action={
                      <SetIncomeDialog>
                          <Button className="h-12 px-8 rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-105 transition-all bg-white text-primary hover:bg-white/90 border-none transition-all active:scale-[0.98]">
                              <Plus className="mr-2 h-5 w-5" /> Definir Renda
                          </Button>
                      </SetIncomeDialog>
                    }
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {incomes.map((inc) => (
                        <Card key={inc.id} className="glass-card border-white/10 shadow-xl shadow-emerald-500/5 group hover:bg-emerald-500/[0.02] transition-all overflow-hidden">
                            <CardContent className="p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:rotate-12 transition-transform">
                                        <ArrowUpCircle size={24} />
                                    </div>
                                    <Badge variant="secondary" className="rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest bg-muted/20 text-muted-foreground border-none">
                                        {inc.ano}
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">{monthNames[inc.mes - 1]}</span>
                                    <h2 className="text-4xl font-black tracking-tighter text-foreground">
                                        {formatCurrency(inc.valor)}
                                    </h2>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Status da Renda</span>
                                    <div className="flex items-center text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                                        Ativo <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-2 animate-pulse" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {incomes.length === 0 && (
                        <Card className="col-span-full border-2 border-dashed border-white/10 rounded-[2.5rem] bg-transparent flex flex-col items-center justify-center p-20">
                            <div className="w-20 h-20 rounded-3xl bg-muted/20 flex items-center justify-center text-muted-foreground/30 mb-6">
                                <TrendingUp size={40} />
                            </div>
                            <h3 className="text-xl font-black tracking-tight text-muted-foreground">Nenhuma renda definida</h3>
                            <p className="text-sm text-muted-foreground/60 mt-2">Defina seu ganho mensal para começar o planejamento.</p>
                        </Card>
                    )}
                </div>
            </div>
        </AppShell>
    );
}
