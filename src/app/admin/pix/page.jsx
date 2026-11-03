import Link from "next/link";
import PortalShell from "@/components/portal/shell";
import ConfigPix from "@/components/portal/config-pix";
import { exigirAdmin } from "@/lib/portal/auth";
import { lerConfigPix } from "@/lib/pix";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pix | Painel OneMoreCode", robots: { index: false, follow: false } };

export default async function PixPage() {
  await exigirAdmin();
  const config = await lerConfigPix();
  return (
    <PortalShell>
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white mb-8">← Painel</Link>
      <h1 className="text-3xl md:text-4xl font-bold mb-2">Pagamento por Pix</h1>
      <p className="text-white/70 mb-10 max-w-2xl">A chave abaixo é usada para gerar o QR Code e o copia e cola das cobranças dos contratos. Você confirma cada pagamento manualmente, depois de conferir no extrato.</p>
      <ConfigPix inicial={config} />
    </PortalShell>
  );
}
