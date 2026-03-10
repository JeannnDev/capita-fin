"use client"

import { TrendingUp, TrendingDown, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useFinance } from "@/lib/finance-context"
import { formatCurrency } from "@/lib/format"

export function DashboardBalanceCard() {
  const [showBalance, setShowBalance] = useState(true)
  const { getTotalBalance, getTotalIncome, getTotalExpenses } = useFinance()

  const balance = getTotalBalance()
  const income = getTotalIncome()
  const expenses = getTotalExpenses()

  return (
    <Card className="overflow-hidden border-0 bg-primary text-primary-foreground shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-primary-foreground/80">Saldo total</p>
            <div className="mt-1 flex items-center gap-3">
              <p className="text-3xl font-bold tracking-tight">
                {showBalance ? formatCurrency(balance) : "R$ ••••••"}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                onClick={() => setShowBalance(!showBalance)}
              >
                {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 rounded-lg bg-primary-foreground/10 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-primary-foreground/70">Receitas</p>
              <p className="text-sm font-semibold">
                {showBalance ? formatCurrency(income) : "••••"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-primary-foreground/10 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
              <TrendingDown className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-primary-foreground/70">Despesas</p>
              <p className="text-sm font-semibold">
                {showBalance ? formatCurrency(expenses) : "••••"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
