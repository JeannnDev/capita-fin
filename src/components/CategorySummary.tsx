"use client";

import { Layers } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CategorySummaryProps {
    summary: {
        id: string;
        nome: string;
        percentual: number;
        limite: number;
        gasto: number;
    }[];
}

export function CategorySummary({ summary }: CategorySummaryProps) {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(val);
    };

    return (
        <div className="space-y-4">
            {summary.map((item, index) => {
                const percent = (item.gasto / (item.limite || 1)) * 100;
                const isOver = item.gasto > item.limite;
                const isClose = percent > 85 && percent <= 100;

                return (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group"
                    >
                        <div className="flex items-center justify-between p-4 rounded-[2rem] bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 cursor-pointer">
                            <div className="flex items-center space-x-4 flex-1">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110",
                                    isOver ? "bg-rose-500/10 text-rose-500" : isClose ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"
                                )}>
                                    <Layers size={20} className="font-black" />
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                        <h4 className="text-sm font-black tracking-tight text-slate-700 dark:text-slate-200 truncate">{item.nome}</h4>
                                        <span className="text-[10px] font-black uppercase text-slate-400 opacity-60">Regra {item.percentual}%</span>
                                    </div>
                                    <div className="mt-2 w-full pr-10">
                                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                            <span>Consumo</span>
                                            <span className={isOver ? "text-rose-500" : "text-primary"}>{Math.round(percent)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(percent, 100)}%` }}
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-1000",
                                                    isOver ? "bg-rose-500" : isClose ? "bg-amber-500" : "bg-primary"
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right pl-4">
                                <p className={cn(
                                    "text-lg font-black tracking-tighter leading-none mb-1",
                                    isOver ? "text-rose-500" : "text-slate-900 dark:text-white"
                                )}>
                                    {formatCurrency(item.gasto)}
                                </p>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">de {formatCurrency(item.limite)}</span>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
