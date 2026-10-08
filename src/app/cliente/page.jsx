import Link from "next/link";
import PortalShell from "@/components/portal/shell";
import StatusBadge from "@/components/portal/status";
import BotaoSair from "@/components/portal/botao-sair";
import { exigirCliente } from "@/lib/portal/auth";
import { statusAtual, moeda, data, linkWhatsApp } from "@/lib/portal/util";
import { card, btnWhats } from "@/components/portal/ui";

export const dynamic = "force-dynamic";

export default async function ClientePage() {
  const { cliente, db } = await exigirCliente();
  const propostas = db.propostas
    .filter((p) => p.clienteId === cliente.id)
    .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm));
  const primeiroNome = cliente.nome.split(" ")[0];

  return (
    <PortalShell>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <div>
          <p className="text-blue-400 text-sm uppercase tracking-widest mb-3">Área do cliente</p>
          <h1 className="text-3xl md:text-4xl font-bold">Olá, {primeiroNome}</h1>
        </div>
        <BotaoSair />
      </div>

      {propostas.length === 0 ? (
        <div className={`${card} text-center py-14`}>
          <h2 className="text-xl font-bold mb-3">Sua proposta está sendo preparada</h2>
          <p className="text-white/70 max-w-lg mx-auto mb-8">
            Assim que a OneMoreCode cadastrar a proposta do seu projeto, ela aparece aqui. Se ainda
            não conversamos sobre o seu projeto, chame no WhatsApp.
          </p>
          <a
            href={linkWhatsApp(`Olá! Sou ${cliente.nome} e criei minha conta na área do cliente da OneMoreCode.`)}
            target="_blank"
            rel="noopener noreferrer"
            className={btnWhats}
          >
            Falar no WhatsApp
          </a>
        </div>
      ) : (
        <ul className="grid gap-4">
          {propostas.map((p) => (
            <li key={p.id}>
              <Link
                href={`/cliente/propostas/${p.id}`}
                className="group flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-blue-400/50 hover:bg-white/[0.07]"
              >
                <div>
                  <p className="text-sm text-white/50 mb-1">{p.codigo} · enviada em {data(p.criadaEm)}</p>
                  <h2 className="text-lg md:text-xl font-bold group-hover:text-blue-300 transition">{p.titulo}</h2>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{moeda(p.valor)}</span>
                  <StatusBadge status={statusAtual(p)} />
                  <span aria-hidden="true" className="text-white/40 group-hover:text-blue-300 group-hover:translate-x-1 transition">→</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PortalShell>
  );
}
