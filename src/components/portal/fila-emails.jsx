"use client";

import { useEffect, useState } from "react";
import { btnSecundario, card } from "./ui";

const formatar = (iso) => new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

// Admin: situação dos e-mails e últimas mensagens do formulário de contato
export default function FilaEmails() {
  const [d, setD] = useState(null);
  const [msg, setMsg] = useState("");
  const carregar = () => fetch("/api/portal/admin/fila", { cache: "no-store" }).then((r) => r.json()).then(setD).catch(() => {});
  useEffect(() => { carregar(); }, []);

  async function processar(reenviarFalhas) {
    const r = await fetch("/api/portal/admin/fila", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reenviarFalhas }) });
    const j = await r.json().catch(() => ({}));
    setMsg(j.resultado ? `Enviados: ${j.resultado.enviados} · Falhas: ${j.resultado.falhas} · Adiados: ${j.resultado.adiados}` : "Não foi possível processar.");
    carregar();
  }

  if (!d) return null;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className={card}>
        <h2 className="text-lg font-bold mb-4">E-mails</h2>
        <p className="text-sm text-white/70 mb-4">Na fila: <strong>{d.pendentes}</strong> · Com falha: <strong className={d.falhas.length ? "text-red-400" : ""}>{d.falhas.length}</strong></p>
        <div className="flex flex-wrap gap-3 mb-4">
          <button onClick={() => processar(false)} className={`${btnSecundario} !min-h-10`}>Enviar fila agora</button>
          {d.falhas.length > 0 && <button onClick={() => processar(true)} className={`${btnSecundario} !min-h-10`}>Tentar falhas de novo</button>}
        </div>
        {msg && <p role="status" className="text-sm text-emerald-400 mb-4">{msg}</p>}
        {d.falhas.map((f) => <p key={f.id} className="text-sm text-red-300 mb-2">{f.assunto} → {f.para}<br /><span className="text-white/50">{f.erro}</span></p>)}
        <h3 className="font-semibold mt-4 mb-2 text-sm text-white/60">Últimos enviados</h3>
        <ul className="space-y-1 text-sm text-white/70">
          {d.historico.length ? d.historico.map((h, i) => <li key={i}>{formatar(h.em)} · {h.assunto} → {h.para}</li>) : <li className="text-white/40">Nenhum ainda.</li>}
        </ul>
      </section>
      <section className={card}>
        <h2 className="text-lg font-bold mb-4">Mensagens do formulário</h2>
        {d.contatos.length === 0 ? <p className="text-white/50 text-sm">Nenhuma mensagem ainda.</p> : (
          <ul className="space-y-4 max-h-[28rem] overflow-y-auto">
            {d.contatos.map((c) => (
              <li key={c.id} className="text-sm border-b border-white/10 pb-3">
                <p className="font-semibold">{c.nome} · <a href={`mailto:${c.email}`} className="text-blue-400">{c.email}</a></p>
                <p className="text-white/40 text-xs">{formatar(c.em)}{c.web3forms !== "ok" ? " · Web3Forms não confirmou (enviado pelo Resend)" : ""}</p>
                <p className="text-white/70 whitespace-pre-line mt-1">{c.mensagem}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
