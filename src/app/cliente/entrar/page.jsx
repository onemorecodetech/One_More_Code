import { redirect } from "next/navigation";
import PortalShell from "@/components/portal/shell";
import FormEntrar from "@/components/portal/form-entrar";
import { clienteLogado } from "@/lib/portal/auth";
import { card } from "@/components/portal/ui";

export default async function EntrarPage() {
  if (await clienteLogado()) redirect("/cliente");
  return (
    <PortalShell>
      <div className="max-w-md mx-auto">
        <p className="text-blue-400 text-sm uppercase tracking-widest mb-4">Área do cliente</p>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Acesse seus documentos</h1>
        <p className="text-white/70 mb-8">Veja, assine e acompanhe as propostas e contratos enviados pela OneMoreCode.</p>
        <div className={card}>
          <FormEntrar />
        </div>
      </div>
    </PortalShell>
  );
}
