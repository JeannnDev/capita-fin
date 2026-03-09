"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MoveUpRight, MoveDownLeft, Landmark, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Primary Balance Hero Card - Nubank Style */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-2"
            >
                <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-primary text-primary-foreground relative group transition-transform hover:scale-[1.01] duration-300">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                        <Landmark size={120} />
                    </div>

                    <CardContent className="p-8 lg:p-10 space-y-6 relative z-10">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold uppercase tracking-wider opacity-90">Saldo Livre Atual</span>
                            <button
                                onClick={() => setIsVisible(!isVisible)}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                            >
                                {isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                            </button>
                        </div>

                        <div className="space-y-1">
                            {isVisible ? (
                                <motion.h2
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-5xl lg:text-6xl font-black tracking-tighter"
                                >
                                    {formatCurrency(balance)}
                                </motion.h2>
                            ) : (
                                <div className="h-[72px] flex items-center">
                                    <div className="w-48 h-10 bg-white/20 rounded-2xl animate-pulse" />
                                </div>
                            )}
                            <p className="text-white/70 font-medium">Você já utilizou {formatCurrency(totalSpent)} este mês.</p>
                        </div>

                        <div className="pt-4 flex items-center space-x-6">
                            <div className="flex items-center text-sm font-black">
                                <div className="p-2 bg-white/20 rounded-xl mr-3">
                                    <MoveDownLeft className="h-4 w-4" />
                                </div>
                                <span>Renda: {formatCurrency(income)}</span>
                            </div>
                            <div className="flex items-center text-sm font-black">
                                <div className="p-2 bg-white/20 rounded-xl mr-3">
                                    <MoveUpRight className="h-4 w-4" />
                                </div>
                                <span>Gastos: {formatCurrency(totalSpent)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Monthly Limit Mini-Card - Mercado Livre Style */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="border-none shadow-xl rounded-3xl bg-card h-full p-8 flex flex-col justify-between hover:shadow-2xl transition-shadow duration-500">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Limite Total</span>
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <h3 className="text-3xl font-black">{formatCurrency(totalLimit)}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-4">
                            "Economizar permite realizar planos maiores."
                        </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-muted">
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            <span>Status da Meta</span>
                            <span>{Math.round((totalSpent / (totalLimit || 1)) * 100)}%</span>
                        </div>
                        <div className="h-3 w-full bg-muted rounded-full mt-3 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((totalSpent / (totalLimit || 1)) * 100, 100)}%` }}
                                className={`h-full rounded-full ${totalSpent > totalLimit ? 'bg-destructive' : 'bg-primary'}`}
                            />
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
