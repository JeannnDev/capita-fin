"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Bell,
  PieChart,
  Settings,
  Target,
  FileText,
  CreditCard,
  X,
  LogOut,
  Camera,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"

const navigation = [
  { name: "Dashboard",   href: "/",           icon: LayoutDashboard,  id: "sidebar-nav-dashboard"  },
  { name: "Contas",      href: "/contas",      icon: Wallet,           id: "sidebar-nav-contas"     },
  { name: "Transações",  href: "/transacoes",  icon: Receipt,          id: "sidebar-nav-transacoes" },
  { name: "Extrato",     href: "/extrato",     icon: FileText,         id: "sidebar-nav-extrato"    },
  { name: "Lembretes",   href: "/lembretes",   icon: Bell,             id: "sidebar-nav-lembretes"  },
  { name: "Orçamento",   href: "/orcamento",   icon: PieChart,         id: "sidebar-nav-orcamento"  },
]

const planningNav = [
  { name: "Metas",       href: "/metas",       icon: Target,           id: "sidebar-nav-metas"      },
]

interface AppSidebarProps {
  isOpen: boolean
  onClose: () => void
}

function NavItem({
  item,
  isActive,
  onClose,
}: {
  item: typeof navigation[0]
  isActive: boolean
  onClose: () => void
}) {
  return (
    <Link
      key={item.name}
      id={item.id}
      href={item.href}
      onClick={onClose}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200 relative overflow-hidden",
        isActive
          ? "text-white shadow-lg shadow-violet-900/40"
          : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 group-hover:bg-sidebar-accent"
      )}
    >
      {/* Active background gradient */}
      {isActive && (
        <span className="absolute inset-0 premium-gradient opacity-100 rounded-xl" />
      )}

      {/* Icon */}
      <item.icon
        className={cn(
          "relative z-10 h-4 w-4 shrink-0 transition-all",
          isActive
            ? "text-white"
            : "text-violet-400/70 group-hover:text-violet-300"
        )}
      />

      {/* Label */}
      <span className="relative z-10 truncate">{item.name}</span>

      {/* Active indicator bar on left */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-white/60" />
      )}
    </Link>
  )
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const user = session?.user
  const [isUploading, setIsUploading] = useState(false)

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login")
        },
      },
    })
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || "Erro no upload")
      }
    } catch (error) {
      alert("Erro ao enviar arquivo")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-64 flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto overflow-hidden border-r border-sidebar-border bg-sidebar",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* ── Logo ───────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-6">
          <div className="flex items-center gap-3">
            {/* Icon badge */}
            <div className="flex h-9 w-9 items-center justify-center rounded-xl premium-gradient shadow-md shadow-violet-900/40">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-black tracking-tight text-sidebar-foreground leading-none">
                Capita<span className="text-violet-400">Fin</span>
              </p>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                Smart Finance
              </p>
            </div>
          </div>

          {/* Mobile close */}
          <button
            onClick={onClose}
            className="lg:hidden h-8 w-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Navigation ─────────────────────────── */}
        <nav className="flex-1 px-3 overflow-y-auto space-y-6 pb-4">
          {/* Main section */}
          <div>
            <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
              Menu Principal
            </p>
            <div className="space-y-0.5">
              {navigation.map((item) => (
                <NavItem
                  key={item.name}
                  item={item}
                  isActive={pathname === item.href}
                  onClose={onClose}
                />
              ))}
            </div>
          </div>

          {/* Planning section */}
          <div>
            <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
              Planejamento
            </p>
            <div className="space-y-0.5">
              {planningNav.map((item) => (
                <NavItem
                  key={item.name}
                  item={item}
                  isActive={pathname === item.href}
                  onClose={onClose}
                />
              ))}
            </div>
          </div>
        </nav>

        {/* ── Footer / User Profile ──────────────────── */}
        <div className="px-3 pb-5 border-t border-sidebar-border pt-4 mt-auto">
          <div className="space-y-4">
             {/* Settings button */}
             <NavItem
                item={{ name: "Configurações", href: "/configuracoes", icon: Settings, id: "sidebar-nav-settings" }}
                isActive={pathname === "/configuracoes"}
                onClose={onClose}
             />

             {/* User Profile Card */}
             {user && (
                <div className="relative group p-2 rounded-2xl bg-muted/20 border border-white/5 shadow-inner">
                   <div className="flex items-center gap-3">
                      {/* Avatar with Upload */}
                      <label className="relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl overflow-hidden group/avatar">
                         <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
                         
                         <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                            {isUploading ? (
                               <Loader2 className="h-4 w-4 text-white animate-spin" />
                            ) : (
                               <Camera className="h-4 w-4 text-white" />
                            )}
                         </div>

                         <div className="flex h-full w-full items-center justify-center rounded-xl premium-gradient text-white font-black text-sm shadow-md ring-2 ring-violet-500/20">
                            {user.image ? (
                               <img src={user.image} alt={user.name} className="h-full w-full object-cover rounded-xl" />
                            ) : (
                               <span>{user.name?.charAt(0).toUpperCase()}</span>
                            )}
                         </div>
                      </label>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                         <p className="text-xs font-black text-sidebar-foreground truncate uppercase tracking-tight">
                            {user.name}
                         </p>
                         <p className="text-[10px] text-muted-foreground/60 truncate font-medium">
                            {user.email}
                         </p>
                      </div>

                      {/* Logout */}
                      <button
                         onClick={handleSignOut}
                         title="Sair"
                         className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-90 shrink-0"
                      >
                         <LogOut className="h-4 w-4" />
                      </button>
                   </div>
                </div>
             )}
          </div>
        </div>
      </aside>
    </>
  )
}
