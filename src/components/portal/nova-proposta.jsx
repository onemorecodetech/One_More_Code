"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEnvio } from "./use-envio";
import { input, label, btnPrimario, btnSecundario, card } from "./ui";

const TEXTOS = {
  proposta: {
    titulo: "Nova proposta",
    placeholderTitulo: "Site institucional com painel",
    pdf: "PDF da proposta (até 4 MB)",
    enviar: "Enviar proposta ao cliente",
    sucesso: (c) => `Proposta ${c} enviada. O cliente já pode ver na área dele.`,
  },
  contrato: {
    titulo: "Novo contrato",
    placeholderTitulo: "Contrato de desenvolvimento de site",
    pdf: "PDF do contrato (até 4 MB)",
    enviar: "Enviar contrato ao cliente",
    sucesso: (c) => `Contrato ${c} enviado. O cliente já pode ver na área dele.`,
  },
};

// Formulário do admin para enviar propostas e contratos
export default function NovaProposta({ clientes, propostas = [], inicial = null }) {
  const router = useRouter();
  const [tipo, setTipo] = useState(inicial?.tipo || null); // null = fechado
  const [clienteId, setClienteId] = useState(inicial?.clienteId && clientes.some((c) => c.id === inicial.clienteId) ? inicial.clienteId : "");
  const [sucesso, setSucesso] = useState("");
  const { enviando, erro, setErro, enviar } = useEnvio();
  const t = TEXTOS[tipo || "proposta"];

  // Propostas do cliente escolhido. Só as com assinatura confirmada
  // e ainda sem contrato podem gerar um contrato.
  const propostasDoCliente = propostas.filter((p) => p.clienteId === clienteId);
  const liberadas = propostasDoCliente.filter((p) => p.status === "aprovada" && !p.contrato);
  const bloqueadas = propostasDoCliente.filter((p) => !(p.status === "aprovada" && !p.contrato));
  const contratoBloqueado = tipo === "contrato" && clienteId && liberadas.length === 0;

  function motivo(p) {
    if (p.contrato) return `já tem o contrato ${p.contrato}`;
    if (p.status === "conferencia") return "assinatura aguardando sua conferência";
    if (p.status === "aguardando") return "ainda não assinada";
    if (p.status === "expirada") return "expirada";
    if (p.status === "cancelada") return "cancelada";
    return "sem assinatura confirmada";
  }

  function abrir(novoTipo) {
    setTipo(novoTipo);
    setSucesso("");
    setErro("");
  }

  function fechar() {
    setTipo(null);
    setClienteId("");
  }

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const pdf = form.arquivo.files[0];
    if (pdf && pdf.size > 4 * 1024 * 1024) {
      setErro(`Este PDF tem ${(pdf.size / 1024 / 1024).toFixed(1)} MB. O limite é 4 MB: exporte o PDF com imagens comprimidas e tente de novo.`);
      return;
    }
    const ok = await enviar("/api/portal/admin/propostas", { formData: new FormData(form) });
    if (ok) {
      form.reset();
      setSucesso(t.sucesso(ok.proposta.codigo));
      fechar();
      router.refresh();
    }
  }

  if (!tipo) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => abrir("proposta")} className={btnPrimario}>+ Nova proposta</button>
        <button onClick={() => abrir("contrato")} className={btnSecundario}>+ Novo contrato</button>
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
        <button onClick={fechar} className={`${btnSecundario} mt-4`}>Fechar</button>
      </div>
    );
  }

  const contrato = tipo === "contrato";

  return (
    <form onSubmit={onSubmit} className={`${card} space-y-5`}>
      <input type="hidden" name="tipo" value={tipo} />
      <h2 className="text-xl font-bold">{t.titulo}</h2>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="clienteId" className={label}>Cliente</label>
          <select
            id="clienteId"
            name="clienteId"
            required
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className={input}
          >
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
          <input id="titulo" name="titulo" required placeholder={t.placeholderTitulo} defaultValue={inicial?.titulo || ""} className={input} />
        </div>
      </div>

      {contrato && (
        <div>
          <label htmlFor="propostaRelacionada" className={label}>Referente à proposta</label>
          <select
            key={clienteId}
            id="propostaRelacionada"
            name="propostaRelacionada"
            required
            defaultValue=""
            className={input}
            disabled={!clienteId || liberadas.length === 0}
          >
            <option value="" disabled>
              {!clienteId ? "Escolha o cliente primeiro" : liberadas.length ? "Selecione a proposta assinada..." : "Nenhuma proposta liberada"}
            </option>
            {liberadas.map((p) => (
              <option key={p.id} value={p.id}>{p.codigo} · {p.titulo}</option>
            ))}
          </select>

          <p className="mt-2 text-sm text-white/50">
            O contrato só pode ser gerado a partir de uma proposta assinada pelo cliente e com a
            assinatura confirmada por você.
          </p>

          {contratoBloqueado && (
            <div className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
              {propostasDoCliente.length === 0 ? (
                <p>Este cliente ainda não tem nenhuma proposta. Envie a proposta primeiro.</p>
              ) : (
                <>
                  <p className="mb-2">Nenhuma proposta deste cliente está liberada para contrato:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {bloqueadas.map((p) => (
                      <li key={p.id}>{p.codigo} · {p.titulo}: {motivo(p)}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <div>
        <label htmlFor="resumo" className={label}>Resumo para o cliente</label>
        <textarea
          id="resumo"
          name="resumo"
          rows={3}
          placeholder={contrato ? "Principais pontos do contrato, em poucas linhas." : "O que está incluso, em poucas linhas."}
          className={`${input} resize-none`}
        />
      </div>

      <div className="grid md:grid-cols-4 gap-5">
        <div>
          <label htmlFor="valor" className={label}>
            Valor (R$) {contrato && <span className="text-white/40">(opcional)</span>}
          </label>
          <input id="valor" name="valor" required={!contrato} inputMode="decimal" placeholder="1.500,00" defaultValue={inicial?.valor ? String(inicial.valor).replace(".", ",") : ""} className={input} />
        </div>
        <div>
          <label htmlFor="condicoes" className={label}>Condições</label>
          <input id="condicoes" name="condicoes" placeholder="50% entrada + 50% entrega" className={input} />
        </div>
        <div>
          <label htmlFor="prazo" className={label}>{contrato ? "Vigência / prazo" : "Prazo de entrega"}</label>
          <input id="prazo" name="prazo" placeholder={contrato ? "12 meses" : "15 dias úteis"} className={input} />
        </div>
        <div>
          <label htmlFor="validade" className={label}>Assinar até</label>
          <input id="validade" name="validade" type="date" className={input} />
        </div>
      </div>

      <div>
        <label htmlFor="arquivo" className={label}>{t.pdf}</label>
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
        <button type="submit" disabled={enviando || contratoBloqueado} className={btnPrimario}>
          {enviando ? "Enviando..." : t.enviar}
        </button>
        <button type="button" onClick={fechar} disabled={enviando} className={btnSecundario}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
