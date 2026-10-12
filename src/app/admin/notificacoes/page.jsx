import Link from "next/link";
import PortalShell from "@/components/portal/shell";
import CentralNotificacoes, { Preferencias } from "@/components/portal/central-notificacoes";
import FilaEmails from "@/components/portal/fila-emails";
import { exigirAdmin } from "@/lib/portal/auth";
import { processarFila } from "@/lib/notificacoes/central";

export const dynamic = "force-dynamic";

export default async function NotificacoesAdmin() {
  await exigirAdmin();
  await processarFila(5).catch(() => {}); // aproveita a visita para enviar pendências
  return (
    <PortalShell>
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8">← Propostas e contratos</Link>
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Central de notificações</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px] items-start mb-6">
        <CentralNotificacoes categorias={["contato", "cadastro", "propostas", "contratos"]} />
        <Preferencias categorias={["propostas", "contratos", "cadastro"]} />
      </div>
      <FilaEmails />
    </PortalShell>
  );
}
