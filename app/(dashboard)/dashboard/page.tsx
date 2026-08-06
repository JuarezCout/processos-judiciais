import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, CheckCircle, Clock, Archive } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();

  const [total, porSituacao, porAssunto, ultimosAndamentos] = await Promise.all(
    [
      prisma.processo.count(),
      prisma.processo.groupBy({ by: ["situacao"], _count: true }),
      prisma.processo.groupBy({
        by: ["assunto"],
        _count: true,
        orderBy: { _count: { assunto: "desc" } },
        take: 5,
      }),
      prisma.historicoProcessual.findMany({
        take: 8,
        orderBy: { dataMovimentacao: "desc" },
        include: {
          processo: { select: { numero: true, tipoProcedimento: true } },
          usuario: { select: { name: true } },
        },
      }),
    ],
  );

  const ativos =
    porSituacao.find((s) => s.situacao === "em_andamento")?._count ?? 0;
  const concluidos =
    porSituacao.find((s) => s.situacao === "concluido")?._count ?? 0;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">
        Olá, {session?.user?.name?.split(" ")[0]} 👋
      </h1>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total de Processos
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Em Andamento
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{ativos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Concluídos
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{concluidos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total de Assuntos
            </CardTitle>
            <Archive className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">
              {porAssunto.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por assunto */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Processos por Assunto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {porAssunto.map((t) => (
              <div
                key={t.assunto}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-slate-700 truncate max-w-[200px]">
                  {t.assunto}
                </span>
                <Badge variant="secondary">{t._count}</Badge>
              </div>
            ))}
            {porAssunto.length === 0 && (
              <p className="text-sm text-slate-400">
                Nenhum processo cadastrado
              </p>
            )}
          </CardContent>
        </Card>

        {/* Últimos andamentos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Últimas Movimentações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ultimosAndamentos.map((a) => (
              <div
                key={a.id}
                className="border-l-2 border-primary pl-3 space-y-0.5"
              >
                <p className="text-xs text-slate-400">
                  {format(new Date(a.dataMovimentacao), "dd/MM/yyyy HH:mm", {
                    locale: ptBR,
                  })}
                  {" · "}
                  {a.processo.numero ?? a.processo.tipoProcedimento}
                </p>
                <p className="text-sm font-medium text-slate-700">
                  {a.tipoMovimentacao}
                </p>
                <p className="text-xs text-slate-500 line-clamp-1">
                  {a.descricao}
                </p>
              </div>
            ))}
            {ultimosAndamentos.length === 0 && (
              <p className="text-sm text-slate-400">
                Nenhum andamento registrado
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
