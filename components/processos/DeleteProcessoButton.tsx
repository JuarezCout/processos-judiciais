"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DeleteProcessoButtonProps {
  id: string;
  numero: string;
}

export function DeleteProcessoButton({ id, numero }: DeleteProcessoButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/processos/${id}`, { method: "DELETE" });
        if (!res.ok) {
          toast.error("Erro ao excluir o processo");
          return;
        }
        toast.success("Processo excluído com sucesso");
        setOpen(false);
        router.push("/processos");
        router.refresh();
      } catch {
        toast.error("Erro de comunicação com o servidor");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" size="sm" />}>
        <Trash2 className="h-4 w-4 mr-1" />
        Excluir
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Processo</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o processo <strong>{numero}</strong>? Esta ação não
            pode ser desfeita e todo o histórico será perdido.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
