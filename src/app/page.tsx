import { getFinancialSummary } from "@/actions/finance";
import { BalanceCard, OverviewCard } from "@/components/BalanceCard";
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
  ArrowUpCircle,
  LayoutDashboard
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
import { UserMenu } from "@/components/UserMenu";
import { Badge } from "@/components/ui/badge";

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

  const userInitials = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950/20">
      <AppSidebar />

      <SidebarInset className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-6 lg:px-10 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl sticky top-0 z-40">
          <div className="flex items-center space-x-3">
            <SidebarTrigger className="h-10 w-10 md:h-12 md:w-12 rounded-2xl md:hidden" />
            <div className="flex flex-col">
              <h1 className="text-base md:text-xl font-black tracking-tighter uppercase leading-none hidden md:block">
                Visão <span className="text-primary">Analítica</span>
              </h1>
              <div className="md:hidden flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center border border-primary/20">
                  <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
                <span className="font-black text-sm tracking-tighter uppercase leading-none">CapitaFin</span>
              </div>
              <div className="mt-1 hidden md:block">
                <Breadcrumb>
                  <BreadcrumbList className="text-[9px] uppercase tracking-[0.2em] font-black opacity-60">
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-primary">Controle Financeiro</BreadcrumbPage>
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
            {/* User Info Badge */}
            <UserMenu />
          </div>
        </header>

        {/* Dashboard Main Viewport */}
        <main className="p-4 md:p-8 space-y-10 pb-32 md:pb-10 text-slate-900 dark:text-slate-100">
          <div className="flex flex-col space-y-10">
            <BalanceCard
              income={result.income}
              totalSpent={result.totalSpent}
              totalLimit={result.summary.reduce((acc, curr) => acc + curr.limite, 0)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
              <div className="lg:col-span-8 flex flex-col space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-black tracking-[0.2em] uppercase flex items-center space-x-2 text-slate-400">
                    <PieChart className="h-4 w-4 text-primary" />
                    <span>Análise de Fluxo</span>
                  </h3>
                  <AddTransactionDialog categories={categoriesMapped} isGuest={isGuest} />
                </div>
                <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[3rem] p-10 shadow-sm">
                  <CategoryChart data={chartData} totalIncome={result.income} />
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col space-y-8">
                <div className="h-72">
                  <OverviewCard
                    balance={result.income - result.totalSpent}
                    income={result.income}
                    totalSpent={result.totalSpent}
                    initials={userInitials}
                  />
                </div>

                <div className="flex-1 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 flex flex-col justify-center group hover:bg-primary/[0.02] transition-colors relative overflow-hidden shadow-sm">
                  <ArrowUpCircle className="absolute top-4 right-4 h-6 w-6 text-primary opacity-20" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Resumo Analítico</span>
                  <p className="text-xl font-black tracking-tighter leading-none italic mb-4 uppercase">"Controle Ativo"</p>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic border-l-2 border-primary/20 pl-4 py-1">
                    Você está mantendo uma margem de segurança de {result.income > 0 ? (((result.income - result.totalSpent) / result.income) * 100).toFixed(1) : 0}% este mês.
                  </p>
                  <div className="mt-8">
                    <Button variant="outline" size="sm" className="rounded-full px-6 text-[10px] font-black uppercase tracking-[0.1em] border-slate-200 dark:border-slate-800 hover:bg-primary hover:text-white transition-all">
                      Ver Relatório
                    </Button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-12 flex flex-col space-y-6 mt-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-[10px] font-black tracking-[0.2em] uppercase flex items-center space-x-2 text-slate-400">
                      <Layers className="h-4 w-4 text-primary" />
                      <span>Planejamento por Categoria</span>
                    </h3>
                    <Badge variant="secondary" className="rounded-xl px-4 py-1 text-[9px] bg-primary/5 text-primary border-none font-black uppercase tracking-widest">Controle 50-25-15</Badge>
                  </div>
                  <SetIncomeDialog isGuest={isGuest} />
                </div>
                <div className="pr-1">
                  <CategorySummary summary={categoriesMapped} />
                </div>
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
