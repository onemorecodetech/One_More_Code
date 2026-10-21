import Link from "next/link";
import PortalShell from "@/components/portal/shell";
import Configuracoes from "@/components/portal/configuracoes";
import { exigirCliente } from "@/lib/portal/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Configurações da conta | OneMoreCode", robots: { index: false, follow: false } };

export default async function ConfiguracoesPage() {
  const { cliente, db } = await exigirCliente();
  const assinados = db.propostas.filter((p) => p.clienteId === cliente.id && ["aprovada", "conferencia"].includes(p.status)).length;
  return (
    <PortalShell>
      <Link href="/cliente" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white mb-8">← Meus documentos</Link>
      <h1 className="text-3xl md:text-4xl font-bold mb-2">Configurações da conta</h1>
      <p className="text-white/70 mb-10">Atualize seus dados, troque a senha ou exclua a sua conta.</p>
      <Configuracoes conta={{ nome: cliente.nome, email: cliente.email, whatsapp: cliente.whatsapp }} assinados={assinados} />
    </PortalShell>
  );
}
