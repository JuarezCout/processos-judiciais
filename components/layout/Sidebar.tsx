"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Scale,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/processos", label: "Processos", icon: FolderOpen },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export function Sidebar({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col min-h-screen">
      <div className="flex items-center gap-3 px-6 py-5">
        <Scale className="h-7 w-7 text-slate-100" />
        <span className="font-semibold text-sm leading-tight">
          Sistema de
          <br />
          Processos Judiciais
        </span>
      </div>
      <Separator className="bg-slate-700" />
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-primary text-primary-foreground"
                : "text-slate-300 hover:bg-slate-800 hover:text-slate-100",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
        {isAdmin && (
          <Link
            href="/usuarios"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith("/usuarios")
                ? "bg-primary text-primary-foreground"
                : "text-slate-300 hover:bg-slate-800 hover:text-slate-100",
            )}
          >
            <Users className="h-4 w-4" />
            Utilizadores
          </Link>
        )}
      </nav>
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
