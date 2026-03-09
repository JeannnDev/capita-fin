"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Target, Landmark, Eye, EyeOff } from "lucide-react";
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {/* Balance Metric */}
            <KPICard
                title="Saldo p/ Controle"
                value={balance}
                icon={Wallet}
                color="text-primary"
                bgColor="bg-primary/5"
                isVisible={isVisible}
                toggleVisible={() => setIsVisible(!isVisible)}
                formatCurrency={formatCurrency}
            />

            {/* Income Metric */}
            <KPICard
                title="Total de Entradas"
                value={income}
                icon={TrendingUp}
                color="text-emerald-500"
                bgColor="bg-emerald-500/5"
                isVisible={isVisible}
                formatCurrency={formatCurrency}
            />

            {/* Spent Metric */}
            <KPICard
                title="Total de Saídas"
                value={totalSpent}
                icon={TrendingDown}
                color="text-rose-500"
                bgColor="bg-rose-500/5"
                isVisible={isVisible}
                formatCurrency={formatCurrency}
            />

            {/* Target Metric */}
            <KPICard
                title="Meta 50/25/15"
                value={totalLimit}
                icon={Target}
                color="text-amber-500"
                bgColor="bg-amber-500/5"
                isVisible={isVisible}
                formatCurrency={formatCurrency}
                percentage={Math.round((totalSpent / (totalLimit || 1)) * 100)}
            />
        </div>
    );
}

function KPICard({ title, value, icon: Icon, color, bgColor, isVisible, toggleVisible, formatCurrency, percentage }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card className="border-none shadow-sm rounded-3xl bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-100 dark:border-slate-800 h-full group hover:shadow-xl transition-all duration-500">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className={cn("p-2.5 rounded-2xl", bgColor)}>
                            <Icon className={cn("h-5 w-5", color)} />
                        </div>
                        {toggleVisible && (
                            <button
                                onClick={toggleVisible}
                                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                {isVisible ? <Eye size={16} className="text-slate-400" /> : <EyeOff size={16} className="text-slate-400" />}
                            </button>
                        )}
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}</p>
                        {isVisible ? (
                            <h3 className="text-2xl font-black tracking-tighter truncate">{formatCurrency(value)}</h3>
                        ) : (
                            <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                        )}

                        {percentage !== undefined && (
                            <div className="mt-3 flex items-center space-x-2">
                                <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full transition-all duration-1000", percentage > 100 ? "bg-rose-500" : "bg-primary")}
                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                    />
                                </div>
                                <span className={cn("text-[10px] font-black", percentage > 100 ? "text-rose-500" : "text-primary")}>{percentage}%</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export function OverviewCard({ balance, income, totalSpent, initials }: any) {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(val);
    };

    return (
        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-primary text-primary-foreground relative overflow-hidden h-full">
            {/* Visual pattern background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1.5" fill="currentColor" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dots)" />
                </svg>
            </div>

            <CardContent className="p-8 space-y-8 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                            <Landmark size={20} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">RESUMO CONTROLE</span>
                            <span className="text-xs font-bold uppercase tracking-tighter italic">CapitaFin Cloud</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Visão Geral</span>
                    <h2 className="text-4xl font-black tracking-tighter truncate">
                        {formatCurrency(balance)}
                    </h2>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div className="flex flex-col truncate">
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Entradas</span>
                        <span className="text-sm font-black truncate text-emerald-300">{formatCurrency(income)}</span>
                    </div>
                    <div className="flex flex-col truncate border-l border-white/10 pl-4">
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Saídas</span>
                        <span className="text-sm font-black truncate text-rose-300">{formatCurrency(totalSpent)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
