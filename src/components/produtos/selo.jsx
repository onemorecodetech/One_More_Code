import { STATUS } from "../../lib/produtos";
export default function SeloStatus({ status }) {
  const s = STATUS[status] || STATUS.desenvolvimento;
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${s.classe}`}>{s.rotulo}</span>;
}
