"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, Landmark, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BalanceCardProps {
    income: number;
    totalSpent: number;
    totalLimit: number;
}

export function BalanceCard({ income, totalSpent, totalLimit }: BalanceCardProps) {
    const isVisible = true;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(val);
    };

    return (
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-sm rounded-3xl overflow-hidden mb-6">
            <CardContent className="p-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
                    {/* Income Metric */}
                    <KPICard
                        title="Receitas"
                        value={income}
                        icon={TrendingUp}
                        color="text-emerald-500"
                        isVisible={isVisible}
                        formatCurrency={formatCurrency}
                    />

                    {/* Spent Metric */}
                    <KPICard
                        title="Despesas"
                        value={totalSpent}
                        icon={TrendingDown}
                        color="text-rose-500"
                        isVisible={isVisible}
                        formatCurrency={formatCurrency}
                    />

                    {/* Target Metric */}
                    <KPICard
                        title="Meta 50/25/15"
                        value={totalLimit}
                        icon={Target}
                        color="text-orange-500"
                        isVisible={isVisible}
                        formatCurrency={formatCurrency}
                        percentage={Math.round((totalSpent / (totalLimit || 1)) * 100)}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

interface KPICardProps {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
    isVisible: boolean;
    formatCurrency: (val: number) => string;
    percentage?: number;
}

function KPICard({ title, value, icon: Icon, color, isVisible, formatCurrency, percentage }: KPICardProps) {
    return (
        <div className="p-5 transition-all duration-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 group">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                    <div className={cn("p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors shadow-sm")}>
                        <Icon className={cn("h-3.5 w-3.5", color)} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{title}</span>
                </div>
            </div>
            <div className="flex flex-col">
                {isVisible ? (
                    <h3 className="text-xl font-black tracking-tighter truncate text-slate-900 dark:text-white group-hover:translate-x-1 transition-transform">{formatCurrency(value)}</h3>
                ) : (
                    <div className="h-7 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                )}

                {percentage !== undefined && (
                    <div className="mt-2 flex items-center space-x-2">
                        <div className="h-1 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(percentage, 100)}%` }}
                                className={cn("h-full rounded-full transition-all duration-1000", percentage > 100 ? "bg-rose-500" : "bg-primary")}
                            />
                        </div>
                        <span className={cn("text-[9px] font-black", percentage > 100 ? "text-rose-500" : "text-primary")}>{percentage}%</span>
                    </div>
                )}
            </div>
        </div>
    );
}

interface OverviewCardProps {
    balance: number;
    income: number;
    totalSpent: number;
    initials?: string;
}

export function OverviewCard({ balance, income, totalSpent }: OverviewCardProps) {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(val);
    };

    return (
        <Card className="border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 shadow-sm rounded-3xl h-full overflow-hidden group hover:shadow-lg transition-all">
            <CardContent className="p-6 h-full flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:rotate-12 transition-transform">
                            <Landmark size={20} />
                        </div>
                        <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 border-none">
                            Consolidado
                        </Badge>
                    </div>

                    <div className="space-y-0.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Saldo Disponível</span>
                        <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white group-hover:translate-x-1 transition-transform">
                            {formatCurrency(balance)}
                        </h2>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5 flex items-center">
                            <ArrowUpCircle size={10} className="mr-1 text-emerald-500" />
                            Entradas
                        </span>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-500">{formatCurrency(income)}</span>
                    </div>
                    <div className="flex flex-col border-l border-slate-100 dark:border-slate-800 pl-3">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5 flex items-center">
                            <ArrowDownCircle size={10} className="mr-1 text-rose-500" />
                            Saídas
                        </span>
                        <span className="text-xs font-black text-rose-600 dark:text-rose-500">{formatCurrency(totalSpent)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
