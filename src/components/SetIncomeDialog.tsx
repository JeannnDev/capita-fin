"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Settings, Sparkles, Wallet, Zap } from "lucide-react";
import { upsertIncome } from "@/actions/finance";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface SetIncomeDialogProps {
    isGuest?: boolean;
    children?: React.ReactNode;
}

export function SetIncomeDialog({ isGuest, children }: SetIncomeDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        if (isGuest) return;
        setLoading(true);
        const valor = parseFloat(formData.get("valor") as string);
        const date = new Date();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        if (isNaN(valor)) {
            setLoading(false);
            return;
        }

        try {
            await upsertIncome(valor, month, year);
            setOpen(false);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    if (isGuest) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {children || (
                        <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-muted/30 border border-muted hover:bg-muted/50 transition-all hover:scale-105 active:scale-95 group">
                            <Settings className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[440px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-background">
                    <div className="h-2 bg-primary w-full" />
                    <div className="p-10 space-y-8">
                        <DialogHeader className="items-center text-center space-y-6">
                            <div className="w-24 h-24 rounded-[2rem] bg-amber-500/10 flex items-center justify-center -rotate-6 animate-pulse">
                                <Zap className="h-10 w-10 text-amber-500" />
                            </div>
                            <div className="space-y-2">
                                <DialogTitle className="text-4xl font-black tracking-tighter">Sua Renda Real</DialogTitle>
                                <DialogDescription className="text-lg font-medium leading-relaxed opacity-70">
                                    Para definir seus ganhos e calcular limites personalizados, você precisa estar logado.
                                </DialogDescription>
                            </div>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 pt-4">
                            <Button asChild className="h-16 rounded-3xl font-black text-xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] text-white">
                                <Link href="/login">Fazer Login Agora</Link>
                            </Button>
                            <Button variant="ghost" onClick={() => setOpen(false)} className="h-14 rounded-2xl font-black text-muted-foreground uppercase tracking-widest text-[10px] hover:text-primary transition-colors">
                                Voltar ao Demo
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-muted/30 border border-muted hover:bg-muted/50 transition-all hover:scale-105 active:scale-95 group">
                        <Settings className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden bg-background">
                <div className="p-1 w-full bg-gradient-to-r from-emerald-500 via-primary to-emerald-500" />
                <div className="p-10">
                    <DialogHeader className="mb-8">
                        <div className="flex items-center space-x-4 mb-2">
                            <div className="h-10 w-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                                <Wallet className="h-5 w-5 text-emerald-600" />
                            </div>
                            <DialogTitle className="text-3xl font-black tracking-tighter text-foreground">Configurar Renda</DialogTitle>
                        </div>
                        <DialogDescription className="text-base font-medium opacity-60">
                            Defina seus ganhos mensais totais para automatizar a regra 50-25-15-10.
                        </DialogDescription>
                    </DialogHeader>
                    <form action={handleSubmit} className="space-y-10">
                        <div className="space-y-4">
                            <Label htmlFor="valor" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Renda Bruta Estimada</Label>
                            <div className="relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-muted-foreground group-focus-within:text-emerald-500 transition-colors">R$</div>
                                <Input
                                    id="valor"
                                    name="valor"
                                    type="number"
                                    step="0.01"
                                    placeholder="0,00"
                                    className="h-24 pl-20 pr-8 text-5xl font-black border-none rounded-[2rem] bg-muted/30 focus-visible:ring-emerald-500/10 focus-visible:bg-white transition-all placeholder:text-muted-foreground/20"
                                    required
                                    autoFocus
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground opacity-60 font-medium italic mt-2 ml-2">
                                * Seus percentuais serão recalculados imediatamente após salvar.
                            </p>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="submit" className="w-full h-18 rounded-[2rem] font-black text-xl shadow-2xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 transition-all hover:scale-[1.02] active:scale-[0.98] text-white" disabled={loading}>
                                {loading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="h-2.5 w-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="h-2.5 w-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="h-2.5 w-2.5 bg-white rounded-full animate-bounce" />
                                    </div>
                                ) : "Atualizar Planejamento"}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
