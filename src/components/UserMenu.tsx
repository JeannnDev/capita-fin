"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "./ui/dropdown-menu";

export function UserMenu() {
    const router = useRouter();
    const { data: session } = authClient.useSession();
    const user = session?.user;

    // Get initials from name
    const initials = user?.name
        ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
        : "?";

    const handleSignOut = async () => {
        await authClient.signOut();
        router.push("/login");
        router.refresh();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center overflow-hidden"
                >
                    <span className="text-sm font-black text-primary">{initials}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 rounded-3xl border-none shadow-2xl p-2 bg-background/95 backdrop-blur-xl animate-in zoom-in-95 duration-200">
                <DropdownMenuLabel className="px-3 pt-4 pb-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Minha Conta</p>
                    <p className="text-lg font-black tracking-tight mt-1 truncate">{user?.name ?? "Usuário"}</p>
                    <p className="text-[10px] text-muted-foreground font-medium truncate mt-0.5">{user?.email ?? ""}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-2 bg-muted/50" />
                <DropdownMenuItem className="rounded-2xl py-3 px-3 font-bold cursor-pointer focus:bg-primary/5 focus:text-primary space-x-3 transition-colors">
                    <Settings2 size={18} />
                    <span className="text-sm">Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleSignOut}
                    className="rounded-2xl py-3 px-3 font-bold cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive space-x-3 transition-colors mt-1"
                >
                    <LogOut size={18} />
                    <span className="text-sm">Encerrar Sessão</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
