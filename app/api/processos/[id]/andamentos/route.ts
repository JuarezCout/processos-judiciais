import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const andamentoSchema = z.object({
  tipoMovimentacao: z.string().min(1),
  descricao: z.string().min(1),
  dataMovimentacao: z.string().optional(),
  documento: z.string().optional().nullable(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const historico = await prisma.historicoProcessual.findMany({
    where: { processoId: id },
    include: { usuario: { select: { id: true, name: true, email: true } } },
    orderBy: { dataMovimentacao: "desc" },
  });

  return NextResponse.json(historico);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = andamentoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const andamento = await prisma.historicoProcessual.create({
    data: {
      processoId: id,
      tipoMovimentacao: parsed.data.tipoMovimentacao,
      descricao: parsed.data.descricao,
      dataMovimentacao: parsed.data.dataMovimentacao
        ? new Date(parsed.data.dataMovimentacao)
        : new Date(),
      documento: parsed.data.documento ?? null,
      userId: session.user?.id ?? null,
    },
    include: { usuario: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(andamento, { status: 201 });
}
