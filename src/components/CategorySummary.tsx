"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ChevronRight, CheckCircle2, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

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
        <div className="grid grid-cols-1 gap-6">
            {summary.map((item, index) => {
                const percent = (item.gasto / (item.limite || 1)) * 100;
                const isOver = item.gasto > item.limite;
                const isClose = percent > 85 && percent <= 100;

                return (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl group cursor-pointer overflow-hidden bg-white/50 dark:bg-card/30 backdrop-blur-sm">
                            <CardContent className="p-6 relative">
                                {/* Background Visual Hint */}
                                <div className={`absolute top-0 right-0 h-1 w-24 rounded-bl-full opacity-30 ${isOver ? 'bg-destructive' : 'bg-primary'}`} />

                                <div className="flex items-start justify-between">
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center space-x-2">
                                            <h3 className="font-black text-xl tracking-tight">{item.nome}</h3>
                                            <Badge variant="secondary" className="px-2 py-0 text-[10px] font-bold uppercase tracking-widest rounded-full opacity-70 group-hover:opacity-100 transition-opacity">
                                                {item.percentual}%
                                            </Badge>
                                            {isOver ? (
                                                <div className="flex items-center text-destructive-foreground bg-destructive px-2 py-0.5 rounded-full text-[10px] font-bold uppercase animate-pulse">
                                                    Exc.
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-emerald-600 bg-emerald-100 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                                                    OK
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Limite sugerido: {formatCurrency(item.limite)}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <div className="flex items-center justify-end space-x-2 mb-1">
                                            {isOver ? <TrendingUp size={16} className="text-destructive" /> : <TrendingDown size={16} className="text-emerald-500" />}
                                            <p className={`text-2xl font-black ${isOver ? 'text-destructive' : 'text-foreground'}`}>
                                                {formatCurrency(item.gasto)}
                                            </p>
                                        </div>
                                        <ChevronRight size={20} className="text-muted-foreground ml-auto group-hover:translate-x-1 group-hover:text-primary transition-all duration-300" />
                                    </div>
                                </div>

                                <div className="mt-8 relative">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 px-1">
                                        <span>Consumo</span>
                                        <span>{Math.round(percent)}%</span>
                                    </div>
                                    <Progress
                                        value={Math.min(percent, 100)}
                                        className={`h-2.5 rounded-full ${isOver ? 'bg-destructive/20' : 'bg-muted'}`}
                                    />
                                    {isOver && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-3 flex items-center p-3 bg-red-500/10 dark:bg-red-500/5 text-destructive rounded-2xl border border-destructive/10 leading-tight"
                                        >
                                            <AlertCircle className="h-4 w-4 mr-3 flex-shrink-0 animate-bounce" />
                                            <span className="text-xs font-bold tracking-tight">Limite excedido em {formatCurrency(item.gasto - item.limite)}. Analise seus gastos extras!</span>
                                        </motion.div>
                                    )}
                                    {isClose && !isOver && (
                                        <div className="mt-3 flex items-center p-3 bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-2xl border border-amber-500/10 leading-tight">
                                            <AlertCircle className="h-4 w-4 mr-3 flex-shrink-0" />
                                            <span className="text-xs font-bold tracking-tight">Perto do limite. Cuidado com novas compras!</span>
                                        </div>
                                    )}
                                    {!isOver && !isClose && item.gasto > 0 && (
                                        <div className="mt-3 flex items-center p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl border border-emerald-500/10 leading-tight">
                                            <CheckCircle2 className="h-4 w-4 mr-3 flex-shrink-0" />
                                            <span className="text-xs font-bold tracking-tight">Gestão excelente! Você ainda tem {formatCurrency(item.limite - item.gasto)} livres.</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                );
            })}
        </div>
    );
}
