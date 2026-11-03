"use client";
import { useState } from "react";
import { input, label, btnPrimario, card } from "./ui";

const TIPOS = [["cnpj", "CNPJ"], ["cpf", "CPF"], ["email", "E-mail"], ["telefone", "Telefone"], ["aleatoria", "Chave aleatória"]];

// Admin: cadastra a chave Pix usada nas cobranças
export default function ConfigPix({ inicial }) {
  const [msg, setMsg] = useState({ t: "", erro: false }); const [teste, setTeste] = useState(""); const [salvando, setSalvando] = useState(false);
  async function salvar(e) {
    e.preventDefault(); if (salvando) return; setSalvando(true); setMsg({ t: "" });
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch("/api/portal/admin/pix", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const d = await r.json().catch(() => ({})); setSalvando(false);
    if (!r.ok) return setMsg({ t: d.erro || "Não foi possível salvar.", erro: true });
    setTeste(d.teste); setMsg({ t: "Chave Pix salva.", erro: false });
  }
  return (
    <div className="grid max-w-3xl gap-6">
      <form onSubmit={salvar} className={`${card} space-y-5`}>
        <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
          <div><label htmlFor="pix-tipo" className={label}>Tipo da chave</label>
            <select id="pix-tipo" name="tipo" defaultValue={inicial?.tipo || "cnpj"} className={input}>{TIPOS.map(([v, n]) => <option key={v} value={v}>{n}</option>)}</select></div>
          <div><label htmlFor="pix-chave" className={label}>Chave Pix</label><input id="pix-chave" name="chave" required maxLength={80} defaultValue={inicial?.chave || ""} className={input} autoComplete="off" /></div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label htmlFor="pix-nome" className={label}>Nome do recebedor (até 25 letras)</label><input id="pix-nome" name="nome" required maxLength={60} defaultValue={inicial?.nome || "ONEMORECODE"} className={input} /></div>
          <div><label htmlFor="pix-cidade" className={label}>Cidade (até 15 letras)</label><input id="pix-cidade" name="cidade" required maxLength={40} defaultValue={inicial?.cidade || "BLUMENAU"} className={input} /></div>
        </div>
        <p className="text-sm text-white/60">Use uma chave da <strong className="text-white/80">conta da empresa</strong>. Nome e cidade aparecem para o cliente no app do banco antes de ele confirmar o Pix.</p>
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={salvando} className={btnPrimario}>{salvando ? "Salvando..." : "Salvar chave Pix"}</button>
          <p role="status" className={`text-sm ${msg.erro ? "text-red-300" : "text-emerald-300"}`}>{msg.t}</p>
        </div>
      </form>
      {teste && (
        <section className={card}>
          <h2 className="font-bold mb-2">Confira antes de usar</h2>
          <p className="text-sm text-white/70 mb-4">Cole este Pix de teste (R$ 0,01) no app do seu banco, em “Pix copia e cola”, e confira se aparecem o nome e a chave certos. Não precisa concluir o pagamento.</p>
          <textarea readOnly value={teste} rows={3} className={`${input} font-mono text-xs`} aria-label="Pix de teste" />
        </section>
      )}
    </div>
  );
}
