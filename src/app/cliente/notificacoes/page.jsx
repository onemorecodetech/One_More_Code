import Link from "next/link";
import PortalShell from "@/components/portal/shell";
import CentralNotificacoes, { Preferencias } from "@/components/portal/central-notificacoes";
import { exigirCliente } from "@/lib/portal/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Minhas notificações | OneMoreCode" };

export default async function NotificacoesCliente() {
  await exigirCliente();
  return (
    <PortalShell>
      <Link href="/cliente" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8">← Meus documentos</Link>
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Minhas notificações</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px] items-start">
        <CentralNotificacoes categorias={["cadastro", "propostas", "contratos"]} />
        <Preferencias categorias={["propostas", "contratos", "cadastro"]} />
      </div>
    </PortalShell>
  );
}
