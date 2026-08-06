import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const processoSchema = z.object({
  numero: z.string().optional().nullable(),
  assunto: z.string().min(1),
  tipoProcedimento: z.string().min(1),
  protocolo: z.string().optional().nullable(),
  vara: z.string().optional().nullable(),
  sistema: z.string().optional().nullable(),
  responsavel: z.string().min(1),
  statusDescricao: z.string().optional().nullable(),
  situacao: z.string().default("em_andamento"),
  atualizacao: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const situacao = searchParams.get("situacao") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
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
      situacao ? { situacao } : {},
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

  return NextResponse.json({ processos, total, page, limit });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = processoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const processo = await prisma.processo.create({
    data: {
      ...parsed.data,
      protocolo: parsed.data.protocolo ? new Date(parsed.data.protocolo) : null,
      atualizacao: parsed.data.atualizacao
        ? new Date(parsed.data.atualizacao)
        : null,
      historico: {
        create: {
          tipoMovimentacao: "Cadastro",
          descricao: "Processo cadastrado no sistema.",
          userId: session.user?.id ?? null,
        },
      },
    },
  });

  return NextResponse.json(processo, { status: 201 });
}
