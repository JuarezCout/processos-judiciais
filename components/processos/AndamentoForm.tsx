"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const TIPOS_MOVIMENTACAO = [
  "Petição Inicial",
  "Despacho",
  "Decisão Interlocutória",
  "Sentença",
  "Acórdão",
  "Contestação",
  "Réplica",
  "Recurso",
  "Contrarrazões",
  "Intimação",
  "Citação",
  "Audiência",
  "Perícia",
  "Laudo Pericial",
  "Embargos",
  "Execução",
  "Penhora",
  "Leilão",
  "Acordo/Conciliação",
  "Arquivamento",
  "Outro",
];

interface AndamentoFormProps {
  processoId: string;
  onSuccess?: () => void;
}

export function AndamentoForm({ processoId, onSuccess }: AndamentoFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    tipoMovimentacao: "",
    descricao: "",
    dataMovimentacao: new Date().toISOString().slice(0, 16),
    documento: "",
  });

  function setField(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await fetch(`/api/processos/${processoId}/andamentos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            documento: form.documento || null,
          }),
        });

        if (!res.ok) {
          toast.error("Erro ao registrar andamento");
          return;
        }

        toast.success("Andamento registrado com sucesso!");
        setForm({
          tipoMovimentacao: "",
          descricao: "",
          dataMovimentacao: new Date().toISOString().slice(0, 16),
          documento: "",
        });
        onSuccess?.();
        router.refresh();
      } catch {
        toast.error("Erro de comunicação com o servidor");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Novo Andamento</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipoMovimentacao">Tipo de Movimentação *</Label>
              <Select
                value={form.tipoMovimentacao}
                onValueChange={(v) => setField("tipoMovimentacao", v ?? "")}
              >
                <SelectTrigger id="tipoMovimentacao">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_MOVIMENTACAO.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataMovimentacao">Data/Hora *</Label>
              <Input
                id="dataMovimentacao"
                type="datetime-local"
                value={form.dataMovimentacao}
                onChange={(e) => setField("dataMovimentacao", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              value={form.descricao}
              onChange={(e) => setField("descricao", e.target.value)}
              placeholder="Descreva o andamento processual..."
              rows={4}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="documento">Documento (URL ou referência)</Label>
            <Input
              id="documento"
              value={form.documento}
              onChange={(e) => setField("documento", e.target.value)}
              placeholder="Ex.: petição_inicial.pdf"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !form.tipoMovimentacao}>
              {isPending ? "Salvando..." : "Registrar Andamento"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
