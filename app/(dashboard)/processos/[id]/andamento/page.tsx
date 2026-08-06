import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { AndamentoForm } from "@/components/processos/AndamentoForm";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AndamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const processo = await prisma.processo.findUnique({
    where: { id },
    select: { id: true, numero: true, tipoProcedimento: true },
  });
  if (!processo) notFound();

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <Link
          href={`/processos/${id}`}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar ao processo
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">
          Registrar Andamento
        </h1>
        <p className="text-slate-500 font-mono text-sm">
          {processo.numero ?? "ADM"} — {processo.tipoProcedimento}
        </p>
      </div>
      <AndamentoForm processoId={processo.id} />
    </div>
  );
}
