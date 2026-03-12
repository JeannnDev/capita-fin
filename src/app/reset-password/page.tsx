"use client";

import { useState, useEffect, Suspense } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ArrowLeft, Loader2, CheckCircle2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { z } from "zod";

const resetSchema = z.object({
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres")
        .regex(/[A-Z]/, "Pelo menos uma letra maiúscula")
        .regex(/[a-z]/, "Pelo menos uma letra minúscula")
        .regex(/[0-9]/, "Pelo menos um número"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});

function ResetPasswordForm() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) {
            setError("Token de redefinição ausente ou inválido.");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setValidationErrors({});

        if (!token) {
            setError("Token inválido ou expirado. Solicite um novo link.");
            return;
        }

        const validation = resetSchema.safeParse({ password, confirmPassword });
        if (!validation.success) {
            const formattedErrors: Record<string, string> = {};
            validation.error.issues.forEach(issue => {
                formattedErrors[issue.path[0].toString()] = issue.message;
            });
            setValidationErrors(formattedErrors);
            return;
        }

        setLoading(true);
        try {
            const { error: resetError } = await authClient.resetPassword({
                newPassword: password,
                token: token,
            });

            if (resetError) {
                if (resetError.message?.toLowerCase().includes("token")) {
                    setError("Token inválido ou expirado. Por favor, solicite um novo link de redefinição.");
                } else {
                    setError(resetError.message || "Erro ao redefinir a senha.");
                }
            } else {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/login");
                }, 3000);
            }
        } catch (err: unknown) {
            console.error(err);
            setError("Ocorreu um erro inesperado. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence mode="wait">
            {!success ? (
                <motion.div
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full"
                >
                    <div className="w-full text-left mb-8">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Nova Senha
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Crie uma senha forte para proteger sua conta.
                        </p>
                    </div>

                    {error ? (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium flex items-start space-x-3 mb-6">
                            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                            <div className="space-y-3 flex-1">
                                <p>{error}</p>
                                <Button
                                    variant="outline"
                                    className="h-9 w-full rounded-lg border-red-500/20 text-red-500 hover:bg-red-500/10 text-xs"
                                    asChild
                                >
                                    <Link href="/forgot-password">Solicitar Novo Link</Link>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="w-full space-y-5">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nova Senha</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="••••••••"
                                        type={showPassword ? "text" : "password"}
                                        className={cn("h-11 pl-10 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:ring-primary/20 transition-all font-medium text-slate-900 dark:text-white", validationErrors.password && "border-red-500")}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {validationErrors.password && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{validationErrors.password}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Confirmar Senha</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="••••••••"
                                        type={showPassword ? "text" : "password"}
                                        className={cn("h-11 pl-10 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:ring-primary/20 transition-all font-medium text-slate-900 dark:text-white", validationErrors.confirmPassword && "border-red-500")}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                                {validationErrors.confirmPassword && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{validationErrors.confirmPassword}</p>}
                            </div>

                            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/10">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Requisitos:</p>
                                <ul className="space-y-1.5">
                                    <RequirementItem met={password.length >= 8} text="Mínimo de 8 caracteres" />
                                    <RequirementItem met={/[A-Z]/.test(password)} text="Uma letra maiúscula" />
                                    <RequirementItem met={/[0-9]/.test(password)} text="Pelo menos um número" />
                                </ul>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading || !token}
                                className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Redefinindo...
                                    </>
                                ) : (
                                    "Redefinir Senha"
                                )}
                            </Button>
                        </form>
                    )}
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
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Senha alterada!</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Sua senha foi redefinida com sucesso. Redirecionando para o login...
                        </p>
                    </div>
                    <div className="pt-4">
                        <Button
                            className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm"
                            asChild
                        >
                            <Link href="/login">Ir para o Login Agora</Link>
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
    return (
        <li className="flex items-center space-x-2">
            <div className={cn("h-1 w-1 rounded-full", met ? "bg-primary" : "bg-slate-300 dark:bg-slate-700")} />
            <span className={cn("text-[10px] font-medium", met ? "text-primary italic" : "text-slate-500")}>
                {text}
            </span>
        </li>
    );
}

export default function ResetPasswordPage() {
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
                            Nova <br />
                            <span className="text-primary italic">Segurança.</span> <br />
                            Mesma Liberdade.
                        </h2>
                        <p className="text-lg text-slate-300 font-normal leading-relaxed max-w-md">
                            Estamos quase lá. Escolha uma senha segura para voltar ao controle de suas finanças.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* --- Right Form Section --- */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 relative min-h-screen overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{ x: [0, 50, 0], y: [0, -80, 0] }}
                        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -bottom-[20%] left-[10%] w-[70%] h-[60%] bg-indigo-500/10 rounded-full blur-[110px] dark:bg-indigo-500/5"
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
                    <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary" />}>
                        <ResetPasswordForm />
                    </Suspense>
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
