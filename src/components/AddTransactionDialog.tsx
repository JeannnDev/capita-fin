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
import { Plus, Sparkles, Receipt, Type, AlertCircle, Wallet } from "lucide-react";
import Link from "next/link";
import { useFinance } from "@/lib/finance-context";
import { cn } from "@/lib/utils";

interface AddTransactionDialogProps {
    isGuest?: boolean;
    children?: React.ReactNode;
}

export function AddTransactionDialog({ isGuest, children }: AddTransactionDialogProps) {
    const { accounts, categories, addTransaction } = useFinance();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        if (isGuest) return;
        setLoading(true);

        const categoryId = formData.get("categoryId") as string;
        const accountId = formData.get("accountId") as string;
        const valor = parseFloat(formData.get("valor") as string);
        const descricao = formData.get("descricao") as string;

        if (!categoryId || !accountId || isNaN(valor)) {
            setLoading(false);
            return;
        }

        try {
            await addTransaction({
                id: crypto.randomUUID(),
                description: descricao,
                amount: valor,
                type: "expense",
                category: categories.find(c => c.id === categoryId)?.name || "Geral",
                accountId: accountId,
                date: new Date().toISOString().split('T')[0],
                isPaid: true
            });
            setOpen(false);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const hasNoAccounts = accounts.length === 0;

    if (isGuest) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {children || (
                        <Button variant="default" className="rounded-[1.5rem] h-14 px-8 shadow-2xl shadow-orange-500/40 hover:shadow-orange-500/60 transition-all hover:scale-105 active:scale-95 bg-orange-600 text-white font-black uppercase tracking-widest text-xs">
                            <Plus className="mr-2 h-5 w-5" /> Registrar Gasto
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[440px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-background">
                    <div className="h-2 bg-orange-500 w-full" />
                    <div className="p-10 space-y-8">
                        <DialogHeader className="items-center text-center space-y-6">
                            <div className="w-24 h-24 rounded-[2rem] bg-orange-500/10 flex items-center justify-center rotate-12 animate-pulse">
                                <Sparkles className="h-10 w-10 text-orange-500" />
                            </div>
                            <div className="space-y-2">
                                <DialogTitle className="text-4xl font-black tracking-tighter text-orange-600">Quase lá!</DialogTitle>
                                <DialogDescription className="text-lg font-medium leading-relaxed opacity-70">
                                    Para salvar seus gastos e ter um controle real, você precisa criar uma conta gratuita.
                                </DialogDescription>
                            </div>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 pt-4">
                            <Button asChild className="h-16 rounded-3xl font-black text-xl shadow-xl shadow-orange-500/20 bg-orange-600 hover:bg-orange-700 transition-all hover:scale-[1.02] active:scale-[0.98] text-white">
                                <Link href="/login">Criar Minha Conta</Link>
                            </Button>
                            <Button variant="ghost" onClick={() => setOpen(false)} className="h-14 rounded-2xl font-black text-muted-foreground uppercase tracking-widest text-[10px] hover:text-orange-500 transition-colors">
                                Continuar explorando
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (hasNoAccounts) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {children || (
                        <Button variant="default" className="rounded-[1.5rem] h-14 px-8 shadow-2xl shadow-orange-500/40 hover:shadow-orange-500/60 transition-all hover:scale-105 active:scale-95 bg-orange-600 text-white font-black uppercase tracking-widest text-xs">
                            <Plus className="mr-2 h-5 w-5" /> Registrar Gasto
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[440px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-background">
                    <div className="h-2 bg-red-500 w-full" />
                    <div className="p-10 space-y-8">
                        <DialogHeader className="items-center text-center space-y-6">
                            <div className="w-24 h-24 rounded-[2rem] bg-red-500/10 flex items-center justify-center rotate-12">
                                <Wallet className="h-10 w-10 text-red-500" />
                            </div>
                            <div className="space-y-2">
                                <DialogTitle className="text-4xl font-black tracking-tighter text-red-600">Ops!</DialogTitle>
                                <DialogDescription className="text-lg font-medium leading-relaxed opacity-70">
                                    Você precisa cadastrar pelo menos uma **conta ou banco** antes de registrar uma transação.
                                </DialogDescription>
                            </div>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 pt-4">
                            <Button asChild className="h-16 rounded-3xl font-black text-xl shadow-xl shadow-red-500/20 bg-red-600 hover:bg-red-700 transition-all hover:scale-[1.02] active:scale-[0.98] text-white">
                                <Link href="/contas">Cadastrar Minha Primeira Conta</Link>
                            </Button>
                            <Button variant="ghost" onClick={() => setOpen(false)} className="h-14 rounded-2xl font-black text-muted-foreground uppercase tracking-widest text-[10px] hover:text-red-500 transition-colors">
                                Agora não
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
                    <Button variant="default" className="rounded-[1.5rem] h-14 px-8 shadow-2xl shadow-orange-500/40 hover:shadow-orange-500/60 transition-all hover:scale-105 active:scale-95 bg-orange-600 text-white font-black uppercase tracking-widest text-xs">
                        <Plus className="mr-2 h-5 w-5" /> Registrar Gasto
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden bg-background">
                <div className="p-1 w-full bg-gradient-to-r from-orange-400 via-orange-600 to-orange-400" />
                <div className="p-10">
                    <DialogHeader className="mb-8">
                        <div className="flex items-center space-x-4 mb-2">
                            <div className="h-10 w-10 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                                <Receipt className="h-5 w-5 text-orange-600" />
                            </div>
                            <DialogTitle className="text-3xl font-black tracking-tighter text-orange-600">Novo Gasto</DialogTitle>
                        </div>
                        <DialogDescription className="text-base font-medium opacity-60">
                            Registre uma saída de uma de suas contas.
                        </DialogDescription>
                    </DialogHeader>
                    <form action={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            {/* Amount Input */}
                            <div className="space-y-2">
                                <Label htmlFor="valor" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Valor do Gasto</Label>
                                <div className="relative group">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-muted-foreground group-focus-within:text-orange-500 transition-colors">R$</span>
                                    <Input
                                        id="valor"
                                        name="valor"
                                        type="number"
                                        step="0.01"
                                        placeholder="0,00"
                                        className="h-20 pl-20 pr-8 text-4xl font-black bg-muted/30 border-none rounded-[2rem] focus-visible:ring-orange-500/20 focus-visible:bg-white dark:focus-visible:bg-card/50 transition-all placeholder:text-muted-foreground/30"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {/* Account Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="accountId" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Conta de Origem</Label>
                                    <Select name="accountId" required>
                                        <SelectTrigger className="h-14 rounded-2xl border-none bg-muted/30 font-bold px-6 focus:ring-orange-500/20">
                                            <SelectValue placeholder="Selecione a conta" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-background/95 backdrop-blur-xl">
                                            {accounts.map((acc) => (
                                                <SelectItem key={acc.id} value={acc.id} className="rounded-xl font-bold py-3 px-4 focus:bg-orange-600 focus:text-white transition-colors cursor-pointer mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: acc.color }} />
                                                        {acc.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Category Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="categoryId" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Categoria</Label>
                                    <Select name="categoryId" required>
                                        <SelectTrigger className="h-14 rounded-2xl border-none bg-muted/30 font-bold px-6 focus:ring-orange-500/20">
                                            <SelectValue placeholder="Onde foi?" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-background/95 backdrop-blur-xl">
                                            {categories.map((c) => (
                                                <SelectItem key={c.id} value={c.id} className="rounded-xl font-bold py-3 px-4 focus:bg-orange-600 focus:text-white transition-colors cursor-pointer mb-1">
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="descricao" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Descrição</Label>
                                    <div className="relative">
                                        <Type className="absolute left-5 top-5 h-4 w-4 text-muted-foreground" />
                                        <Input id="descricao" name="descricao" placeholder="Ex: Mercado" className="h-14 pl-12 rounded-2xl border-none bg-muted/30 font-bold focus-visible:ring-orange-500/20" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="sm:justify-start pt-4">
                            <Button
                                type="submit"
                                className="w-full h-18 rounded-[2rem] font-black text-xl shadow-2xl shadow-orange-500/20 bg-orange-600 hover:bg-orange-700 transition-all hover:scale-[1.02] active:scale-[0.98] text-white"
                                disabled={loading}
                            >
                                {loading ? "Processando..." : "Confirmar Gasto"}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
