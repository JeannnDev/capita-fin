"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { z } from "zod";

const forgotSchema = z.object({
    email: z.string().email("E-mail inválido"),
});

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setEmailError(null);

        const validation = forgotSchema.safeParse({ email });
        if (!validation.success) {
            setEmailError(validation.error.flatten().fieldErrors.email?.[0] || null);
            return;
        }

        setLoading(true);
        try {
            const { error: resetError } = await authClient.requestPasswordReset({
                email,
                redirectTo: "/reset-password",
            });

            if (resetError) {
                setError(resetError.message || "Erro ao solicitar redefinição");
            } else {
                setSuccess(true);
            }
        } catch (err: unknown) {
            console.error(err);
            setError("Ocorreu um erro inesperado. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-950 overflow-hidden font-sans text-foreground">
            {/* --- Left Hero Section --- */}
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
                            Recupere o <br />
                            <span className="text-primary italic">Acesso</span> <br />
                            à sua conta.
                        </h2>
                        <p className="text-lg text-slate-300 font-normal leading-relaxed max-w-md">
                            Não se preocupe, acontece com os melhores. Digite seu e-mail e enviaremos um link de recuperação.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* --- Right Form Section --- */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 relative min-h-screen overflow-hidden">
                {/* Nebula Effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-[20%] -right-[10%] w-[80%] h-[70%] bg-cyan-500/10 rounded-full blur-[120px] dark:bg-cyan-500/5 rotate-12"
                    />
                    <motion.div
                        animate={{ x: [0, -70, 0], y: [0, 100, 0] }}
                        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[10%] -left-[20%] w-[90%] h-[80%] bg-blue-600/10 rounded-full blur-[140px] dark:bg-blue-600/5 -rotate-12"
                    />
                </div>

                {/* Top Controls */}
                <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-50">
                    <Link href="/login" className="flex items-center space-x-2 p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all group">
                        <ArrowLeft className="h-4 w-4 text-slate-500 group-hover:text-primary transition-colors" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-primary">Voltar ao Login</span>
                    </Link>
                    <ThemeToggle />
                </div>

                <div className="flex-1 flex flex-col items-center max-w-[420px] mx-auto w-full px-6 relative z-10 pt-12">
                    <div className="flex-1" />

                    <AnimatePresence mode="wait">
                        {!success ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="w-full"
                            >
                                <div className="w-full text-left mb-10">
                                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                        Esqueceu a senha?
                                    </h1>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                        Insira seu e-mail abaixo para receber um link de redefinição.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="w-full space-y-6">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">E-mail</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="seu@email.com"
                                                type="email"
                                                className={cn("h-11 pl-10 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:ring-primary/20 transition-all font-medium text-slate-900 dark:text-white", emailError && "border-red-500 focus:ring-red-500/20")}
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                        {emailError && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{emailError}</p>}
                                    </div>

                                    {error && (
                                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium">
                                            {error}
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Enviando...
                                            </>
                                        ) : (
                                            "Enviar link de recuperação"
                                        )}
                                    </Button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full text-center space-y-6"
                            >
                                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="h-8 w-8 text-primary" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">E-mail enviado!</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                                        Se uma conta existir com o e-mail <strong>{email}</strong>, você receberá instruções para redefinir sua senha em instantes.
                                    </p>
                                </div>
                                <div className="pt-4">
                                    <Button
                                        variant="outline"
                                        className="w-full h-11 rounded-xl border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-white/10"
                                        asChild
                                    >
                                        <Link href="/login">Voltar ao Login</Link>
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex-1" />

                    <div className="pb-8 text-center">
                        <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                            Copyright © 2026 CAPITAFIN. Todos os direitos reservados.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
