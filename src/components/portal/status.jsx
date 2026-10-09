import { STATUS, rotuloStatus } from "@/lib/portal/util";

export default function StatusBadge({ status, doc }) {
  const s = STATUS[status] || STATUS.aguardando;
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${s.cor}`}>
      {rotuloStatus(status, doc)}
    </span>
  );
}

export function TipoBadge({ doc }) {
  const contrato = doc?.tipo === "contrato";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${
        contrato ? "bg-violet-400/15 text-violet-300" : "bg-sky-400/15 text-sky-300"
      }`}
    >
      {contrato ? "Contrato" : "Proposta"}
    </span>
  );
}
