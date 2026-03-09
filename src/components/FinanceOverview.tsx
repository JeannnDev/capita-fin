"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FinanceOverviewProps {
    summary: {
        nome: string;
        gasto: number;
    }[];
}

const COLORS = ["#820ad1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

export function FinanceOverview({ summary }: FinanceOverviewProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const chartData = summary.filter(s => s.gasto > 0).map((s) => ({
        name: s.nome,
        value: s.gasto,
    }));

    const totalGasto = chartData.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="border-none shadow-2xl rounded-[2.5rem] bg-card/60 backdrop-blur-md overflow-hidden hover:shadow-primary/10 transition-shadow">
                <CardHeader className="pt-8 px-8">
                    <CardTitle className="text-3xl font-black tracking-tighter">Insights do Mês</CardTitle>
                    <CardDescription className="text-sm font-medium opacity-70">
                        Sua distribuição de gastos reais por categorias.
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] p-0 relative flex items-center justify-center">
                    {chartData.length > 0 ? (
                        <>
                            {/* Central Info Overlay - Fintech Style */}
                            <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Total Gasto</span>
                                <span className="text-2xl font-black">
                                    {new Intl.NumberFormat("pt-BR", { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalGasto)}
                                </span>
                            </div>

                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={85}
                                        outerRadius={110}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                        animationBegin={0}
                                        animationDuration={1500}
                                        animationEasing="ease-out"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity cursor-pointer outline-none" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: "24px",
                                            border: "none",
                                            boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)",
                                            padding: "16px",
                                            fontWeight: "900",
                                            fontSize: "14px"
                                        }}
                                        cursor={{ strokeWidth: 0 }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        align="center"
                                        iconType="circle"
                                        iconSize={8}
                                        wrapperStyle={{ paddingTop: "20px", fontWeight: "700", opacity: 0.8, fontSize: "12px" }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </>
                    ) : (
                        <div className="flex flex-col h-full items-center justify-center text-center p-8 space-y-4">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center animate-pulse">
                                <p className="text-muted-foreground">?</p>
                            </div>
                            <div className="space-y-1">
                                <p className="font-black text-xl">Seu gráfico aparecerá aqui</p>
                                <p className="text-sm text-muted-foreground leading-relaxed px-12">
                                    Registre seus primeiros gastos para ver a mágica da distribuição transformar seus dados em insights.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
