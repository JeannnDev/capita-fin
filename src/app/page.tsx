import { getFinancialSummary } from "@/actions/finance";
import { BalanceCard } from "@/components/BalanceCard";
import { CategorySummary } from "@/components/CategorySummary";
import { CategoryChart } from "@/components/CategoryChart";
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
  TrendingUp,
  Layers,
  ArrowUpCircle
} from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isGuest = !session;
  const date = new Date();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const result = isGuest
    ? {
      income: 3000,
      totalSpent: 1850,
      summary: [
        { id: "1", nome: "Fixas", percentual: 50, limite: 1500, gasto: 1200 },
        { id: "2", nome: "Investimentos", percentual: 25, limite: 750, gasto: 150 },
        { id: "3", nome: "Pessoal", percentual: 15, limite: 450, gasto: 450 },
        { id: "4", nome: "Reserva", percentual: 10, limite: 300, gasto: 50 },
      ]
    }
    : await getFinancialSummary(month, year);

  // Convert core summary to visual components format
  const categoriesMapped = result.summary.map(s => ({
    id: s.id,
    nome: s.nome,
    percentual: s.percentual,
    limite: s.limite,
    gasto: s.gasto
  }));

  const chartData = categoriesMapped.map(c => ({
    name: c.nome,
    value: c.gasto,
    color: getColorForIndex(categoriesMapped.indexOf(c))
  }));

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950/20">
      {/* Sidebar for Desktop */}
      <AppSidebar />

      <SidebarInset className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Dashboard Top Navigation */}
        <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-6 lg:px-10 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl sticky top-0 z-40">
          {/* Mobile: Sidebar trigger + greeting */}
          <div className="flex items-center space-x-3">
            <SidebarTrigger className="md:hidden" />
            <div className="flex flex-col">
              <h1 className="text-base md:text-xl font-black tracking-tighter uppercase leading-none hidden md:block">Visão Geral</h1>
              <div className="md:hidden">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">CapitaFin</p>
              </div>
              <div className="mt-1 hidden md:block">
                <Breadcrumb>
                  <BreadcrumbList className="text-[10px] uppercase tracking-widest font-black">
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-primary">Dashboard</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Busca rápida..."
                className="w-56 h-10 pl-10 rounded-xl bg-slate-100 dark:bg-slate-800/50 border-none text-[11px] font-bold focus:w-72 transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9 md:h-12 md:w-12 rounded-2xl bg-slate-100 dark:bg-slate-800/50 hover:bg-primary/10 hover:text-primary transition-colors">
              <Bell className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden md:block" />
            <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-1 md:p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm shadow-slate-200 dark:shadow-none">
              <div className="hidden md:flex flex-col items-end px-2">
                <span className="text-[10px] font-black tracking-widest text-primary uppercase">{month}/{year}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase px-1">Ativo</span>
              </div>
              <Button variant="secondary" size="icon" className="h-7 w-7 md:h-10 md:w-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 transition-transform">
                <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Main Viewport */}
        <main className="p-6 lg:p-10 space-y-8 pb-32 md:pb-10">

          {/* Hero Grid: Layout following the Laptop/Phone image */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            {/* 2/3 Column on Desktop */}
            <div className="lg:col-span-8 flex flex-col space-y-8">

              {/* Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <BalanceCard
                    income={result.income}
                    totalSpent={result.totalSpent}
                    totalLimit={result.summary.reduce((acc, curr) => acc + curr.limite, 0)}
                  />
                </div>
              </div>

              {/* Center Content Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6 flex flex-col">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-black tracking-tighter uppercase flex items-center space-x-2">
                      <PieChart className="h-4 w-4 text-primary" />
                      <span>Distribuição</span>
                    </h3>
                    <AddTransactionDialog categories={categoriesMapped} isGuest={isGuest} />
                  </div>
                  <CategoryChart data={chartData} totalIncome={result.income} />
                </div>

                <div className="space-y-6 flex flex-col">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-black tracking-tighter uppercase flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span>IA Insight</span>
                    </h3>
                    <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary active:scale-95 transition-all">
                      Explorar <ChevronRight size={14} className="ml-1" />
                    </Button>
                  </div>
                  <div className="flex-1 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 flex flex-col justify-center group hover:bg-primary/[0.02] transition-colors relative overflow-hidden">
                    <ArrowUpCircle className="absolute top-4 right-4 h-6 w-6 text-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                    <p className="text-xl font-black tracking-tighter leading-none italic mb-4">"Economia acima da média"</p>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      Seu gasto em <span className="text-primary font-bold">Fixas</span> foi otimizado este mês, permitindo maior alocação em investimentos.
                    </p>
                    <div className="mt-6 flex items-center space-x-2">
                      <div className="h-1 flex-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-2/3" />
                      </div>
                      <span className="text-[10px] font-black text-primary">68%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 1/3 Column on Desktop (Vertical List) */}
            <div className="lg:col-span-4 flex flex-col space-y-8">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-black tracking-tighter uppercase flex items-center space-x-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <span>Planos 50-25-15</span>
                </h3>
                <SetIncomeDialog isGuest={isGuest} />
              </div>
              <div className="flex-1 space-y-4 pr-1">
                <CategorySummary summary={categoriesMapped} />
              </div>
            </div>
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <BottomNav />
      </SidebarInset>
    </div>
  );
}

function getColorForIndex(index: number) {
  const colors = ["#8b5cf6", "#3b82f6", "#f59e0b", "#ef4444", "#10b981"];
  return colors[index % colors.length];
}
