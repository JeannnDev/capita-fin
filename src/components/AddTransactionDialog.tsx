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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Sparkles, Receipt, Wallet, Type } from "lucide-react";
import { addTransaction, getFinancialSummary } from "@/actions/finance";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";

interface AddTransactionDialogProps {
    categories?: { id: string; nome: string }[];
    isGuest?: boolean;
    children?: React.ReactNode;
}

export function AddTransactionDialog({ categories: initialCategories, isGuest, children }: AddTransactionDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>(initialCategories || []);

    useEffect(() => {
        if (!initialCategories || initialCategories.length === 0) {
            const fetchCats = async () => {
                const data = await getFinancialSummary(new Date().getMonth() + 1, new Date().getFullYear());
                setCategories(data.summary.map((s: any) => ({ id: s.id, nome: s.nome })));
            };
            fetchCats();
        }
    }, [initialCategories]);

    async function handleSubmit(formData: FormData) {
        if (isGuest) return;
        setLoading(true);

        const categoryId = formData.get("categoryId") as string;
        const valor = parseFloat(formData.get("valor") as string);
        const descricao = formData.get("descricao") as string;

        if (!categoryId || isNaN(valor)) {
            setLoading(false);
            return;
        }

        try {
            await addTransaction(categoryId, valor, descricao);
            setOpen(false);
            window.location.reload();
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
                        <Button variant="default" className="rounded-[1.5rem] h-14 px-8 shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all hover:scale-105 active:scale-95 bg-primary text-white font-black uppercase tracking-widest text-xs">
                            <Plus className="mr-2 h-5 w-5" /> Registrar Gasto
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[440px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-background">
                    <div className="h-2 bg-primary w-full" />
                    <div className="p-10 space-y-8">
                        <DialogHeader className="items-center text-center space-y-6">
                            <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center rotate-12 animate-pulse">
                                <Sparkles className="h-10 w-10 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <DialogTitle className="text-4xl font-black tracking-tighter">Quase lá!</DialogTitle>
                                <DialogDescription className="text-lg font-medium leading-relaxed opacity-70">
                                    Para salvar seus gastos e ter um controle real, você precisa criar uma conta gratuita.
                                </DialogDescription>
                            </div>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 pt-4">
                            <Button asChild className="h-16 rounded-3xl font-black text-xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                <Link href="/login">Criar Minha Conta</Link>
                            </Button>
                            <Button variant="ghost" onClick={() => setOpen(false)} className="h-14 rounded-2xl font-black text-muted-foreground uppercase tracking-widest text-[10px] hover:text-primary transition-colors">
                                Continuar explorando
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
                    <Button variant="default" className="rounded-[1.5rem] h-14 px-8 shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all hover:scale-105 active:scale-95 bg-primary text-white font-black uppercase tracking-widest text-xs">
                        <Plus className="mr-2 h-5 w-5" /> Registrar Gasto
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden bg-background">
                <div className="p-1 w-full bg-gradient-to-r from-primary via-purple-400 to-primary" />
                <div className="p-10">
                    <DialogHeader className="mb-8">
                        <div className="flex items-center space-x-4 mb-2">
                            <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                                <Receipt className="h-5 w-5 text-primary" />
                            </div>
                            <DialogTitle className="text-3xl font-black tracking-tighter">Novo Gasto</DialogTitle>
                        </div>
                        <DialogDescription className="text-base font-medium opacity-60">
                            Registre uma saída para calcular seu saldo livre.
                        </DialogDescription>
                    </DialogHeader>
                    <form action={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            {/* Amount Input - Nubank Style big display */}
                            <div className="space-y-2">
                                <Label htmlFor="valor" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Valor do Gasto</Label>
                                <div className="relative group">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-muted-foreground group-focus-within:text-primary transition-colors">R$</span>
                                    <Input
                                        id="valor"
                                        name="valor"
                                        type="number"
                                        step="0.01"
                                        placeholder="0,00"
                                        className="h-20 pl-20 pr-8 text-4xl font-black bg-muted/30 border-none rounded-[2rem] focus-visible:ring-primary/20 focus-visible:bg-white dark:focus-visible:bg-card/50 transition-all placeholder:text-muted-foreground/30"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="categoryId" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Categoria</Label>
                                    <Select name="categoryId" required>
                                        <SelectTrigger className="h-14 rounded-2xl border-none bg-muted/30 font-bold px-6 focus:ring-primary/20">
                                            <SelectValue placeholder="Onde foi?" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-background/95 backdrop-blur-xl">
                                            {categories.map((c) => (
                                                <SelectItem key={c.id} value={c.id} className="rounded-xl font-bold py-3 px-4 focus:bg-primary focus:text-white transition-colors cursor-pointer mb-1">
                                                    {c.nome}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="descricao" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Descrição</Label>
                                    <div className="relative">
                                        <Type className="absolute left-5 top-5 h-4 w-4 text-muted-foreground" />
                                        <Input id="descricao" name="descricao" placeholder="Ex: Mercado" className="h-14 pl-12 rounded-2xl border-none bg-muted/30 font-bold focus-visible:ring-primary/20" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="sm:justify-start pt-4">
                            <Button
                                type="submit"
                                className="w-full h-18 rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] text-white"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="h-2 w-2 bg-white rounded-full animate-bounce" />
                                    </div>
                                ) : "Confirmar Gasto"}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
