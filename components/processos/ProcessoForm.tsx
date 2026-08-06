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

const ASSUNTOS = ["IMOBILIÁRIO", "TRIBUTÁRIO", "CONSUMIDOR", "Outro"];

const SITUACOES = [
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluido", label: "Concluído" },
];

interface ProcessoFormProps {
  initialData?: {
    id: string;
    numero: string | null;
    assunto: string;
    tipoProcedimento: string;
    protocolo: string | null;
    vara: string | null;
    sistema: string | null;
    responsavel: string;
    statusDescricao: string | null;
    situacao: string;
    atualizacao: string | null;
    observacoes: string | null;
  };
}

export function ProcessoForm({ initialData }: ProcessoFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;

  const [form, setForm] = useState({
    numero: initialData?.numero ?? "",
    assunto: initialData?.assunto ?? "",
    tipoProcedimento: initialData?.tipoProcedimento ?? "",
    protocolo: initialData?.protocolo ? initialData.protocolo.slice(0, 10) : "",
    vara: initialData?.vara ?? "",
    sistema: initialData?.sistema ?? "",
    responsavel: initialData?.responsavel ?? "",
    statusDescricao: initialData?.statusDescricao ?? "",
    situacao: initialData?.situacao ?? "em_andamento",
    atualizacao: initialData?.atualizacao
      ? initialData.atualizacao.slice(0, 10)
      : "",
    observacoes: initialData?.observacoes ?? "",
  });

  function setField(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      ...form,
      numero: form.numero || null,
      protocolo: form.protocolo || null,
      vara: form.vara || null,
      sistema: form.sistema || null,
      statusDescricao: form.statusDescricao || null,
      atualizacao: form.atualizacao || null,
      observacoes: form.observacoes || null,
    };

    startTransition(async () => {
      try {
        const url = isEditing
          ? `/api/processos/${initialData!.id}`
          : "/api/processos";
        const method = isEditing ? "PUT" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const err = await res.json();
          toast.error(err.error?.message ?? "Erro ao salvar processo");
          return;
        }

        const saved = await res.json();
        toast.success(
          isEditing ? "Processo atualizado!" : "Processo cadastrado!",
        );
        router.push(`/processos/${saved.id}`);
        router.refresh();
      } catch {
        toast.error("Erro de comunicação com o servidor");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do Processo</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="assunto">Assunto *</Label>
            <Select
              value={form.assunto}
              onValueChange={(v) => setField("assunto", v ?? "")}
            >
              <SelectTrigger id="assunto">
                <SelectValue placeholder="Selecione o assunto" />
              </SelectTrigger>
              <SelectContent>
                {ASSUNTOS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipoProcedimento">Tipo de Procedimento *</Label>
            <Input
              id="tipoProcedimento"
              value={form.tipoProcedimento}
              onChange={(e) => setField("tipoProcedimento", e.target.value)}
              placeholder="Descrição do procedimento"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numero">Número do Processo</Label>
            <Input
              id="numero"
              value={form.numero}
              onChange={(e) => setField("numero", e.target.value)}
              placeholder="0000000-00.0000.0.00.0000 ou ADM"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável *</Label>
            <Input
              id="responsavel"
              value={form.responsavel}
              onChange={(e) => setField("responsavel", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vara">Vara / Distribuição</Label>
            <Input
              id="vara"
              value={form.vara}
              onChange={(e) => setField("vara", e.target.value)}
              placeholder="Ex.: 28ª VARA CÍVEL"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sistema">Sistema</Label>
            <Input
              id="sistema"
              value={form.sistema}
              onChange={(e) => setField("sistema", e.target.value)}
              placeholder="Ex.: PJE TJCE, SEFIN"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="protocolo">Data de Protocolo</Label>
            <Input
              id="protocolo"
              type="date"
              value={form.protocolo}
              onChange={(e) => setField("protocolo", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="atualizacao">Última Atualização</Label>
            <Input
              id="atualizacao"
              type="date"
              value={form.atualizacao}
              onChange={(e) => setField("atualizacao", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status e Observações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="situacao">Situação *</Label>
            <Select
              value={form.situacao}
              onValueChange={(v) => setField("situacao", v ?? "")}
            >
              <SelectTrigger id="situacao">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SITUACOES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="statusDescricao">Descrição do Status</Label>
            <Textarea
              id="statusDescricao"
              value={form.statusDescricao}
              onChange={(e) => setField("statusDescricao", e.target.value)}
              rows={3}
              placeholder="Situação atual detalhada do processo..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={form.observacoes}
              onChange={(e) => setField("observacoes", e.target.value)}
              rows={3}
              placeholder="Informações adicionais..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Salvando..."
            : isEditing
              ? "Salvar Alterações"
              : "Cadastrar Processo"}
        </Button>
      </div>
    </form>
  );
}

const SITUACOES = [
  "Em andamento",
  "Suspenso",
  "Arquivado",
  "Encerrado",
  "Aguardando julgamento",
  "Recurso pendente",
];

const CLASSES = [
  "Ação Civil Ordinária",
  "Ação de Execução",
  "Ação Trabalhista",
  "Habeas Corpus",
  "Mandado de Segurança",
  "Recurso de Apelação",
  "Agravo de Instrumento",
  "Ação Penal",
  "Ação de Divórcio",
  "Inventário",
  "Outra",
];

interface ProcessoFormProps {
  initialData?: {
    id: string;
    numero: string;
    classe: string;
    assunto: string;
    tribunal: string;
    vara: string;
    comarca: string;
    dataDistribuicao: string;
    autor: string;
    reu: string;
    advogado: string;
    valorCausa: number | null;
    situacao: string;
    observacoes: string | null;
  };
}

export function ProcessoForm({ initialData }: ProcessoFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;

  const [form, setForm] = useState({
    numero: initialData?.numero ?? "",
    classe: initialData?.classe ?? "",
    assunto: initialData?.assunto ?? "",
    tribunal: initialData?.tribunal ?? "",
    vara: initialData?.vara ?? "",
    comarca: initialData?.comarca ?? "",
    dataDistribuicao: initialData?.dataDistribuicao
      ? initialData.dataDistribuicao.slice(0, 10)
      : "",
    autor: initialData?.autor ?? "",
    reu: initialData?.reu ?? "",
    advogado: initialData?.advogado ?? "",
    valorCausa: initialData?.valorCausa?.toString() ?? "",
    situacao: initialData?.situacao ?? "Em andamento",
    observacoes: initialData?.observacoes ?? "",
  });

  function setField(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      ...form,
      valorCausa: form.valorCausa ? parseFloat(form.valorCausa) : null,
    };

    startTransition(async () => {
      try {
        const url = isEditing
          ? `/api/processos/${initialData!.id}`
          : "/api/processos";
        const method = isEditing ? "PUT" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const err = await res.json();
          toast.error(err.error?.message ?? "Erro ao salvar processo");
          return;
        }

        const saved = await res.json();
        toast.success(
          isEditing ? "Processo atualizado!" : "Processo cadastrado!",
        );
        router.push(`/processos/${saved.id}`);
        router.refresh();
      } catch {
        toast.error("Erro de comunicação com o servidor");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do Processo</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="numero">Número do Processo *</Label>
            <Input
              id="numero"
              value={form.numero}
              onChange={(e) => setField("numero", e.target.value)}
              placeholder="0000000-00.0000.0.00.0000"
              required
              disabled={isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="classe">Classe Processual *</Label>
            <Select
              value={form.classe}
              onValueChange={(v) => setField("classe", v ?? "")}
            >
              <SelectTrigger id="classe">
                <SelectValue placeholder="Selecione a classe" />
              </SelectTrigger>
              <SelectContent>
                {CLASSES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="assunto">Assunto *</Label>
            <Input
              id="assunto"
              value={form.assunto}
              onChange={(e) => setField("assunto", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tribunal">Tribunal *</Label>
            <Input
              id="tribunal"
              value={form.tribunal}
              onChange={(e) => setField("tribunal", e.target.value)}
              placeholder="Ex.: TJSP, TRF3, TST"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vara">Vara *</Label>
            <Input
              id="vara"
              value={form.vara}
              onChange={(e) => setField("vara", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comarca">Comarca *</Label>
            <Input
              id="comarca"
              value={form.comarca}
              onChange={(e) => setField("comarca", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataDistribuicao">Data de Distribuição *</Label>
            <Input
              id="dataDistribuicao"
              type="date"
              value={form.dataDistribuicao}
              onChange={(e) => setField("dataDistribuicao", e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Partes</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="autor">Autor(es) *</Label>
            <Input
              id="autor"
              value={form.autor}
              onChange={(e) => setField("autor", e.target.value)}
              placeholder="Nomes separados por vírgula"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reu">Réu(s) *</Label>
            <Input
              id="reu"
              value={form.reu}
              onChange={(e) => setField("reu", e.target.value)}
              placeholder="Nomes separados por vírgula"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="advogado">Advogado(s) *</Label>
            <Input
              id="advogado"
              value={form.advogado}
              onChange={(e) => setField("advogado", e.target.value)}
              placeholder="Nomes separados por vírgula"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="valorCausa">Valor da Causa (R$)</Label>
            <Input
              id="valorCausa"
              type="number"
              step="0.01"
              min="0"
              value={form.valorCausa}
              onChange={(e) => setField("valorCausa", e.target.value)}
              placeholder="0,00"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status e Observações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="situacao">Situação *</Label>
            <Select
              value={form.situacao}
              onValueChange={(v) => setField("situacao", v ?? "")}
            >
              <SelectTrigger id="situacao">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SITUACOES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={form.observacoes}
              onChange={(e) => setField("observacoes", e.target.value)}
              rows={4}
              placeholder="Informações adicionais sobre o processo..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Salvando..."
            : isEditing
              ? "Salvar Alterações"
              : "Cadastrar Processo"}
        </Button>
      </div>
    </form>
  );
}
