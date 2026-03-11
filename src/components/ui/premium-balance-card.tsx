"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PremiumBalanceCardProps {
  title: string
  amount: string
  showBalance?: boolean
  icon?: React.ElementType
  action?: ReactNode
  secondaryMetrics?: {
    label: string
    value: string
    icon: React.ElementType
    trend?: "up" | "down"
  }[]
  className?: string
  color?: string
}

export function PremiumBalanceCard({
  title,
  amount,
  showBalance = true,
  icon: Icon,
  action,
  secondaryMetrics,
  className,
  color
}: PremiumBalanceCardProps) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-[1.5rem] p-5 md:p-6 text-white shadow-xl ring-1 ring-white/10",
        !color && "bg-linear-to-br from-indigo-600 via-purple-600 to-indigo-800 shadow-primary/20",
        className
      )}
      style={color ? { backgroundColor: color, boxShadow: `0 15px 30px -10px ${color}40` } : undefined}
    >
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
        {/* Main Section */}
        <div className="flex flex-col items-center md:items-start space-y-0.5 w-full md:w-auto">
          <div className="flex items-center justify-between w-full md:w-auto md:justify-start gap-4 mb-0.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-md">
                {Icon && <Icon className="h-3.5 w-3.5 text-white" />}
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">{title}</span>
            </div>
            {action && <div className="block md:hidden">{action}</div>}
          </div>
          
          <div className="flex items-center gap-4">
            <h2 className="text-3xl lg:text-4xl font-black tracking-tighter tabular-nums drop-shadow-sm">
              {showBalance ? amount : "R$ ••••••"}
            </h2>
          </div>
        </div>

        {/* Action and Metrics Section */}
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          {secondaryMetrics && secondaryMetrics.length > 0 && (
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
              {secondaryMetrics.map((metric, idx) => (
                <div key={idx} className="flex items-center gap-2.5 rounded-xl bg-white/10 backdrop-blur-md p-3 border border-white/10 shadow-inner group transition-all hover:bg-white/15">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg shadow-md transform group-hover:rotate-6 transition-transform",
                    metric.trend === "up" ? "bg-green-500" : metric.trend === "down" ? "bg-red-500" : "bg-white/20"
                  )}>
                    <metric.icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-wider text-white/60 mb-0">{metric.label}</p>
                    <p className="text-xs font-black tabular-nums">
                      {showBalance ? metric.value : "••••"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {action && <div className="hidden md:block shrink-0">{action}</div>}
        </div>
      </div>

      {/* Modern decorative visual elements */}
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -left-10 -bottom-10 h-24 w-24 rounded-full bg-indigo-500/20 blur-xl" />
    </div>
  )
}
