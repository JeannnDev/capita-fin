"use client"

import { Wallet, Building2, CreditCard, UtensilsCrossed, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useFinance } from "@/lib/finance-context"
import { formatCurrency } from "@/lib/format"
import Link from "next/link"

const accountIcons: Record<string, typeof Wallet> = {
  wallet: Wallet,
  checking: Building2,
  savings: Building2,
  credit: CreditCard,
  food: UtensilsCrossed,
}

export function DashboardAccountsOverview() {
  const { accounts } = useFinance()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Contas</CardTitle>
        <Button variant="ghost" size="sm" className="text-sm text-muted-foreground" asChild>
          <Link href="/contas">Ver todas</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {accounts.slice(0, 4).map((account) => {
          const Icon = accountIcons[account.type] || Wallet
          return (
              <Link 
                key={account.id}
                href={`/contas/${account.id}`}
                className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/50 w-full"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${account.color}20` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: account.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{account.name}</p>
                    <p className="text-xs text-muted-foreground">{account.institution}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(account.balance)}
                  </span>
                  <div className="h-8 w-8 flex items-center justify-center">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
