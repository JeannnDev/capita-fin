"use client"

import { TrendingUp, TrendingDown, Eye, EyeOff, Wallet } from "lucide-react"
import { useState } from "react"
import { useFinance } from "@/lib/finance-context"
import { formatCurrency } from "@/lib/format"
import { PremiumBalanceCard } from "@/components/ui/premium-balance-card"

export function DashboardBalanceCard() {
  const [showBalance, setShowBalance] = useState(true)
  const { getTotalBalance, getTotalIncome, getTotalExpenses } = useFinance()

  const balance = getTotalBalance()
  const income = getTotalIncome()
  const expenses = getTotalExpenses()

  return (
    <PremiumBalanceCard
      title="Saldo Consolidado"
      amount={formatCurrency(balance)}
      showBalance={showBalance}
      icon={Wallet}
      action={
        <button
          onClick={() => setShowBalance(!showBalance)}
          className="h-12 w-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white/80 hover:bg-white/20 hover:text-white transition-all shadow-lg border border-white/20 active:scale-95"
          title={showBalance ? "Esconder saldo" : "Mostrar saldo"}
        >
          {showBalance ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
        </button>
      }
      secondaryMetrics={[
        {
          label: "Entradas",
          value: formatCurrency(income),
          icon: TrendingUp,
          trend: "up"
        },
        {
          label: "Saídas",
          value: formatCurrency(expenses),
          icon: TrendingDown,
          trend: "down"
        }
      ]}
    />
  )
}
