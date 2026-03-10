"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface CategoryChartProps {
    data: { name: string; value: number; color: string }[];
    totalIncome: number;
}

export function CategoryChart({ data, totalIncome }: CategoryChartProps) {
    const totalSpent = data.reduce((acc, curr) => acc + curr.value, 0);
    const savings = Math.max(0, totalIncome - totalSpent);

    const chartData = [
        ...data,
        { name: "Reserva/Sobra", value: savings, color: "#10b981" }
    ];

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col lg:flex-row items-center gap-8">
                {/* Donut Chart Container */}
                <div className="w-full lg:w-1/2 h-[280px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={4}
                                dataKey="value"
                                stroke="none"
                                animationDuration={1200}
                                animationBegin={0}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        className="hover:opacity-90 transition-opacity cursor-pointer active:scale-95 origin-center"
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '16px',
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                    padding: '8px 16px',
                                    fontSize: '11px',
                                    fontWeight: 'bold'
                                }}
                                formatter={(value: any) => {
                                    if (typeof value === 'number') return `R$ ${value.toLocaleString('pt-BR')}`;
                                    return `R$ ${value}`;
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Central Value */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Fluxo Total</span>
                        <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
                            R$ {totalSpent.toLocaleString('pt-BR')}
                        </span>
                        <div className="mt-1 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest leading-none">Healthy Flow</span>
                        </div>
                    </div>
                </div>

                {/* Vertical Professional Legend */}
                <div className="w-full lg:w-1/2 space-y-3 lg:pr-4">
                    {chartData.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/10 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all group">
                            <div className="flex items-center space-x-3 min-w-0">
                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight truncate">{item.name}</span>
                                    <span className="text-sm font-black text-slate-700 dark:text-slate-200 truncate">R$ {item.value.toLocaleString('pt-BR')}</span>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <span className="text-[10px] font-black text-slate-400">
                                    {((item.value / (totalIncome || 1)) * 100).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Footer inspired by Image 2 */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Disponibilidade</span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Meta Mensal: {((totalSpent / (totalIncome || 1)) * 100).toFixed(0)}% Utilizado</span>
                </div>
                <div className="h-2 w-32 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((totalSpent / (totalIncome || 1)) * 100, 100)}%` }}
                        className="h-full bg-primary"
                    />
                </div>
            </div>
        </div>
    );
}
