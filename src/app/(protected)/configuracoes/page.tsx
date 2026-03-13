"use client"

import { useState, useEffect, useRef } from "react"
import { AppShell } from "@/components/AppShell"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { 
    User, 
    Mail, 
    Shield, 
    Camera, 
    Loader2, 
    Save, 
    CheckCircle2,
    Key,
    ChevronRight
} from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export default function ConfiguracoesPage() {
    const { data: session, isPending: isSessionLoading } = authClient.useSession()
    const router = useRouter()
    
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [profileImage, setProfileImage] = useState<string | null>(null)
    const imageInitialized = useRef(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

    useEffect(() => {
        if (session?.user) {
            setName(session.user.name || "")
            setEmail(session.user.email || "")
            // Inicializa a imagem apenas uma vez, não sobrescreve o estado local após upload
            if (!imageInitialized.current) {
                setProfileImage(session.user.image || null)
                imageInitialized.current = true
            }
        }
    }, [session])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage(null)

        try {
            const { error } = await authClient.updateUser({
                name: name,
            })

            if (error) {
                setMessage({ type: "error", text: error.message || "Erro ao atualizar perfil" })
            } else {
                setMessage({ type: "success", text: "Perfil atualizado com sucesso!" })
                setTimeout(() => setMessage(null), 3000)
                // Força o re-fetch da sessão para o hook useSession() atualizar
                await authClient.getSession({ fetchOptions: { cache: "no-store" } })
                router.refresh()
            }
        } catch {
            setMessage({ type: "error", text: "Erro inesperado ao atualizar perfil" })
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        setMessage(null)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })

            if (res.ok) {
                const data = await res.json()
                // Atualiza a imagem localmente de imediato (sem esperar cache do useSession)
                setProfileImage(data.publicPath)
                setMessage({ type: "success", text: "Foto de perfil atualizada!" })
                setTimeout(() => setMessage(null), 3000)
                // Força re-fetch da sessão para sincronizar o hook useSession()
                await authClient.getSession({ fetchOptions: { cache: "no-store" } })
                router.refresh()
            } else {
                const data = await res.json()
                setMessage({ type: "error", text: data.error || "Erro no upload" })
            }
        } catch {
            setMessage({ type: "error", text: "Erro ao enviar arquivo" })
        } finally {
            setIsUploading(false)
        }
    }

    if (isSessionLoading) {
        return (
            <AppShell title="Configurações">
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                </div>
            </AppShell>
        )
    }

    return (
        <AppShell title="Configurações">
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
                
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -z-10 h-64 w-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute bottom-40 left-0 -z-10 h-80 w-80 bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col space-y-2 mb-8"
                >
                    <h1 className="text-3xl font-black tracking-tight text-foreground">Editar Perfil</h1>
                    <p className="text-sm text-muted-foreground font-medium">Atualize suas informações pessoais e mantenha sua conta em dia.</p>
                </motion.div>

                <div className="space-y-10">
                    
                    {/* Main Profile Card */}
                    <Card className="border-sidebar-border bg-sidebar/30 backdrop-blur-md overflow-hidden rounded-[2.5rem] shadow-2xl">
                        <CardContent className="p-8 md:p-12">
                            <div className="space-y-12">
                                
                                {/* Avatar Interaction Section */}
                                <div className="flex flex-col md:flex-row items-center gap-10">
                                    <div className="relative group">
                                        <div className="h-32 w-32 rounded-[2.5rem] overflow-hidden premium-gradient shadow-2xl ring-8 ring-background flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                                            {profileImage ? (
                                                <img 
                                                    src={profileImage} 
                                                    alt={name} 
                                                    className="h-full w-full object-cover" 
                                                />
                                            ) : (
                                                <span className="text-4xl font-black text-white">
                                                    {name?.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer rounded-[2.5rem]">
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                accept="image/*" 
                                                onChange={handleUpload} 
                                                disabled={isUploading}
                                            />
                                            {isUploading ? (
                                                <Loader2 className="h-8 w-8 text-white animate-spin" />
                                            ) : (
                                                <Camera className="h-8 w-8 text-white" />
                                            )}
                                        </label>

                                        {/* Camera Flip Badge */}
                                        <div className="absolute -bottom-1 -right-1 h-10 w-10 rounded-2xl bg-background border border-sidebar-border shadow-xl flex items-center justify-center text-primary z-20 pointer-events-none group-hover:scale-110 transition-transform">
                                            <Camera className="h-4 w-4" />
                                        </div>
                                    </div>

                                    <div className="text-center md:text-left space-y-4">
                                        <div>
                                            <h3 className="text-xl font-black text-foreground">Sua Foto de Perfil</h3>
                                            <p className="text-sm text-muted-foreground font-medium">Essa imagem será visível na sua dashboard e sidebar.</p>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-10 rounded-xl font-black text-[10px] uppercase tracking-widest border-sidebar-border hover:bg-sidebar-accent transition-all active:scale-95 px-6"
                                                asChild
                                            >
                                                <label className="cursor-pointer">
                                                    Escolher Novo Arquivo
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                                                </label>
                                            </Button>
                                            <p className="text-[10px] font-bold text-muted-foreground/60 tracking-wider uppercase">PNG, JPG ou GIF • MAX. 5MB</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Section */}
                                <form onSubmit={handleUpdateProfile} className="space-y-8 pt-8 border-t border-sidebar-border/50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Nome Completo</Label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                                <Input 
                                                    id="name"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Seu nome"
                                                    className="pl-12 h-14 bg-background/50 border-sidebar-border focus:ring-primary/20 focus:border-primary/50 rounded-2xl font-bold transition-all shadow-inner text-foreground"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3 opacity-60">
                                            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Endereço de E-mail</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                                                <Input 
                                                    id="email"
                                                    value={email}
                                                    disabled
                                                    className="pl-12 h-14 bg-muted/20 border-sidebar-border focus:ring-0 rounded-2xl font-medium cursor-not-allowed italic text-muted-foreground"
                                                />
                                                <Shield className="absolute right-4 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/40" />
                                            </div>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {message && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className={cn(
                                                    "p-4 rounded-2xl flex items-center gap-3 overflow-hidden",
                                                    message.type === "success" 
                                                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                                                        : "bg-red-500/10 text-red-500 border border-red-500/20"
                                                )}
                                            >
                                                {message.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                                                <span className="text-sm font-bold">{message.text}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="flex items-center justify-between pt-6">
                                        <p className="text-[10px] text-muted-foreground/50 font-medium max-w-[240px]">
                                            Ao salvar, seu nome será atualizado em todos os relatórios e faturas.
                                        </p>
                                        <Button 
                                            type="submit" 
                                            disabled={isLoading || name === session?.user?.name}
                                            className="h-14 px-12 rounded-[1.25rem] premium-gradient text-white font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-3" />
                                            ) : (
                                                <Save className="h-4 w-4 mr-3" />
                                            )}
                                            Salvar Alterações
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Action - Security */}
                    <Card className="border-sidebar-border bg-sidebar/10 backdrop-blur-sm rounded-[2.5rem] border border-dashed hover:bg-sidebar/20 transition-all cursor-pointer group">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="h-14 w-14 rounded-2xl bg-background border border-sidebar-border flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-lg">
                                        <Key className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-foreground uppercase tracking-tight">Segurança da Conta</p>
                                        <p className="text-xs text-muted-foreground font-medium">Trocar senha e gerenciar sessões ativas.</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </AppShell>
    )
}
