"use client"

import { AppShell } from "@/components/AppShell"
import { DashboardBalanceCard } from "@/components/dashboard/DashboardBalanceCard"
import { DashboardAccountsOverview } from "@/components/dashboard/DashboardAccountsOverview"
import { DashboardExpenseChart } from "@/components/dashboard/DashboardExpenseChart"
import { DashboardMonthlyChart } from "@/components/dashboard/DashboardMonthlyChart"
import { DashboardUpcomingPayments } from "@/components/dashboard/DashboardUpcomingPayments"
import { DashboardRecentTransactions } from "@/components/dashboard/DashboardRecentTransactions"

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        {/* Balance card - full width */}
        <DashboardBalanceCard />

        {/* Main grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Charts section */}
          <div className="space-y-6 lg:col-span-2">
            <DashboardMonthlyChart />
            <div className="grid gap-6 sm:grid-cols-2">
              <DashboardExpenseChart />
              <DashboardAccountsOverview />
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <DashboardUpcomingPayments />
            <DashboardRecentTransactions />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
