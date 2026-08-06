import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

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
  IMOBILIÁRIO: "bg-purple-100 text-purple-800",
  TRIBUTÁRIO: "bg-amber-100 text-amber-800",
  CONSUMIDOR: "bg-sky-100 text-sky-800",
};

interface SearchParams {
  q?: string;
  situacao?: string;
  assunto?: string;
  page?: string;
}

export default async function ProcessosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const sp = await searchParams;
  const q = sp.q ?? "";
  const situacao = sp.situacao ?? "";
  const assunto = sp.assunto ?? "";
  const page = parseInt(sp.page ?? "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = {
    AND: [
      q
        ? {
            OR: [
              { numero: { contains: q, mode: "insensitive" as const } },
              {
                tipoProcedimento: { contains: q, mode: "insensitive" as const },
              },
              { responsavel: { contains: q, mode: "insensitive" as const } },
              { assunto: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {},
      situacao && situacao !== "all" ? { situacao } : {},
      assunto && assunto !== "all" ? { assunto } : {},
    ],
  };

  const [processos, total] = await Promise.all([
    prisma.processo.findMany({
      where,
      skip,
      take: limit,
      orderBy: { dataCadastro: "desc" },
    }),
    prisma.processo.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">
          Processos Judiciais
        </h1>
        <Link href="/processos/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Processo
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <form method="GET" className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Pesquisar por número, procedimento, responsável..."
            className="pl-9"
          />
        </div>
        <Select name="assunto" defaultValue={assunto || "all"}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos os assuntos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os assuntos</SelectItem>
            <SelectItem value="IMOBILIÁRIO">Imobiliário</SelectItem>
            <SelectItem value="TRIBUTÁRIO">Tributário</SelectItem>
            <SelectItem value="CONSUMIDOR">Consumidor</SelectItem>
          </SelectContent>
        </Select>
        <Select name="situacao" defaultValue={situacao || "all"}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todas as situações" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as situações</SelectItem>
            <SelectItem value="em_andamento">Em andamento</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" variant="secondary">
          <Search className="h-4 w-4 mr-2" />
          Pesquisar
        </Button>
      </form>

      {/* Tabela */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Assunto</TableHead>
              <TableHead>Procedimento</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Vara</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead>Atualização</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processos.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-slate-400 py-10"
                >
                  Nenhum processo encontrado.
                </TableCell>
              </TableRow>
            )}
            {processos.map((p) => (
              <TableRow key={p.id} className="hover:bg-slate-50">
                <TableCell className="font-mono text-xs font-medium max-w-[160px] truncate">
                  {p.numero ?? "ADM"}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${ASSUNTO_STYLES[p.assunto] ?? "bg-slate-100 text-slate-700"}`}
                  >
                    {p.assunto}
                  </span>
                </TableCell>
                <TableCell className="text-sm max-w-[200px] truncate">
                  {p.tipoProcedimento}
                </TableCell>
                <TableCell className="text-sm">{p.responsavel}</TableCell>
                <TableCell className="text-sm max-w-[120px] truncate">
                  {p.vara ?? "—"}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${SITUACAO_STYLES[p.situacao] ?? "bg-slate-100 text-slate-700"}`}
                  >
                    {SITUACAO_LABELS[p.situacao] ?? p.situacao}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {p.atualizacao
                    ? format(new Date(p.atualizacao), "dd/MM/yyyy", {
                        locale: ptBR,
                      })
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/processos/${p.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>{total} processos encontrados</span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`?q=${q}&situacao=${situacao}&assunto=${assunto}&page=${page - 1}`}
              >
                <Button variant="outline" size="sm">
                  Anterior
                </Button>
              </Link>
            )}
            <span className="px-3 py-1.5">
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`?q=${q}&situacao=${situacao}&assunto=${assunto}&page=${page + 1}`}
              >
                <Button variant="outline" size="sm">
                  Próxima
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
