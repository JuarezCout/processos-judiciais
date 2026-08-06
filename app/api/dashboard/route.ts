import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const [
    totalProcessos,
    processosPorSituacao,
    processosPorTribunal,
    ultimosAndamentos,
  ] = await Promise.all([ // processosPorTribunal reused as processosPorAssunto below
    prisma.processo.count(),
    prisma.processo.groupBy({ by: ["situacao"], _count: true }),
    prisma.processo.groupBy({ by: ["assunto"], _count: true, orderBy: { _count: { assunto: "desc" } }, take: 5 }),
    prisma.historicoProcessual.findMany({
      take: 10,
      orderBy: { dataMovimentacao: "desc" },
      include: {
        processo: { select: { numero: true, tipoProcedimento: true } },
        usuario: { select: { name: true } },
      },
    }),
  ]);

  return NextResponse.json({
    totalProcessos,
    processosPorSituacao,
    processosPorAssunto: processosPorTribunal,
    ultimosAndamentos,
  });
}
