"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts"
import { useFinance } from "@/lib/finance-context"

export function DashboardMonthlyChart() {
  const { transactions } = useFinance()

  // Build last 6 months of data
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    return d
  })

  const data = months.map((d) => {
    const m = d.getMonth()
    const y = d.getFullYear()
    const monthTransactions = transactions.filter((t) => {
      const td = new Date(t.date)
      return td.getMonth() === m && td.getFullYear() === y
    })
    return {
      month: d.toLocaleString("pt-BR", { month: "short" }),
      receitas: monthTransactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
      despesas: monthTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    }
  })

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Receitas vs Despesas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(145, 63%, 49%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(145, 63%, 49%)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(263, 70%, 58%)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(263, 70%, 58%)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                width={40}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-card px-3 py-2 shadow-lg">
                        <p className="mb-1.5 text-sm font-medium text-foreground">{label}</p>
                        {payload.map((entry, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-muted-foreground">
                              {entry.dataKey === "receitas" ? "Receitas" : "Despesas"}:
                            </span>
                            <span className="font-medium text-foreground">
                              {formatCurrency(entry.value as number)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="receitas"
                stroke="hsl(145, 63%, 49%)"
                strokeWidth={2}
                fill="url(#incomeGradient)"
                dot={{ fill: "hsl(145, 63%, 49%)", strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "hsl(var(--background))" }}
              />
              <Area
                type="monotone"
                dataKey="despesas"
                stroke="hsl(263, 70%, 58%)"
                strokeWidth={2}
                fill="url(#expenseGradient)"
                dot={{ fill: "hsl(263, 70%, 58%)", strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "hsl(var(--background))" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(145, 63%, 49%)" }} />
            <span className="text-sm text-muted-foreground">Receitas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(263, 70%, 58%)" }} />
            <span className="text-sm text-muted-foreground">Despesas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
