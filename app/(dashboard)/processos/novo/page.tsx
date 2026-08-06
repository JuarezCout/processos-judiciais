import { ProcessoForm } from "@/components/processos/ProcessoForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function NovoProcessoPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800">Novo Processo</h1>
      <ProcessoForm />
    </div>
  );
}
