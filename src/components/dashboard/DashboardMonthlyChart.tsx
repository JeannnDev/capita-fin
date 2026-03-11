"use client"

import { useState, useMemo } from "react"
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
import { TrendingUp, TrendingDown, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const PERIODS = [
  { label: "Mês", value: "month" },
  { label: "6M", value: "6months" },
  { label: "Ano", value: "year" },
]

export function DashboardMonthlyChart() {
  const { transactions } = useFinance()
  const [period, setPeriod] = useState("6months")
  const [showDropdown, setShowDropdown] = useState(false)

  const data = useMemo(() => {
    const monthsCount = period === "month" ? 1 : period === "year" ? 12 : 6
    const monthsArray = Array.from({ length: monthsCount }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (monthsCount - 1 - i))
      return d
    })

    return monthsArray.map((d) => {
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
  }, [period, transactions])

  const totalReceitas = data.reduce((s, d) => s + d.receitas, 0)
  const totalDespesas = data.reduce((s, d) => s + d.despesas, 0)
  const healthPct = totalReceitas > 0 ? ((totalReceitas - totalDespesas) / totalReceitas * 100) : 0
  const isHealthy = healthPct >= 0

  const currentLabel = PERIODS.find(p => p.value === period)?.label || "6M"

  return (
    <div className="relative overflow-hidden rounded-2xl h-full shadow-xl bg-card border border-border"
    >
      {/* Top Header */}
      <div className="p-5 pb-0">
        <div className="flex items-start justify-between">
          {/* Left metrics */}
          <div className="flex gap-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground mb-1">Total Receitas</p>
              <p className="text-2xl font-black tracking-tight text-foreground tabular-nums">
                {formatCurrency(totalReceitas)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">+{Math.abs(healthPct).toFixed(2)}%</span>
                <span className="text-[10px] text-muted-foreground font-medium ml-1">vs despesas</span>
              </div>
            </div>

            <div className="border-l border-border pl-8">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground mb-1">Saúde</p>
              <div className="flex items-center gap-2">
                {isHealthy ? (
                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                )}
                <p className={cn("text-2xl font-black tracking-tight tabular-nums", isHealthy ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                  {healthPct.toFixed(1)}%
                </p>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(Math.abs(totalReceitas - totalDespesas))}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium ml-1">saldo líquido</span>
              </div>
            </div>
          </div>

          {/* Period selector */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors border border-border hover:border-primary/50 bg-muted/50"
            >
              {currentLabel}
              <ChevronDown className="h-3 w-3" />
            </button>
            {showDropdown && (
              <div className="absolute right-0 top-full mt-1 rounded-xl border border-border bg-card p-1 shadow-xl z-20 min-w-[80px]">
                {PERIODS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => { setPeriod(p.value); setShowDropdown(false) }}
                    className={cn(
                      "w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                      period === p.value ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[260px] w-full px-2 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="mainGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                <stop offset="60%" stopColor="#4f46e5" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="receitaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border) / 0.1)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground) / 0.6)", fontWeight: 700 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground) / 0.4)", fontWeight: 600 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              width={42}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-2xl border border-border px-4 py-3 shadow-xl bg-card">
                      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border pb-1.5">{label}</p>
                      <div className="space-y-2">
                        {payload.map((entry, index) => (
                          <div key={index} className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                              <span className="text-xs font-bold text-muted-foreground">
                                {entry.dataKey === "receitas" ? "Receitas" : "Despesas"}
                              </span>
                            </div>
                            <span className="text-xs font-black tabular-nums text-foreground">
                              {formatCurrency(entry.value as number)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey="receitas"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#receitaGradient)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "hsl(var(--card))", fill: "#10b981" }}
              animationDuration={1200}
            />
            <Area
              type="monotone"
              dataKey="despesas"
              stroke="#8b5cf6"
              strokeWidth={3}
              fill="url(#mainGradient)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "hsl(var(--card))", fill: "#8b5cf6" }}
              animationDuration={1400}
              animationBegin={200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Legend */}
      <div className="flex items-center gap-5 px-5 pb-4 pt-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-4 rounded-full bg-emerald-500 opacity-80" />
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Receitas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-4 rounded-full bg-primary opacity-80" />
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Despesas</span>
        </div>
      </div>
    </div>
  )
}
