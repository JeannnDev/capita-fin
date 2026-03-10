"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

  const chartData = budgets.map((budget) => {
    const key = budget.category.toLowerCase().replace(/\s+/g, '-')
    return {
      category: key,
      spent: budget.spent,
      fill: budget.color,
      name: budget.category // For raw display if needed
    }
  })

  const chartConfig = budgets.reduce((config, budget) => {
    const key = budget.category.toLowerCase().replace(/\s+/g, '-')
    config[key] = {
      label: budget.category,
      color: budget.color,
    }
    return config
  }, {
    spent: {
      label: "Gasto",
    },
  } as ChartConfig)

  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-base font-semibold">Gastos por Categoria</CardTitle>
        <CardDescription>Distribuição mensal</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="spent"
              nameKey="category"
              stroke="0"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Total de {formatCurrency(totalSpent)} <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        <div className="leading-none text-muted-foreground">
          Mostrando distribuição baseada nos orçamentos atuais
        </div>
      </CardFooter>
    </Card>
  )
}
