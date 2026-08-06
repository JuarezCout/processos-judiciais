import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, User } from "lucide-react";

interface Andamento {
  id: string;
  dataMovimentacao: string | Date;
  tipoMovimentacao: string;
  descricao: string;
  documento: string | null;
  usuario: { name: string | null; email: string } | null;
}

interface HistoricoListProps {
  historico: Andamento[];
}

const TIPO_COLORS: Record<string, string> = {
  "Petição Inicial": "bg-blue-100 text-blue-800",
  "Sentença": "bg-green-100 text-green-800",
  "Despacho": "bg-purple-100 text-purple-800",
  "Decisão Interlocutória": "bg-indigo-100 text-indigo-800",
  "Recurso": "bg-orange-100 text-orange-800",
  "Acórdão": "bg-teal-100 text-teal-800",
  "Acordo/Conciliação": "bg-emerald-100 text-emerald-800",
  "Arquivamento": "bg-slate-100 text-slate-800",
  "Cadastro": "bg-gray-100 text-gray-700",
  "Atualização": "bg-yellow-100 text-yellow-800",
};

export function HistoricoList({ historico }: HistoricoListProps) {
  if (historico.length === 0) {
    return (
      <p className="text-center text-slate-400 py-8">
        Nenhum andamento registrado ainda.
      </p>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
      <div className="space-y-6">
        {historico.map((item) => (
          <div key={item.id} className="relative pl-10">
            <div className="absolute left-3 top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-white" />
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                    TIPO_COLORS[item.tipoMovimentacao] ?? "bg-slate-100 text-slate-700"
                  }`}
                >
                  {item.tipoMovimentacao}
                </span>
                <span className="text-xs text-slate-400">
                  {format(new Date(item.dataMovimentacao), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </span>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-line">{item.descricao}</p>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                {item.usuario && (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <User className="h-3 w-3" />
                    {item.usuario.name ?? item.usuario.email}
                  </span>
                )}
                {item.documento && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <FileText className="h-3 w-3" />
                    {item.documento}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
