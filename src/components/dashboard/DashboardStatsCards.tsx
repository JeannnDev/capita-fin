"use client"

import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { useFinance } from "@/lib/finance-context"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string
  change?: string
  changePercent?: string
  trend?: "up" | "down" | "neutral"
  subtitle?: string
  color?: string
  miniChart?: number[]
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 80
  const height = 32
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * height
    return `${x},${y}`
  }).join(" ")

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function StatCard({ title, value, change, changePercent, trend, subtitle, color = "#8b5cf6", miniChart }: StatCardProps) {
  const isUp = trend === "up"
  const isDown = trend === "down"

  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all group">
      {/* Decorative glow */}
      <div
        className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
          {subtitle && (
            <p className="text-[9px] text-muted-foreground font-bold mt-0.5">{subtitle}</p>
          )}
        </div>
        {(change || changePercent) && (
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black",
              isUp && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
              isDown && "bg-red-500/15 text-red-600 dark:text-red-400",
              !isUp && !isDown && "bg-muted text-muted-foreground"
            )}
          >
            {isUp ? <ArrowUpRight className="h-3 w-3" /> : isDown ? <ArrowDownRight className="h-3 w-3" /> : null}
            {changePercent || change}
          </div>
        )}
      </div>

      <div className="flex items-end justify-between mt-auto">
        <h3 className="text-2xl font-black tracking-tight tabular-nums text-foreground">{value}</h3>
        {miniChart && <MiniSparkline data={miniChart} color={color} />}
      </div>
    </div>
  )
}

export function DashboardStatsCards() {
  const { getTotalBalance, getTotalIncome, getTotalExpenses, transactions } = useFinance()

  const balance = getTotalBalance()
  const income = getTotalIncome()
  const expenses = getTotalExpenses()
  const netSavings = income - expenses
  const savingRate = income > 0 ? ((netSavings / income) * 100) : 0

  // Build sparkline from last 7 days of transactions
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dayT = transactions.filter(t => {
      const td = new Date(t.date)
      return td.toDateString() === d.toDateString()
    })
    return dayT.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0)
  })

  const last7exp = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dayT = transactions.filter(t => {
      const td = new Date(t.date)
      return td.toDateString() === d.toDateString()
    })
    return dayT.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0)
  })

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        title="Saldo Total"
        subtitle="Todas as contas"
        value={formatCurrency(balance)}
        change={balance >= 0 ? "+Positivo" : "Negativo"}
        changePercent={balance >= 0 ? "▲" : "▼"}
        trend={balance >= 0 ? "up" : "down"}
        color="#8b5cf6"
        miniChart={last7}
      />
      <StatCard
        title="Receitas"
        subtitle="Mês atual"
        value={formatCurrency(income)}
        change={`+${formatCurrency(income)}`}
        changePercent="+100%"
        trend="up"
        color="#10b981"
        miniChart={last7}
      />
      <StatCard
        title="Despesas"
        subtitle="Mês atual"
        value={formatCurrency(expenses)}
        change={`-${formatCurrency(expenses)}`}
        changePercent={expenses > income ? "▲" : "▼"}
        trend={expenses > income ? "down" : "neutral"}
        color="#f43f5e"
        miniChart={last7exp}
      />
      <StatCard
        title="Taxa de Poupança"
        subtitle="Receitas vs Despesas"
        value={`${savingRate.toFixed(1)}%`}
        change={netSavings >= 0 ? `+${formatCurrency(netSavings)}` : formatCurrency(netSavings)}
        changePercent={`${savingRate.toFixed(0)}%`}
        trend={netSavings >= 0 ? "up" : "down"}
        color="#f59e0b"
        miniChart={[40, 55, 45, 60, 50, 65, savingRate]}
      />
    </div>
  )
}
