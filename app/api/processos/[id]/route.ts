import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  numero: z.string().optional().nullable(),
  assunto: z.string().optional(),
  tipoProcedimento: z.string().optional(),
  protocolo: z.string().optional().nullable(),
  vara: z.string().optional().nullable(),
  sistema: z.string().optional().nullable(),
  responsavel: z.string().optional(),
  statusDescricao: z.string().optional().nullable(),
  situacao: z.string().optional(),
  atualizacao: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

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

  if (!processo)
    return NextResponse.json(
      { error: "Processo não encontrado" },
      { status: 404 },
    );
  return NextResponse.json(processo);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.processo.findUnique({ where: { id } });
  if (!existing)
    return NextResponse.json(
      { error: "Processo não encontrado" },
      { status: 404 },
    );

  const changes: string[] = [];
  const data = parsed.data;
  if (data.situacao && data.situacao !== existing.situacao)
    changes.push(
      `Situação alterada de "${existing.situacao}" para "${data.situacao}"`,
    );
  if (data.vara && data.vara !== existing.vara)
    changes.push(`Vara alterada de "${existing.vara}" para "${data.vara}"`);
  if (data.responsavel && data.responsavel !== existing.responsavel)
    changes.push(`Responsável alterado para "${data.responsavel}"`);

  const processo = await prisma.processo.update({
    where: { id },
    data: {
      ...data,
      ...(data.protocolo ? { protocolo: new Date(data.protocolo) } : {}),
      ...(data.atualizacao ? { atualizacao: new Date(data.atualizacao) } : {}),
      ...(changes.length > 0
        ? {
            historico: {
              create: {
                tipoMovimentacao: "Atualização",
                descricao: changes.join("; "),
                userId: session.user?.id ?? null,
              },
            },
          }
        : {}),
    },
  });

  return NextResponse.json(processo);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.processo.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
