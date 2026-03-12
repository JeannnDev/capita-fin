"use client"

import { AppShell } from "@/components/AppShell"
import { DashboardStatsCards } from "@/components/dashboard/DashboardStatsCards"
import { DashboardAccountsOverview } from "@/components/dashboard/DashboardAccountsOverview"
import { DashboardExpenseChart } from "@/components/dashboard/DashboardExpenseChart"
import { DashboardMonthlyChart } from "@/components/dashboard/DashboardMonthlyChart"
import { DashboardUpcomingPayments } from "@/components/dashboard/DashboardUpcomingPayments"
import { DashboardRecentTransactions } from "@/components/dashboard/DashboardRecentTransactions"

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard">
      <div className="space-y-5 max-w-[1600px] mx-auto">

        {/* Stat Cards Row */}
        <DashboardStatsCards />

        {/* Main Chart + Pie */}
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 min-h-[400px]">
            <DashboardMonthlyChart />
          </div>
          <div className="lg:col-span-1">
            <DashboardExpenseChart />
          </div>
        </div>

        {/* Bottom: 3 equal columns */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <DashboardAccountsOverview />
          <DashboardUpcomingPayments />
          <DashboardRecentTransactions />
        </div>

      </div>
    </AppShell>
  )
}
