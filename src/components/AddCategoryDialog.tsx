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
import { Plus, LayoutGrid, Percent, Sparkles } from "lucide-react";
import { addCategory } from "@/actions/finance";
import { motion, AnimatePresence } from "framer-motion";

interface AddCategoryDialogProps {
    onSuccess?: () => void;
}

export function AddCategoryDialog({ onSuccess }: AddCategoryDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const nome = formData.get("nome") as string;
        const percentual = parseInt(formData.get("percentual") as string);

        if (!nome || isNaN(percentual)) {
            setLoading(false);
            return;
        }

        try {
            await addCategory(nome, percentual);
            setOpen(false);
            window.location.reload();
            onSuccess?.();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="h-12 md:h-14 px-6 rounded-2xl border-dashed border-2 border-slate-200 dark:border-slate-800 bg-transparent font-bold text-xs hover:bg-primary/5 hover:border-primary/50 transition-all flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Nova Categoria</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px] rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden bg-background">
                <div className="p-1 w-full bg-gradient-to-r from-orange-400 via-orange-600 to-orange-400" />
                <div className="p-10">
                    <DialogHeader className="mb-8">
                        <div className="flex items-center space-x-4 mb-2">
                            <div className="h-10 w-10 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                                <LayoutGrid className="h-5 w-5 text-orange-600" />
                            </div>
                            <DialogTitle className="text-3xl font-black tracking-tighter text-orange-600">Criar Categoria</DialogTitle>
                        </div>
                        <DialogDescription className="text-base font-medium opacity-60">
                            Adicione um novo eixo de gasto ao seu planejamento.
                        </DialogDescription>
                    </DialogHeader>
                    <form action={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="nome" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nome da Categoria</Label>
                                <div className="relative group">
                                    <Input
                                        id="nome"
                                        name="nome"
                                        placeholder="Ex: Assinaturas"
                                        className="h-14 pl-6 rounded-2xl border-none bg-muted/30 font-bold focus-visible:ring-orange-500/20 transition-all font-black"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="percentual" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Peso Visual (%)</Label>
                                <div className="relative group">
                                    <Percent className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-orange-500 transition-colors" />
                                    <Input
                                        id="percentual"
                                        name="percentual"
                                        type="number"
                                        placeholder="0"
                                        className="h-14 pl-6 pr-14 rounded-2xl border-none bg-muted/30 font-bold focus-visible:ring-orange-500/20 transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="submit" className="w-full h-18 rounded-[2rem] font-black text-xl shadow-2xl shadow-orange-500/20 bg-orange-600 hover:bg-orange-700 transition-all hover:scale-[1.02] active:scale-[0.98] text-white" disabled={loading}>
                                {loading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="h-2 w-2 bg-white rounded-full animate-bounce" />
                                    </div>
                                ) : "Salvar Categoria"}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
