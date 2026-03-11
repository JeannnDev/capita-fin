"use client"

import { Wallet, Building2, CreditCard, UtensilsCrossed, ArrowRight, Plus } from "lucide-react"
import { useFinance } from "@/lib/finance-context"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
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

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0)

  return (
    <div
      className="flex flex-col rounded-2xl h-full border border-border shadow-sm overflow-hidden bg-card"
    >  {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div>
          <p className="text-sm font-black tracking-tight text-foreground">Suas Contas</p>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground mt-0.5">Saldo por instituição</p>
        </div>
        <Link
          href="/contas"
          className="text-[10px] font-black uppercase tracking-wider text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/15"
        >
          Ver todas
        </Link>
      </div>

      {/* Total balance bar */}
      <div className="px-4 pb-4 pt-2 border-t border-border/50">
        <div className="mx-0 rounded-xl bg-primary/10 border border-primary/10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-primary/20 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">Total consolidado</p>
              <p className="text-base font-black tabular-nums text-foreground tracking-tight">{formatCurrency(totalBalance)}</p>
            </div>
          </div>
          <div className={cn(
            "text-xs font-black rounded-full px-2 py-0.5",
            totalBalance >= 0 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-red-500/15 text-red-600 dark:text-red-400"
          )}>
            {totalBalance >= 0 ? "▲" : "▼"} {accounts.length} contas
          </div>
        </div>
      </div>

      {/* Accounts list */}
      <div className="flex-1 px-3 pb-3 space-y-0.5">
        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 opacity-40">
            <div className="h-12 w-12 rounded-full border-2 border-dashed border-muted-foreground/20 flex items-center justify-center mb-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs font-bold text-muted-foreground mb-3">Nenhuma conta</p>
            <Link
              href="/contas"
              className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-wider hover:text-primary/80 transition-colors"
            >
              <Plus className="h-3 w-3" />Adicionar conta
            </Link>
          </div>
        ) : (
          accounts.slice(0, 4).map((account, idx) => {
            const Icon = accountIcons[account.type] || Wallet

            return (
              <Link
                key={account.id}
                href={`/contas/${account.id}`}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2.5 transition-all group",
                  idx !== Math.min(accounts.length, 4) - 1 && "border-b border-border/40",
                  account.balance < 0
                    ? "bg-red-500/5 hover:bg-red-500/10"
                    : "hover:bg-accent"
                )}
              >
                {/* Icon + info */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-black/5 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: `${account.color}18` }}
                  >
                    <Icon className="h-4 w-4 transition-transform" style={{ color: account.color }} />
                  </div>
                          <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate max-w-[140px] leading-none">{account.name}</p>
                    <p className="text-[9px] text-muted-foreground font-bold mt-1 uppercase tracking-wider">
                      {account.institution || "Outros"}
                    </p>
                  </div>
                </div>

                {/* Balance + arrow */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={cn(
                      "text-sm font-black tabular-nums",
                      account.balance < 0 ? "text-red-600 dark:text-red-400" : "text-foreground"
                    )}
                  >
                    {formatCurrency(account.balance)}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
