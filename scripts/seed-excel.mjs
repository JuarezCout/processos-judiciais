/**
 * Imports data from JURIDICO - ADMINISTRAÇÃO FORTALEZA.xlsx into MongoDB.
 * Usage: node scripts/seed-excel.mjs
 */

import { readFileSync } from "fs";
import { read, utils } from "xlsx";
import { PrismaClient } from "@prisma/client";

const XLSX_PATH = "C:/Users/jleitene/Downloads/JURIDICO - ADMINISTRAÇÃO FORTALEZA.xlsx";

const prisma = new PrismaClient();

/** Convert Excel serial date to JS Date. Returns null for invalid/small serials. */
function excelDate(serial) {
    if (!serial || typeof serial !== "number" || serial < 25569) return null;
    return new Date((serial - 25569) * 86400 * 1000);
}

function cleanStr(val) {
    if (val == null) return null;
    const s = String(val).trim();
    return s === "" || s === "-" ? null : s;
}

async function main() {
    const wb = read(readFileSync(XLSX_PATH));

    const sheetMap = {
        "EM ANDAMENTO": "em_andamento",
        "CONCLUSOS": "concluido",
    };

    let inserted = 0;

    for (const [sheetName, situacao] of Object.entries(sheetMap)) {
        const ws = wb.Sheets[sheetName];
        if (!ws) { console.warn(`Sheet "${sheetName}" not found`); continue; }

        // rows from index 4 onward (header is row index 3)
        const rows = utils.sheet_to_json(ws, { header: 1 }).slice(4);

        for (const row of rows) {
            // skip empty rows
            if (!row || row.length < 2 || (row[1] == null && row[2] == null)) continue;

            const assunto = cleanStr(row[1]) ?? "Outro";
            const tipoProcedimento = cleanStr(row[2]);
            if (!tipoProcedimento) continue;

            const protocolo = excelDate(row[3]);
            const vara = cleanStr(row[4]);
            const sistema = cleanStr(row[5]);
            const numero = cleanStr(typeof row[6] === "number" ? String(row[6]) : row[6]);
            const responsavel = cleanStr(row[7]) ?? "—";
            const statusDescricao = cleanStr(row[8]);
            const atualizacao = excelDate(row[9]);

            await prisma.processo.create({
                data: {
                    numero,
                    assunto,
                    tipoProcedimento,
                    protocolo,
                    vara,
                    sistema,
                    responsavel,
                    statusDescricao,
                    situacao,
                    atualizacao,
                },
            });

            inserted++;
            console.log(`  [${situacao}] ${tipoProcedimento}`);
        }
    }

    console.log(`\nDone. ${inserted} processos inserted.`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
