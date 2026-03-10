"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Target, Landmark, Eye, EyeOff, ArrowUpCircle, ArrowDownCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BalanceCardProps {
    income: number;
    totalSpent: number;
    totalLimit: number;
}

export function BalanceCard({ income, totalSpent, totalLimit }: BalanceCardProps) {
    const [isVisible, setIsVisible] = useState(true);
    const balance = income - totalSpent;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(val);
    };

    return (
        <Card className="border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 shadow-sm rounded-[2rem] overflow-hidden">
            <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
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
                        color="text-amber-500"
                        isVisible={isVisible}
                        formatCurrency={formatCurrency}
                        percentage={Math.round((totalSpent / (totalLimit || 1)) * 100)}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

function KPICard({ title, value, icon: Icon, color, isVisible, toggleVisible, formatCurrency, percentage }: any) {
    return (
        <div className="p-6 transition-all duration-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 group">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <div className={cn("p-2 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors shadow-sm")}>
                        <Icon className={cn("h-4 w-4", color)} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</span>
                </div>
                {toggleVisible && (
                    <button
                        onClick={toggleVisible}
                        className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                    >
                        {isVisible ? <Eye size={14} className="text-slate-300 group-hover:text-primary transition-colors" /> : <EyeOff size={14} className="text-slate-300 group-hover:text-primary transition-colors" />}
                    </button>
                )}
            </div>
            <div>
                {isVisible ? (
                    <h3 className="text-xl lg:text-2xl font-black tracking-tighter truncate text-slate-900 dark:text-white group-hover:translate-x-1 transition-transform">{formatCurrency(value)}</h3>
                ) : (
                    <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                )}

                {percentage !== undefined && (
                    <div className="mt-4 flex items-center space-x-2">
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

export function OverviewCard({ balance, income, totalSpent }: any) {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(val);
    };

    return (
        <Card className="border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 shadow-sm rounded-[2.5rem] h-full overflow-hidden group hover:shadow-lg transition-all">
            <CardContent className="p-8 h-full flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:rotate-12 transition-transform">
                            <Landmark size={24} />
                        </div>
                        <Badge variant="secondary" className="rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 border-none">
                            Consolidado
                        </Badge>
                    </div>

                    <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Saldo Disponível</span>
                        <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white group-hover:translate-x-1 transition-transform">
                            {formatCurrency(balance)}
                        </h2>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center">
                            <ArrowUpCircle size={10} className="mr-1 text-emerald-500" />
                            Entradas
                        </span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-500">{formatCurrency(income)}</span>
                    </div>
                    <div className="flex flex-col border-l border-slate-100 dark:border-slate-800 pl-4">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center">
                            <ArrowDownCircle size={10} className="mr-1 text-rose-500" />
                            Saídas
                        </span>
                        <span className="text-sm font-black text-rose-600 dark:text-rose-500">{formatCurrency(totalSpent)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
