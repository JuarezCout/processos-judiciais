import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HistoricoList } from "@/components/processos/HistoricoList";
import { DeleteProcessoButton } from "@/components/processos/DeleteProcessoButton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil, Plus, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

const SITUACAO_STYLES: Record<string, string> = {
  em_andamento: "bg-blue-100 text-blue-800",
  concluido: "bg-green-100 text-green-800",
};

const SITUACAO_LABELS: Record<string, string> = {
  em_andamento: "Em andamento",
  concluido: "Concluído",
};

const ASSUNTO_STYLES: Record<string, string> = {
  "IMOBILIÁRIO": "bg-purple-100 text-purple-800",
  "TRIBUTÁRIO": "bg-amber-100 text-amber-800",
  "CONSUMIDOR": "bg-sky-100 text-sky-800",
};

export default async function ProcessoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const processo = await prisma.processo.findUnique({
    where: { id },
    include: {
      historico: {
        include: { usuario: { select: { id: true, name: true, email: true } } },
        orderBy: { dataMovimentacao: "desc" },
      },
    },
  });

  if (!processo) notFound();

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/processos" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-2">
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </Link>
          <h1 className="text-xl font-bold text-slate-800">{processo.tipoProcedimento}</h1>
          <p className="text-slate-500 font-mono text-sm">{processo.numero ?? "ADM"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${ASSUNTO_STYLES[processo.assunto] ?? "bg-slate-100 text-slate-700"}`}>
            {processo.assunto}
          </span>
          <span className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-medium ${SITUACAO_STYLES[processo.situacao] ?? "bg-slate-100 text-slate-700"}`}>
            {SITUACAO_LABELS[processo.situacao] ?? processo.situacao}
          </span>
          <Link href={`/processos/${id}/andamento`}>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Andamento
            </Button>
          </Link>
          <Link href={`/processos/${id}/editar`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </Link>
          <DeleteProcessoButton id={id} numero={processo.numero ?? processo.tipoProcedimento} />
        </div>
      </div>

      {/* Detalhes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dados do Processo</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div>
                <p className="text-slate-400 text-xs">Responsável</p>
                <p className="font-medium">{processo.responsavel}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Vara / Distribuição</p>
                <p className="font-medium">{processo.vara ?? "—"}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Sistema</p>
                <p className="font-medium">{processo.sistema ?? "—"}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Data de Protocolo</p>
                <p className="font-medium">
                  {processo.protocolo
                    ? format(new Date(processo.protocolo), "dd/MM/yyyy", { locale: ptBR })
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Última Atualização</p>
                <p className="font-medium">
                  {processo.atualizacao
                    ? format(new Date(processo.atualizacao), "dd/MM/yyyy", { locale: ptBR })
                    : "—"}
                </p>
              </div>
            </CardContent>
          </Card>

          {processo.statusDescricao && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 whitespace-pre-line">{processo.statusDescricao}</p>
              </CardContent>
            </Card>
          )}

          {processo.observacoes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 whitespace-pre-line">{processo.observacoes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Histórico */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">
              Histórico ({processo.historico.length})
            </h2>
            <Link href={`/processos/${id}/andamento`}>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <HistoricoList historico={processo.historico as Parameters<typeof HistoricoList>[0]["historico"]} />
        </div>
      </div>
    </div>
  );
}
