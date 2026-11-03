"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimario, btnSecundario, card } from "./ui";

const moeda = (v) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Cliente: paga a cobrança com Pix (QR Code ou copia e cola) e informa o pagamento
export default function PagamentoPix({ docId, cobrancas }) {
  const router = useRouter();
  const [aberta, setAberta] = useState(null); const [pix, setPix] = useState(null); const [msg, setMsg] = useState(""); const [copiado, setCopiado] = useState(false); const [ocupado, setOcupado] = useState(false);
  async function gerar(c) {
    setAberta(c.id); setPix(null); setMsg(""); setCopiado(false);
    const r = await fetch(`/api/portal/propostas/${docId}/cobrancas/${c.id}`, { cache: "no-store" });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return setMsg(d.erro || "Não foi possível gerar o Pix.");
    setPix(d);
  }
  async function copiar() { try { await navigator.clipboard.writeText(pix.copiaECola); setCopiado(true); } catch { setCopiado(false); } }
  async function informar(c) {
    if (!confirm(`Confirma que já fez o Pix de ${moeda(c.valor)}?`)) return;
    setOcupado(true);
    const r = await fetch(`/api/portal/propostas/${docId}/cobrancas/${c.id}`, { method: "POST" });
    setOcupado(false);
    if (!r.ok) return setMsg("Não foi possível registrar. Tente de novo.");
    setAberta(null); router.refresh();
  }
  return (
    <section className={card}>
      <h2 className="font-bold mb-4">Pagamento</h2>
      <ul className="space-y-4">
        {cobrancas.map((c) => (
          <li key={c.id} className="rounded-2xl border border-white/10 p-4">
            <div className="flex items-start justify-between gap-3">
              <div><p className="font-semibold">{c.descricao}</p><p className="text-2xl font-bold">{moeda(c.valor)}</p></div>
              {c.status === "confirmado" && <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">Pago</span>}
              {c.status === "informado" && <span className="rounded-full bg-blue-400/15 px-3 py-1 text-xs font-semibold text-blue-200">Em conferência</span>}
            </div>
            {c.status === "informado" && <p className="mt-2 text-sm text-white/70">Recebemos o seu aviso. Assim que o Pix for conferido, você recebe a confirmação.</p>}
            {c.status === "pendente" && aberta !== c.id && <button onClick={() => gerar(c)} className={`${btnPrimario} mt-4 w-full`}>Pagar com Pix</button>}
            {c.status === "pendente" && aberta === c.id && (
              <div className="mt-4 space-y-4">
                {!pix && !msg && <p className="text-sm text-white/60">Gerando o Pix...</p>}
                {pix && (
                  <>
                    <div className="mx-auto w-56 overflow-hidden rounded-xl bg-white p-2" role="img" aria-label={`QR Code Pix de ${moeda(pix.valor)}`} dangerouslySetInnerHTML={{ __html: pix.qrSvg }} />
                    <p className="text-center text-sm text-white/70">Recebedor: <strong className="text-white">{pix.recebedor}</strong></p>
                    <div>
                      <label htmlFor={`cc-${c.id}`} className="mb-1 block text-sm text-white/70">Pix copia e cola</label>
                      <textarea id={`cc-${c.id}`} readOnly rows={3} value={pix.copiaECola} className="w-full rounded-xl border border-white/15 bg-[#0B0F1A] p-3 font-mono text-xs text-white" onFocus={(e) => e.target.select()} />
                      <button onClick={copiar} className={`${btnSecundario} mt-2 w-full`}>{copiado ? "Copiado!" : "Copiar código Pix"}</button>
                    </div>
                    <p className="text-xs text-white/60">Abra o app do seu banco, escolha Pix e leia o QR Code ou cole o código. Confira o nome do recebedor e o valor antes de confirmar.</p>
                    <button onClick={() => informar(c)} disabled={ocupado} className={`${btnPrimario} w-full`}>{ocupado ? "Registrando..." : "Já fiz o Pix"}</button>
                  </>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
      {msg && <p role="alert" className="mt-3 text-sm text-red-300">{msg}</p>}
    </section>
  );
}
