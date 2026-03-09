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
        <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0">
                <div className="h-[300px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={85}
                                outerRadius={120}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                                animationBegin={200}
                                animationDuration={1000}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        className="hover:opacity-80 transition-opacity cursor-pointer active:scale-95 origin-center"
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '24px',
                                    border: 'none',
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                                    fontWeight: 'bold',
                                    fontSize: '12px',
                                    padding: '12px 20px'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Central Insight Overly */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-center"
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Reservado</span>
                            <div className="flex items-baseline justify-center space-x-1">
                                <span className="text-3xl font-black tracking-tighter">
                                    {((savings / totalIncome) * 100).toFixed(0)}%
                                </span>
                            </div>
                            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1 block px-2 py-0.5 bg-emerald-500/10 rounded-full">Meta OK</span>
                        </motion.div>
                    </div>
                </div>

                {/* Legend/Legend Grid */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                    {chartData.slice(0, 4).map((item, i) => (
                        <div key={i} className="flex items-center space-x-3 group cursor-help">
                            <div
                                className="w-2 h-2 rounded-full transform group-hover:scale-150 transition-transform"
                                style={{ backgroundColor: item.color }}
                            />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-tight text-slate-500">{item.name}</span>
                                <span className="text-sm font-black">R$ {item.value.toLocaleString('pt-BR')}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
