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
import { Settings, Wallet, Zap, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useFinance } from "@/lib/finance-context";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface SetIncomeDialogProps {
    isGuest?: boolean;
    children?: React.ReactNode;
}

export function SetIncomeDialog({ isGuest, children }: SetIncomeDialogProps) {
    const { accounts, addTransaction } = useFinance();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tipo, setTipo] = useState("Salário");

    async function handleSubmit(formData: FormData) {
        if (isGuest) return;
        setLoading(true);
        const valor = parseFloat(formData.get("valor") as string);
        const accountId = formData.get("accountId") as string;
        
        if (isNaN(valor) || !accountId) {
            setLoading(false);
            return;
        }

        try {
            await addTransaction({
                id: crypto.randomUUID(),
                description: tipo,
                amount: valor,
                type: "income",
                category: "Renda",
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
                        <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-muted/30 border border-muted hover:bg-muted/50 transition-all hover:scale-105 active:scale-95 group">
                            <Settings className="h-6 w-6 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[440px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-background">
                    <div className="h-2 bg-orange-500 w-full" />
                    <div className="p-10 space-y-8">
                        <DialogHeader className="items-center text-center space-y-6">
                            <div className="w-24 h-24 rounded-[2rem] bg-orange-500/10 flex items-center justify-center -rotate-6 animate-pulse">
                                <Zap className="h-10 w-10 text-orange-500" />
                            </div>
                            <div className="space-y-2">
                                <DialogTitle className="text-4xl font-black tracking-tighter text-orange-600">Sua Renda Real</DialogTitle>
                                <DialogDescription className="text-lg font-medium leading-relaxed opacity-70">
                                    Para definir seus ganhos e calcular limites personalizados, você precisa estar logado.
                                </DialogDescription>
                            </div>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 pt-4">
                            <Button asChild className="h-16 rounded-3xl font-black text-xl shadow-xl shadow-orange-500/20 bg-orange-600 hover:bg-orange-700 transition-all hover:scale-[1.02] active:scale-[0.98] text-white">
                                <Link href="/login">Fazer Login Agora</Link>
                            </Button>
                            <Button variant="ghost" onClick={() => setOpen(false)} className="h-14 rounded-2xl font-black text-muted-foreground uppercase tracking-widest text-[10px] hover:text-orange-500 transition-colors">
                                Voltar ao Demo
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
                        <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-muted/30 border border-muted hover:bg-muted/50 transition-all hover:scale-105 active:scale-95 group">
                            <Settings className="h-6 w-6 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[440px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-background">
                    <div className="h-2 bg-red-500 w-full" />
                    <div className="p-10 space-y-8">
                        <DialogHeader className="items-center text-center space-y-6">
                            <div className="w-24 h-24 rounded-[2rem] bg-red-500/10 flex items-center justify-center rotate-12">
                                <AlertCircle className="h-10 w-10 text-red-500" />
                            </div>
                            <div className="space-y-2">
                                <DialogTitle className="text-4xl font-black tracking-tighter text-red-600">Ops!</DialogTitle>
                                <DialogDescription className="text-lg font-medium leading-relaxed opacity-70">
                                    Você precisa cadastrar uma **conta ou banco** para depositar sua renda.
                                </DialogDescription>
                            </div>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 pt-4">
                            <Button asChild className="h-16 rounded-3xl font-black text-xl shadow-xl shadow-red-500/20 bg-red-600 hover:bg-red-700 transition-all hover:scale-[1.02] active:scale-[0.98] text-white">
                                <Link href="/contas">Cadastrar Conta</Link>
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
                    <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-muted/30 border border-muted hover:bg-muted/50 transition-all hover:scale-105 active:scale-95 group">
                        <Settings className="h-6 w-6 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden bg-background">
                <div className="p-1 w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500" />
                <div className="p-10">
                    <DialogHeader className="mb-8">
                        <div className="flex items-center space-x-4 mb-2">
                            <div className="h-10 w-10 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                                <Wallet className="h-5 w-5 text-orange-600" />
                            </div>
                            <DialogTitle className="text-3xl font-black tracking-tighter text-orange-600">Configurar Renda</DialogTitle>
                        </div>
                        <DialogDescription className="text-base font-medium opacity-60">
                            Defina seus ganhos mensais e escolha onde o dinheiro será depositado.
                        </DialogDescription>
                    </DialogHeader>
                    <form action={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="accountId" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Conta de Destino</Label>
                                <Select name="accountId" required>
                                    <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none focus:ring-orange-500/20 font-bold text-lg">
                                        <SelectValue placeholder="Onde cai o dinheiro?" />
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

                            <div className="space-y-2">
                                <Label htmlFor="tipo" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tipo de Renda</Label>
                                <Select value={tipo} onValueChange={setTipo}>
                                    <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none focus:ring-orange-500/20 font-bold text-lg">
                                        <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                                        <SelectItem value="Salário" className="rounded-xl font-bold">Salário</SelectItem>
                                        <SelectItem value="Pró-labore" className="rounded-xl font-bold">Pró-labore</SelectItem>
                                        <SelectItem value="Bônus" className="rounded-xl font-bold">Bônus</SelectItem>
                                        <SelectItem value="Investimento" className="rounded-xl font-bold">Investimento</SelectItem>
                                        <SelectItem value="Freelance" className="rounded-xl font-bold">Freelance</SelectItem>
                                        <SelectItem value="Outros" className="rounded-xl font-bold">Outros</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Label htmlFor="valor" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Valor</Label>
                            <div className="relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-muted-foreground group-focus-within:text-orange-500 transition-colors">R$</div>
                                <Input
                                    id="valor"
                                    name="valor"
                                    type="number"
                                    step="0.01"
                                    placeholder="0,00"
                                    className="h-24 pl-20 pr-8 text-5xl font-black border-none rounded-[2rem] bg-muted/30 focus-visible:ring-orange-500/10 focus-visible:bg-white transition-all placeholder:text-muted-foreground/20"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="submit" className="w-full h-18 rounded-[2rem] font-black text-xl shadow-2xl shadow-orange-500/20 bg-orange-600 hover:bg-orange-700 transition-all hover:scale-[1.02] active:scale-[0.98] text-white" disabled={loading}>
                                {loading ? "Processando..." : "Salvar Renda"}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
