import { redirect } from "next/navigation";
import PortalShell from "@/components/portal/shell";
import FormCadastro from "@/components/portal/form-cadastro";
import { clienteLogado } from "@/lib/portal/auth";
import { card } from "@/components/portal/ui";
import ContatoWhatsApp from "@/components/portal/contato-whatsapp";

export default async function CadastroPage() {
  if (await clienteLogado()) redirect("/cliente");
  return (
    <PortalShell>
      <div className="max-w-2xl mx-auto">
        <p className="text-blue-400 text-sm uppercase tracking-widest mb-4">Área do cliente</p>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Criar conta</h1>
        <p className="text-white/70 mb-8">
          Com a conta criada, as propostas e contratos que a OneMoreCode preparar para você aparecem aqui para
          leitura e assinatura.
        </p>
        <div className={card}>
          <FormCadastro />
        </div>
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-sm text-white/70">Prefere conversar antes? Fale com a gente direto pelo WhatsApp.</p>
          <ContatoWhatsApp compacto mensagem="Olá! Vim pelo site da OneMoreCode e gostaria de conversar sobre um projeto." className="shrink-0" />
        </div>
      </div>
    </PortalShell>
  );
}
