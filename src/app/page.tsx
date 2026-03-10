"use client";

import { getFinancialSummary, getHistoricalData } from "@/actions/finance";
import { BalanceCard, OverviewCard } from "@/components/BalanceCard";
import { CategorySummary } from "@/components/CategorySummary";
import { CategoryChart } from "@/components/CategoryChart";
import { HistoricalChart } from "@/components/HistoricalChart";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { SetIncomeDialog } from "@/components/SetIncomeDialog";
import { AppSidebar } from "@/components/AppSidebar";
import { BottomNav } from "@/components/BottomNav";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Search,
  Bell,
  Calendar,
  ChevronRight,
  PieChart,
  LineChart,
  TrendingUp,
  Layers,
  ArrowUpCircle,
  LayoutDashboard,
  Target,
  Plus
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Small delay to feel the "Live Dashboard" loading
      const [summary, history] = await Promise.all([
        getFinancialSummary(new Date().getMonth() + 1, new Date().getFullYear()),
        getHistoricalData()
      ]);
      setData(summary);
      setHistoricalData(history.length > 0 ? history : [
        { month: "OUT", income: 2800, spent: 2100 },
        { month: "NOV", income: 3200, spent: 1900 },
        { month: "DEZ", income: 3000, spent: 2500 },
        { month: "JAN", income: 3100, spent: 1800 },
        { month: "FEV", income: 2900, spent: 2000 },
        { month: "MAR", income: 3000, spent: 1850 },
      ]);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Iniciando Protocolo de Dados</span>
        </div>
      </div>
    );
  }

  const categoriesMapped = data.summary.map((s: any) => ({
    id: s.id,
    nome: s.nome,
    percentual: s.percentual,
    limite: s.limite,
    gasto: s.gasto
  }));

  const chartData = categoriesMapped.map((c: any, index: number) => ({
    name: c.nome,
    value: c.gasto,
    color: getColorForIndex(index)
  }));

  return (
    <>
      <AppSidebar />

      <SidebarInset className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-slate-50 dark:bg-slate-950/20">
        <header className="h-16 md:h-28 flex items-center justify-between px-4 md:px-6 lg:px-10 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl sticky top-0 z-40">
          <div className="flex items-center space-x-3">
            <SidebarTrigger className="h-10 w-10 md:h-12 md:w-12 rounded-2xl md:hidden" />
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase leading-none hidden md:block group cursor-default">
                Command <span className="text-primary transition-colors group-hover:dark:text-white">Center</span>
              </h1>
              <div className="md:hidden flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center border border-primary/20">
                  <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
                <span className="font-black text-sm tracking-tighter uppercase leading-none">CapitaFin</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="relative group hidden md:block">
              <Search className="absolute left-4 top-4 h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Busca rápida..."
                className="w-64 h-12 pl-12 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border-none text-[11px] font-bold focus:w-80 transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9 md:h-14 md:w-14 rounded-2xl bg-slate-100 dark:bg-slate-800/50 hover:bg-primary/10 hover:text-primary transition-colors">
              <Bell className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden md:block" />
            <UserMenu />
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8 space-y-8 pb-32 md:pb-10 text-slate-900 dark:text-slate-100">
          <div className="flex flex-col space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
              <div className="flex flex-col space-y-2">
                <Badge className="w-fit bg-primary/10 text-primary border-none rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest">
                  Live Analytics
                </Badge>
                <h2 className="text-3xl lg:text-4xl font-black tracking-tighter leading-none">
                  Controle <span className="text-primary italic">Ativo.</span>
                </h2>
                <p className="text-xs font-bold text-slate-400 max-w-sm uppercase tracking-tight">
                  Gestão integrada de fluxo de caixa e planejamento de metas 50-25-15.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <SetIncomeDialog isGuest={false}>
                  <Button variant="outline" className="h-12 md:h-14 px-5 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-xs hover:bg-slate-50 transition-all">
                    Configurar Renda
                  </Button>
                </SetIncomeDialog>
                <AddTransactionDialog categories={categoriesMapped} isGuest={false}>
                  <Button className="h-12 md:h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                    <Plus className="mr-2 h-4 w-4" /> Registrar Gasto
                  </Button>
                </AddTransactionDialog>
              </div>
            </div>

            <BalanceCard
              income={data.income}
              totalSpent={data.totalSpent}
              totalLimit={data.summary.reduce((acc: number, curr: any) => acc + curr.limite, 0)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              <div className="lg:col-span-8 flex flex-col space-y-5">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <LineChart className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400">Desempenho Semestral</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-[9px] font-black text-slate-400 uppercase">Receita</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                      <span className="text-[9px] font-black text-slate-400 uppercase">Gasto</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 lg:p-8 shadow-sm">
                  <HistoricalChart data={historicalData} />
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col space-y-6">
                <div className="h-64">
                  <OverviewCard
                    balance={data.income - data.totalSpent}
                    income={data.income}
                    totalSpent={data.totalSpent}
                    initials="U"
                  />
                </div>

                <div className="flex-1 bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 flex flex-col justify-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4">
                    <Target className="h-10 w-10 text-primary opacity-10 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Saúde Financeira</span>
                  <div className="flex items-baseline space-x-2">
                    <h4 className="text-3xl font-black tracking-tighter">
                      {data.income > 0 ? (((data.income - data.totalSpent) / data.income) * 100).toFixed(0) : 0}%
                    </h4>
                    <span className="text-[10px] font-black text-emerald-500 uppercase">Margem Livre</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-bold mt-4 leading-relaxed uppercase tracking-tighter">
                    Seu fluxo está operando {data.income > data.totalSpent ? "Acima" : "Abaixo"} da meta de economia.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-6 flex flex-col space-y-5">
                <div className="flex items-center space-x-3 px-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <PieChart className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400">Distribuição de Capital</h3>
                </div>
                <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 lg:p-10 shadow-sm h-full flex flex-col justify-center">
                  <CategoryChart data={chartData} totalIncome={data.income} />
                </div>
              </div>

              <div className="lg:col-span-6 flex flex-col space-y-5">
                <div className="flex items-center space-x-3 px-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Layers className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400">Planejamento Estratégico</h3>
                </div>
                <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 lg:p-10 shadow-sm h-full">
                  <CategorySummary summary={categoriesMapped} />
                </div>
              </div>

            </div>
          </div>
        </main>

        <BottomNav />
      </SidebarInset>
    </>
  );
}

function getColorForIndex(index: number) {
  const colors = ["#8b5cf6", "#3b82f6", "#f59e0b", "#ef4444", "#10b981"];
  return colors[index % colors.length];
}
