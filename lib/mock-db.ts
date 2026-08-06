// In-memory mock database used when DATABASE_URL is not set

type Processo = {
  id: string;
  numero: string | null;
  assunto: string;
  tipoProcedimento: string;
  protocolo: Date | null;
  vara: string | null;
  sistema: string | null;
  responsavel: string;
  statusDescricao: string | null;
  situacao: string;
  atualizacao: Date | null;
  observacoes: string | null;
  dataCadastro: Date;
  updatedAt: Date;
};

type Historico = {
  id: string;
  processoId: string;
  dataMovimentacao: Date;
  tipoMovimentacao: string;
  descricao: string;
  userId: string | null;
  documento: string | null;
};

const MOCK_ADMIN = { id: "admin", name: "Admin", email: "admin" };

let _idSeq = 200;
const newId = () => (++_idSeq).toString(16).padStart(24, "0");

const processos: Processo[] = [
  {
    id: "mock000000000000000000001",
    numero: "0238891-61.2023.8.06.0001",
    assunto: "IMOBILIÁRIO",
    tipoProcedimento: "USUCAPIÃO PLAN AYRTON SENNA",
    protocolo: new Date("2023-04-30"),
    vara: "28ª VARA CÍVEL",
    sistema: "PJE",
    responsavel: "EDIRLANA",
    statusDescricao:
      "Mandado devolvido não entregue ao destinatário desde 14/03/2026",
    situacao: "em_andamento",
    atualizacao: new Date("2026-03-14"),
    observacoes: null,
    dataCadastro: new Date("2023-04-30"),
    updatedAt: new Date("2026-03-14"),
  },
  {
    id: "mock000000000000000000002",
    numero: "0287038-21.2023.8.06.0001",
    assunto: "CONSUMIDOR",
    tipoProcedimento: "REEMBOLSO PASSAGENS AEREAS",
    protocolo: new Date("2024-01-12"),
    vara: "31ª VARA CÍVEL",
    sistema: "PJE TJCE",
    responsavel: "ACSA",
    statusDescricao: "Cls para Despacho desde 24/03/2026",
    situacao: "em_andamento",
    atualizacao: new Date("2026-03-14"),
    observacoes: null,
    dataCadastro: new Date("2024-01-12"),
    updatedAt: new Date("2026-03-14"),
  },
  {
    id: "mock000000000000000000003",
    numero: "ADM",
    assunto: "TRIBUTÁRIO",
    tipoProcedimento: "IMUNIDADE ITBI PQ SANTANA",
    protocolo: new Date("2024-02-27"),
    vara: null,
    sistema: "SEFIN",
    responsavel: "ACSA",
    statusDescricao:
      "PREFEITURA SOLICITA TRANSFORMAR IMOVEL TERRITORIAL EM PREDIAL",
    situacao: "em_andamento",
    atualizacao: new Date("2025-02-28"),
    observacoes: null,
    dataCadastro: new Date("2024-02-27"),
    updatedAt: new Date("2025-02-28"),
  },
];

const historico: Historico[] = [
  {
    id: "hist000000000000000000001",
    processoId: "mock000000000000000000001",
    dataMovimentacao: new Date("2023-03-15"),
    tipoMovimentacao: "Cadastro",
    descricao: "Processo cadastrado no sistema.",
    userId: null,
    documento: null,
  },
  {
    id: "hist000000000000000000002",
    processoId: "mock000000000000000000001",
    dataMovimentacao: new Date("2023-04-10"),
    tipoMovimentacao: "Despacho",
    descricao: "Despacho ordinatório determinando citação do réu.",
    userId: null,
    documento: null,
  },
  {
    id: "hist000000000000000000003",
    processoId: "mock000000000000000000001",
    dataMovimentacao: new Date("2023-06-20"),
    tipoMovimentacao: "Audiência",
    descricao: "Audiência de instrução e julgamento designada para 20/06/2023.",
    userId: null,
    documento: null,
  },
  {
    id: "hist000000000000000000004",
    processoId: "mock000000000000000000002",
    dataMovimentacao: new Date("2023-05-22"),
    tipoMovimentacao: "Cadastro",
    descricao: "Processo cadastrado no sistema.",
    userId: null,
    documento: null,
  },
  {
    id: "hist000000000000000000005",
    processoId: "mock000000000000000000003",
    dataMovimentacao: new Date("2022-11-10"),
    tipoMovimentacao: "Cadastro",
    descricao: "Processo cadastrado no sistema.",
    userId: null,
    documento: null,
  },
  {
    id: "hist000000000000000000006",
    processoId: "mock000000000000000000003",
    dataMovimentacao: new Date("2023-01-20"),
    tipoMovimentacao: "Atualização",
    descricao:
      'Situação alterada de "Em andamento" para "Aguardando julgamento"',
    userId: null,
    documento: null,
  },
  {
    id: "hist000000000000000000007",
    processoId: "mock000000000000000000004",
    dataMovimentacao: new Date("2021-07-05"),
    tipoMovimentacao: "Cadastro",
    descricao: "Processo cadastrado no sistema.",
    userId: null,
    documento: null,
  },
  {
    id: "hist000000000000000000008",
    processoId: "mock000000000000000000004",
    dataMovimentacao: new Date("2022-03-15"),
    tipoMovimentacao: "Encerramento",
    descricao: "Acordo homologado em audiência. Processo encerrado.",
    userId: null,
    documento: null,
  },
  {
    id: "hist000000000000000000009",
    processoId: "mock000000000000000000005",
    dataMovimentacao: new Date("2024-01-18"),
    tipoMovimentacao: "Cadastro",
    descricao: "Processo cadastrado no sistema.",
    userId: null,
    documento: null,
  },
  {
    id: "hist000000000000000000010",
    processoId: "mock000000000000000000006",
    dataMovimentacao: new Date("2023-08-30"),
    tipoMovimentacao: "Cadastro",
    descricao: "Processo cadastrado no sistema.",
    userId: null,
    documento: null,
  },
];

// --- Helpers ---

type WhereClause = Record<string, unknown>;

function matchWhere(item: Record<string, unknown>, where: unknown): boolean {
  if (!where || typeof where !== "object") return true;
  const w = where as WhereClause;
  if ("AND" in w) return (w.AND as unknown[]).every((c) => matchWhere(item, c));
  if ("OR" in w) return (w.OR as unknown[]).some((c) => matchWhere(item, c));
  return Object.entries(w).every(([k, v]) => {
    // empty condition matches all
    if (v === undefined || v === null) return true;
    if (typeof v === "object" && Object.keys(v as object).length === 0)
      return true;
    const itemVal = item[k];
    if (typeof v === "object" && "contains" in (v as object)) {
      const { contains, mode } = v as { contains: string; mode?: string };
      const str = String(itemVal ?? "");
      return mode === "insensitive"
        ? str.toLowerCase().includes(contains.toLowerCase())
        : str.includes(contains);
    }
    return itemVal === v;
  });
}

function applySort<T>(arr: T[], orderBy?: unknown): T[] {
  if (!orderBy || typeof orderBy !== "object") return arr;
  const [[key, dir]] = Object.entries(orderBy as Record<string, string>);
  return [...arr].sort((a, b) => {
    const av = (a as Record<string, unknown>)[key];
    const bv = (b as Record<string, unknown>)[key];
    const cmp = av! < bv! ? -1 : av! > bv! ? 1 : 0;
    return dir === "desc" ? -cmp : cmp;
  });
}

// --- Mock client ---

export const mockDb = {
  processo: {
    async findMany({
      where,
      skip = 0,
      take,
      orderBy,
    }: {
      where?: unknown;
      skip?: number;
      take?: number;
      orderBy?: unknown;
    } = {}) {
      let result = processos.filter((p) =>
        matchWhere(p as unknown as Record<string, unknown>, where),
      );
      result = applySort(result, orderBy);
      return result.slice(skip, take != null ? skip + take : undefined);
    },

    async count({ where }: { where?: unknown } = {}) {
      return processos.filter((p) =>
        matchWhere(p as unknown as Record<string, unknown>, where),
      ).length;
    },

    async groupBy({
      by,
      orderBy,
      take,
    }: {
      by: string[];
      _count?: unknown;
      orderBy?: unknown;
      take?: number;
    }) {
      const field = by[0] as keyof Processo;
      const counts: Record<string, number> = {};
      for (const p of processos)
        counts[String(p[field])] = (counts[String(p[field])] ?? 0) + 1;

      let result = Object.entries(counts).map(([value, count]) => ({
        [field]: value,
        _count: count,
      }));

      if (
        orderBy &&
        typeof orderBy === "object" &&
        "_count" in (orderBy as object)
      ) {
        const dir = Object.values(
          (orderBy as Record<string, Record<string, string>>)._count,
        )[0];
        result.sort((a, b) =>
          dir === "desc" ? b._count - a._count : a._count - b._count,
        );
      }

      if (take != null) result = result.slice(0, take);
      return result;
    },

    async findUnique({
      where,
      include,
    }: {
      where: { id: string };
      include?: unknown;
    }) {
      const p = processos.find((p) => p.id === where.id);
      if (!p) return null;

      if (
        include &&
        typeof include === "object" &&
        "historico" in (include as object)
      ) {
        const inc = (include as Record<string, Record<string, unknown>>)
          .historico;
        let hist = historico.filter((h) => h.processoId === p.id);
        hist = applySort(hist, inc?.orderBy ?? { dataMovimentacao: "desc" });
        const withUser = hist.map((h) => ({
          ...h,
          usuario: h.userId === "admin" ? MOCK_ADMIN : null,
        }));
        return { ...p, historico: withUser };
      }

      return p;
    },

    async create({ data }: { data: Record<string, unknown> }) {
      const { historico: histNested, ...fields } = data;
      const p: Processo = {
        ...(fields as Omit<Processo, "id" | "dataCadastro" | "updatedAt">),
        id: newId(),
        numero: (fields.numero as string | null) ?? null,
        dataCadastro: new Date(),
        updatedAt: new Date(),
      };
      processos.push(p);
      if (
        histNested &&
        typeof histNested === "object" &&
        "create" in (histNested as object)
      ) {
        const hData = (histNested as { create: Record<string, unknown> })
          .create;
        historico.push({
          ...(hData as Omit<Historico, "id" | "processoId">),
          id: newId(),
          processoId: p.id,
          dataMovimentacao:
            (hData.dataMovimentacao as Date | undefined) ?? new Date(),
          documento: (hData.documento as string | null) ?? null,
        });
      }
      return p;
    },

    async update({
      where,
      data,
    }: {
      where: { id: string };
      data: Record<string, unknown>;
    }) {
      const idx = processos.findIndex((p) => p.id === where.id);
      if (idx === -1) return null;
      const { historico: histNested, ...fields } = data;
      processos[idx] = {
        ...processos[idx],
        ...(fields as Partial<Processo>),
        updatedAt: new Date(),
      };
      if (
        histNested &&
        typeof histNested === "object" &&
        "create" in (histNested as object)
      ) {
        const hData = (histNested as { create: Record<string, unknown> })
          .create;
        historico.push({
          ...(hData as Omit<Historico, "id" | "processoId">),
          id: newId(),
          processoId: where.id,
          dataMovimentacao:
            (hData.dataMovimentacao as Date | undefined) ?? new Date(),
          documento: (hData.documento as string | null) ?? null,
        });
      }
      return processos[idx];
    },

    async delete({ where }: { where: { id: string } }) {
      const idx = processos.findIndex((p) => p.id === where.id);
      if (idx !== -1) processos.splice(idx, 1);
      return {};
    },
  },

  historicoProcessual: {
    async findMany({
      where,
      include,
      orderBy,
      take,
    }: {
      where?: unknown;
      include?: unknown;
      orderBy?: unknown;
      take?: number;
    } = {}) {
      let result = historico.filter((h) =>
        matchWhere(h as unknown as Record<string, unknown>, where),
      );
      result = applySort(result, orderBy);
      if (take != null) result = result.slice(0, take);

      if (include && typeof include === "object") {
        const inc = include as Record<string, unknown>;
        return result.map((h) => ({
          ...h,
          ...(inc.processo != null
            ? { processo: processos.find((p) => p.id === h.processoId) ?? null }
            : {}),
          ...(inc.usuario != null
            ? { usuario: h.userId === "admin" ? MOCK_ADMIN : null }
            : {}),
        }));
      }
      return result;
    },

    async create({
      data,
      include,
    }: {
      data: Record<string, unknown>;
      include?: unknown;
    }) {
      const h: Historico = {
        ...(data as Omit<Historico, "id">),
        id: newId(),
        dataMovimentacao:
          (data.dataMovimentacao as Date | undefined) ?? new Date(),
        documento: (data.documento as string | null) ?? null,
      };
      historico.push(h);
      if (
        include &&
        typeof include === "object" &&
        "usuario" in (include as object)
      ) {
        return { ...h, usuario: h.userId === "admin" ? MOCK_ADMIN : null };
      }
      return h;
    },
  },

  user: {
    // no DB users in mock mode; admin login is handled by the bypass in auth.ts
    // no-op: mock mode has no real users
    async findUnique() {
      return null;
    },
  },
};
