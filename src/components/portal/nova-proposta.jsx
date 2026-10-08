"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEnvio } from "./use-envio";
import { input, label, btnPrimario, btnSecundario, card } from "./ui";

export default function NovaProposta({ clientes }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [sucesso, setSucesso] = useState("");
  const { enviando, erro, enviar } = useEnvio();

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const ok = await enviar("/api/portal/admin/propostas", { formData: new FormData(form) });
    if (ok) {
      form.reset();
      setSucesso(`Proposta ${ok.proposta.codigo} enviada. O cliente já pode ver na área dele.`);
      setAberto(false);
      router.refresh();
    }
  }

  if (!aberto) {
    return (
      <div className="flex flex-wrap items-center gap-4">
        <button onClick={() => { setAberto(true); setSucesso(""); }} className={btnPrimario}>
          + Nova proposta
        </button>
        {sucesso && <p role="status" className="text-sm text-emerald-400">{sucesso}</p>}
      </div>
    );
  }

  if (clientes.length === 0) {
    return (
      <div className={card}>
        <p className="text-white/70">
          Nenhum cliente cadastrado ainda. Peça para o cliente criar a conta em{" "}
          <span className="text-blue-400">/cliente/cadastro</span> e depois volte aqui.
        </p>
        <button onClick={() => setAberto(false)} className={`${btnSecundario} mt-4`}>Fechar</button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={`${card} space-y-5`}>
      <h2 className="text-xl font-bold">Nova proposta</h2>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="clienteId" className={label}>Cliente</label>
          <select id="clienteId" name="clienteId" required defaultValue="" className={input}>
            <option value="" disabled>Selecione...</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}{c.empresa ? ` · ${c.empresa}` : ""} ({c.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="titulo" className={label}>Título</label>
          <input id="titulo" name="titulo" required placeholder="Site institucional com painel" className={input} />
        </div>
      </div>

      <div>
        <label htmlFor="resumo" className={label}>Resumo para o cliente</label>
        <textarea id="resumo" name="resumo" rows={3} placeholder="O que está incluso, em poucas linhas." className={`${input} resize-none`} />
      </div>

      <div className="grid md:grid-cols-4 gap-5">
        <div>
          <label htmlFor="valor" className={label}>Valor (R$)</label>
          <input id="valor" name="valor" required inputMode="decimal" placeholder="1.500,00" className={input} />
        </div>
        <div>
          <label htmlFor="condicoes" className={label}>Condições</label>
          <input id="condicoes" name="condicoes" placeholder="50% entrada + 50% entrega" className={input} />
        </div>
        <div>
          <label htmlFor="prazo" className={label}>Prazo de entrega</label>
          <input id="prazo" name="prazo" placeholder="15 dias úteis" className={input} />
        </div>
        <div>
          <label htmlFor="validade" className={label}>Válida até</label>
          <input id="validade" name="validade" type="date" className={input} />
        </div>
      </div>

      <div>
        <label htmlFor="arquivo" className={label}>PDF da proposta (até 4 MB)</label>
        <input
          id="arquivo"
          name="arquivo"
          type="file"
          accept="application/pdf,.pdf"
          required
          className="block w-full text-sm text-white/70 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-500 file:px-4 file:py-2.5 file:font-semibold file:text-white hover:file:bg-blue-600"
        />
      </div>

      {erro && <p role="alert" className="text-sm text-red-400">{erro}</p>}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={enviando} className={btnPrimario}>
          {enviando ? "Enviando..." : "Enviar proposta ao cliente"}
        </button>
        <button type="button" onClick={() => setAberto(false)} disabled={enviando} className={btnSecundario}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
