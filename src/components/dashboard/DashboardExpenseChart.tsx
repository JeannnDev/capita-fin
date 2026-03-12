"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Pie, PieChart, Cell, Sector } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useFinance } from "@/lib/finance-context"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

interface PieActiveShapeProps {
  cx: number
  cy: number
  innerRadius: number
  outerRadius: number
  startAngle: number
  endAngle: number
  fill?: string
}

const renderActiveShape = (props: PieActiveShapeProps) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 12}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="hsl(var(--card))"
        strokeWidth={3}
        className="drop-shadow-2xl transition-all duration-300 transform-gpu"
      />
    </g>
  )
}

export function DashboardExpenseChart() {
  const { budgets } = useFinance()
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)

  // Purple gradient palette
  const purplePalette = [
    "#4C1D95",
    "#6D28D9",
    "#8B5CF6",
    "#A78BFA",
    "#C4B5FD",
    "#DDD6FE",
  ]

  // Sort budgets by spent amount descending and filter out zero if there are any non-zero ones
  const activeBudgets = React.useMemo(() => {
    const sorted = [...budgets].sort((a, b) => b.spent - a.spent)
    const hasSpent = sorted.some(b => b.spent > 0)
    return hasSpent ? sorted.filter(b => b.spent > 0) : sorted
  }, [budgets])

  const chartData = activeBudgets.map((budget, index) => {
    const key = budget.category.toLowerCase().replace(/\s+/g, '-')
    const color = purplePalette[index % purplePalette.length]
    return {
      category: key,
      spent: budget.spent,
      fill: color,
      name: budget.category,
      id: index
    }
  })

  const chartConfig = activeBudgets.reduce((config, budget, index) => {
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

  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index)
  }

  const onMouseLeave = () => {
    setActiveIndex(null)
  }

  // Cast Pie to any to satisfy version-specific prop types in JSX
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PieComponent = Pie as any

  return (
    <div
      className="flex flex-col rounded-2xl h-full border border-border shadow-sm overflow-hidden bg-card transition-all"
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
              <PieComponent
                data={chartData}
                dataKey="spent"
                nameKey="category"
                strokeWidth={3}
                stroke="hsl(var(--card))"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                animationBegin={0}
                animationDuration={800}
                activeIndex={activeIndex !== null ? activeIndex : undefined}
                activeShape={renderActiveShape}
                onMouseEnter={onPieEnter}
                onMouseLeave={onMouseLeave}
              >
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {chartData.map((entry: any, index: number) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fill} 
                    className="transition-all duration-300"
                    style={{ 
                      filter: activeIndex !== null && activeIndex !== index ? 'opacity(0.4) grayscale(0.2)' : 'none',
                    }}
                  />
                ))}
              </PieComponent>
            </PieChart>
          </ChartContainer>
        )}
      </div>

      {/* Legend list */}
      {activeBudgets.length > 0 && (
        <div 
          className="px-4 pb-4 space-y-1"
          onMouseLeave={() => setActiveIndex(null)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1">
            {activeBudgets.slice(0, 4).map((budget, index) => {
              const pct = totalSpent > 0 ? (budget.spent / totalSpent * 100) : 0
              const color = purplePalette[index % purplePalette.length]
              const isActive = activeIndex === index

              return (
                <div 
                  key={budget.category} 
                  className={cn(
                    "flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-all duration-300 cursor-default",
                    isActive ? "bg-muted/50 scale-[1.02] shadow-sm" : "opacity-60 grayscale-[0.3] lg:hover:opacity-100 lg:hover:grayscale-0"
                  )}
                  onMouseEnter={() => setActiveIndex(index)}
                  onTouchStart={() => setActiveIndex(index)}
                >
                  <div 
                    className={cn(
                      "h-2 w-2 rounded-full shrink-0 transition-transform duration-300",
                      isActive && "scale-150 rotate-45"
                    )} 
                    style={{ backgroundColor: color }} 
                  />
                  <span className={cn(
                    "text-[10px] font-bold text-muted-foreground flex-1 truncate transition-colors",
                    isActive && "text-foreground"
                  )}>
                    {budget.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-12 sm:w-16 h-1 rounded-full bg-muted/30 overflow-hidden">
                      <div
                         className={cn("h-full rounded-full transition-all duration-500", isActive && "brightness-125")}
                         style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                    <span className={cn(
                      "text-[9px] font-black text-muted-foreground/60 w-7 text-right transition-colors",
                      isActive && "text-violet-400"
                    )}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
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
