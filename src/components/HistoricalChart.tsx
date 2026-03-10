"use client";

import { useTheme } from "next-themes";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent } from "@/components/ui/card";

interface HistoricalChartProps {
    data: { month: string; income: number; spent: number }[];
}

export function HistoricalChart({ data }: HistoricalChartProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                    />
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fontWeight: 900, fill: "hsl(var(--muted-foreground))" }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fontWeight: 900, fill: "hsl(var(--muted-foreground))" }}
                        dx={0}
                        tickFormatter={(value) => `R$${(value / 1000).toFixed(1)}k`}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '1.5rem',
                            border: 'none',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                            backgroundColor: isDark ? 'hsla(var(--card), 0.8)' : 'rgba(255,255,255,0.8)',
                            backdropFilter: 'blur(10px)',
                            padding: '12px 20px'
                        }}
                        itemStyle={{ fontWeight: 'black', fontSize: '11px', textTransform: 'uppercase' }}
                        labelStyle={{ fontWeight: 'black', fontSize: '10px', color: 'hsl(var(--primary))', marginBottom: '4px' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="income"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorIncome)"
                        name="RECEITA"
                    />
                    <Area
                        type="monotone"
                        dataKey="spent"
                        stroke="#f43f5e"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorSpent)"
                        name="DESPESA"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
