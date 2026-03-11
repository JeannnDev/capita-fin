"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Pie, PieChart, Cell } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useFinance } from "@/lib/finance-context"
import { formatCurrency } from "@/lib/format"

export function DashboardExpenseChart() {
  const { budgets } = useFinance()

  // Purple gradient palette
  const purplePalette = [
    "#4C1D95", // Deeper
    "#6D28D9",
    "#8B5CF6",
    "#A78BFA",
    "#C4B5FD",
    "#DDD6FE",
  ]

  const chartData = budgets.map((budget, index) => {
    const key = budget.category.toLowerCase().replace(/\s+/g, '-')
    const color = purplePalette[index % purplePalette.length]
    return {
      category: key,
      spent: budget.spent,
      fill: color,
      name: budget.category
    }
  })

  const chartConfig = budgets.reduce((config, budget, index) => {
    const key = budget.category.toLowerCase().replace(/\s+/g, '-')
    const color = purplePalette[index % purplePalette.length]
    config[key] = {
      label: budget.category,
      color: color,
    }
    return config
  }, {
    spent: {
      label: "Gasto",
    },
  } as ChartConfig)

  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)

  return (
    <div
      className="flex flex-col rounded-2xl h-full border border-border shadow-sm overflow-hidden bg-card"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <p className="text-sm font-black tracking-tight text-foreground">Gastos por Categoria</p>
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground mt-0.5">Distribuição mensal</p>
      </div>

      {/* Donut chart */}
      <div className="flex-1 flex items-center justify-center px-4">
        {budgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 opacity-40">
            <div className="h-24 w-24 rounded-full border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-3 text-xs font-bold text-muted-foreground">Sem dados de orçamento</p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto w-full max-h-[220px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    className="rounded-xl border-border bg-card shadow-xl text-foreground"
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="spent"
                nameKey="category"
                strokeWidth={3}
                stroke="hsl(var(--card))"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                animationBegin={0}
                animationDuration={1200}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </div>

      {/* Legend list */}
      {budgets.length > 0 && (
        <div className="px-4 pb-3 space-y-1.5">
          {budgets.slice(0, 4).map((budget, index) => {
            const pct = totalSpent > 0 ? (budget.spent / totalSpent * 100) : 0
            const color = purplePalette[index % purplePalette.length]
            return (
              <div key={budget.category} className="flex items-center gap-2.5">
                <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[10px] font-bold text-muted-foreground flex-1 truncate">{budget.category}</span>
                <div className="flex items-center gap-2">
                  {/* mini bar */}
                  <div className="w-16 h-1 rounded-full bg-muted/30 overflow-hidden">
                    <div
                       className="h-full rounded-full"
                       style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                  <span className="text-[9px] font-black text-muted-foreground/60 w-8 text-right">{pct.toFixed(0)}%</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer total */}
      <div className="px-4 pb-4 pt-2 border-t border-border/50">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Gasto</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black tabular-nums text-violet-400">{formatCurrency(totalSpent)}</span>
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  )
}
