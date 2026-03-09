"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DollarSign,
    Mail,
    Lock,
    User,
    ArrowLeft,
    Eye,
    EyeOff,
    Chrome
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await authClient.signIn.email({
            email,
            password,
        });

        if (error) {
            alert(error.message);
        } else {
            router.push("/");
            router.refresh();
        }
        setLoading(false);
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await authClient.signUp.email({
            email,
            password,
            name,
        });

        if (error) {
            alert(error.message);
        } else {
            router.push("/");
            router.refresh();
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-950 overflow-hidden font-sans">
            {/* --- Left Hero Section (Visual) --- */}
            <div className="relative hidden md:flex md:w-1/2 lg:w-[50%] bg-slate-900 border-r border-white/5 overflow-hidden items-center justify-center p-12 lg:p-24 h-screen sticky top-0">
                <div
                    className="absolute inset-0 opacity-60 bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] hover:scale-110"
                    style={{ backgroundImage: `url('/finance_hero_bg_1773082620295.png')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                <div className="relative z-10 w-full mt-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <h2 className="text-5xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]">
                            O melhor <br />
                            <span className="text-primary italic">Controle</span> <br />
                            Financeiro.
                        </h2>
                        <p className="text-lg text-slate-300 font-normal leading-relaxed max-w-md">
                            Acesse sua conta para gerenciar seus planos, bater suas metas e transformar sua vida financeira hoje.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* --- Right Form Section (Auth) --- */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 relative min-h-screen overflow-hidden">
                {/* Nebula Effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{
                            x: [0, 100, 0],
                            y: [0, 50, 0],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-[20%] -right-[10%] w-[80%] h-[70%] bg-cyan-500/10 rounded-full blur-[120px] dark:bg-cyan-500/5 rotate-12"
                    />
                    <motion.div
                        animate={{
                            x: [0, -70, 0],
                            y: [0, 100, 0],
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[10%] -left-[20%] w-[90%] h-[80%] bg-blue-600/10 rounded-full blur-[140px] dark:bg-blue-600/5 -rotate-12"
                    />
                    <motion.div
                        animate={{
                            x: [0, 50, 0],
                            y: [0, -80, 0],
                        }}
                        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -bottom-[20%] left-[10%] w-[70%] h-[60%] bg-indigo-500/10 rounded-full blur-[110px] dark:bg-indigo-500/5"
                    />
                </div>

                {/* Top Controls */}
                <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-50">
                    <Link href="/" className="flex items-center space-x-2 p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all group">
                        <ArrowLeft className="h-4 w-4 text-slate-500 group-hover:text-primary transition-colors" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-primary">Voltar</span>
                    </Link>
                    <ThemeToggle />
                </div>

                <div className="flex-1 flex flex-col items-center max-w-[420px] mx-auto w-full px-6 relative z-10 pt-12">
                    <div className="flex-1" /> {/* Top Spacer */}

                    <div className="w-full text-left mb-10">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {mode === "login" ? "Entrar" : "Criar Conta"}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            {mode === "login"
                                ? "Insira seu e-mail e senha para acessar sua conta."
                                : "Preencha os dados abaixo para começar."}
                        </p>
                    </div>

                    {/* Auth Form */}
                    <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="w-full space-y-5">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={mode}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-5"
                            >
                                {mode === "signup" && (
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nome</Label>
                                        <div className="relative">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="Seu nome"
                                                className="h-11 pl-10 rounded-lg border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:ring-primary/20 transition-all"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">E-mail</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="seu@email.com"
                                            type="email"
                                            className="h-11 pl-10 rounded-lg border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:ring-primary/20 transition-all font-medium"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Senha</Label>
                                        {mode === "login" && (
                                            <Link href="#" className="text-xs font-semibold text-primary/80 hover:text-primary transition-colors">
                                                Esqueceu a senha?
                                            </Link>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="••••••••"
                                            type={showPassword ? "text" : "password"}
                                            className="h-11 pl-10 pr-10 rounded-lg border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:ring-primary/20 transition-all"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                        >
                            {loading ? "Processando..." : (mode === "login" ? "Entrar" : "Criar")}
                        </Button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-100 dark:border-white/5" />
                            </div>
                            <div className="relative flex justify-center uppercase">
                                <span className="bg-white dark:bg-slate-950 px-4 text-[10px] font-bold text-slate-400 tracking-wider">OU CONTINUE COM</span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            type="button"
                            className="w-full h-11 rounded-lg border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center justify-center space-x-3"
                        >
                            <Chrome className="h-4 w-4 text-primary" />
                            <span>Entrar com Google</span>
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm">
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            {mode === "login" ? "Ainda não tem uma conta?" : "Já possui acesso?"}
                            <button
                                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                                className="ml-1.5 text-primary font-bold hover:underline"
                            >
                                {mode === "login" ? "Criar conta" : "Entrar"}
                            </button>
                        </p>
                    </div>

                    <div className="flex-1" /> {/* Bottom Spacer */}

                    <div className="pb-8 text-center">
                        <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                            Copyright © 2026 CAPITAFIN. Todos os direitos reservados.
                        </p>
                    </div>
                </div>
            </div>
        </div >
    );
}

