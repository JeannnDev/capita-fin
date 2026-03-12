"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Mail,
    Lock,
    User,
    ArrowLeft,
    Eye,
    EyeOff,
    Chrome,
    Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

const signupSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export default function LoginPage() {
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const router = useRouter();

    const switchMode = (newMode: "login" | "signup") => {
        setMode(newMode);
        setErrors({});
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const validation = loginSchema.safeParse({ email, password });
        if (!validation.success) {
            const formattedErrors: Record<string, string> = {};
            const fieldErrors = validation.error.flatten().fieldErrors;
            
            Object.entries(fieldErrors).forEach(([key, messages]) => {
                if (messages && messages.length > 0) {
                    formattedErrors[key] = messages[0];
                }
            });
            
            setErrors(formattedErrors);
            return;
        }

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
        setErrors({});

        const validation = signupSchema.safeParse({ name, email, password });
        if (!validation.success) {
            const formattedErrors: Record<string, string> = {};
            const fieldErrors = validation.error.flatten().fieldErrors;

            Object.entries(fieldErrors).forEach(([key, messages]) => {
                if (messages && messages.length > 0) {
                    formattedErrors[key] = messages[0];
                }
            });

            setErrors(formattedErrors);
            return;
        }

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

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        try {
            await authClient.signIn.social({
                provider: "google",
                callbackURL: "/",
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-950 overflow-hidden font-sans text-foreground">
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
                                                className={cn("h-11 pl-10 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:ring-primary/20 transition-all text-slate-900 dark:text-white", errors.name && "border-red-500 focus:ring-red-500/20")}
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </div>
                                        {errors.name && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.name}</p>}
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">E-mail</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="seu@email.com"
                                            type="email"
                                            className={cn("h-11 pl-10 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:ring-primary/20 transition-all font-medium text-slate-900 dark:text-white", errors.email && "border-red-500 focus:ring-red-500/20")}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    {errors.email && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.email}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Senha</Label>
                                        {mode === "login" && (
                                            <Link href="/forgot-password" className="text-xs font-semibold text-primary/80 hover:text-primary transition-colors">
                                                Esqueceu a senha?
                                            </Link>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="••••••••"
                                            type={showPassword ? "text" : "password"}
                                            className={cn("h-11 pl-10 pr-10 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:ring-primary/20 transition-all text-slate-900 dark:text-white", errors.password && "border-red-500 focus:ring-red-500/20")}
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
                                    {errors.password && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.password}</p>}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                        >
                            {loading ? "Processando..." : (mode === "login" ? "Entrar" : "Criar")}
                        </Button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-100 dark:border-white/5" />
                            </div>
                            <div className="relative flex justify-center uppercase">
                                <span className="dark:bg-slate-950 px-4 text-[10px] font-bold text-slate-400 tracking-wider">OU CONTINUE COM</span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isGoogleLoading || loading}
                            className="w-full bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border-gray-200 dark:border-white/10 text-gray-700 dark:text-white cursor-pointer transition-all flex items-center justify-center space-x-3 h-11 rounded-xl"
                        >
                            {isGoogleLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                                    <span>Acessando...</span>
                                </>
                            ) : (
                                <>
                                    <svg
                                        viewBox="-3 0 262 262"
                                        xmlns="http://www.w3.org/2000/svg"
                                        preserveAspectRatio="xMidYMid"
                                        className="h-4 w-4"
                                    >
                                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                        <g id="SVGRepo_iconCarrier">
                                            <path
                                                d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                                                fill="#4285F4"
                                            ></path>
                                            <path
                                                d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                                                fill="#34A853"
                                            ></path>
                                            <path
                                                d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                                                fill="#FBBC05"
                                            ></path>
                                            <path
                                                d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                                                fill="#EB4335"
                                            ></path>
                                        </g>
                                    </svg>
                                    <span>Entrar com Google</span>
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm">
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            {mode === "login" ? "Ainda não tem uma conta?" : "Já possui acesso?"}
                            <button
                                onClick={() => switchMode(mode === "login" ? "signup" : "login")}
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
        </div>
    );
}
