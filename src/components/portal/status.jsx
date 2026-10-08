import { STATUS } from "@/lib/portal/util";

export default function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.aguardando;
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${s.cor}`}>
      {s.label}
    </span>
  );
}
