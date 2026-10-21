"use client";
import { useState } from "react";
import Link from "next/link";
import { User, Mail, KeyRound, Bell, Download, Trash2 } from "lucide-react";
import { input, label, btnPrimario, btnSecundario, card } from "./ui";

async function enviar(method, corpo) {
  const r = await fetch("/api/portal/conta", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.erro || "Não foi possível salvar.");
  return d;
}

function Secao({ icone: Icone, titulo, descricao, children, perigo = false }) {
  return (
    <section className={`${card} ${perigo ? "!border-red-400/30" : ""}`}>
      <h2 className={`flex items-center gap-2 text-xl font-bold ${perigo ? "text-red-300" : ""}`}><Icone size={20} aria-hidden="true" />{titulo}</h2>
      {descricao && <p className="mt-1 mb-5 text-sm text-white/70">{descricao}</p>}
      {children}
    </section>
  );
}

// Formulário com estado de envio, mensagem de sucesso/erro e trava contra clique duplo
function Form({ onEnviar, rotulo, perigo = false, children }) {
  const [estado, setEstado] = useState({ enviando: false, msg: "", erro: false });
  async function submit(e) {
    e.preventDefault(); if (estado.enviando) return;
    const f = e.currentTarget; setEstado({ enviando: true, msg: "", erro: false });
    try { const msg = await onEnviar(Object.fromEntries(new FormData(f)), f); setEstado({ enviando: false, msg: msg || "Alterações salvas.", erro: false }); }
    catch (err) { setEstado({ enviando: false, msg: err.message, erro: true }); }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      {children}
      <div className="flex flex-wrap items-center gap-4 pt-1">
        <button type="submit" disabled={estado.enviando} className={perigo ? "inline-flex min-h-12 items-center justify-center rounded-xl bg-red-700 px-6 font-semibold text-white transition hover:bg-red-800 disabled:opacity-60" : btnPrimario}>{estado.enviando ? "Salvando..." : rotulo}</button>
        <p role="status" aria-live="polite" className={`text-sm ${estado.erro ? "text-red-300" : "text-emerald-300"}`}>{estado.msg}</p>
      </div>
    </form>
  );
}

export default function Configuracoes({ conta, assinados }) {
  const [dados, setDados] = useState(conta);
  return (
    <div className="grid max-w-3xl gap-6">
      <Secao icone={User} titulo="Seus dados">
        <Form rotulo="Salvar dados" onEnviar={async (f) => { const r = await enviar("PATCH", { acao: "dados", ...f }); setDados(r.conta); }}>
          <div><label htmlFor="cfg-nome" className={label}>Nome completo</label><input id="cfg-nome" name="nome" required minLength={2} maxLength={120} defaultValue={dados.nome} autoComplete="name" className={input} /></div>
          <div><label htmlFor="cfg-whats" className={label}>WhatsApp com DDD</label><input id="cfg-whats" name="whatsapp" required inputMode="tel" maxLength={20} defaultValue={dados.whatsapp} autoComplete="tel" className={input} /></div>
        </Form>
      </Secao>

      <Secao icone={Mail} titulo="E-mail de acesso" descricao={`Atual: ${dados.email}. Para trocar, confirme a sua senha.`}>
        <Form rotulo="Trocar e-mail" onEnviar={async (f, form) => { const r = await enviar("PATCH", { acao: "email", email: f.email, senhaAtual: f.senhaAtual }); setDados(r.conta); form.reset(); return "E-mail atualizado. Use o novo e-mail no próximo login."; }}>
          <div><label htmlFor="cfg-email" className={label}>Novo e-mail</label><input id="cfg-email" name="email" type="email" required maxLength={160} autoComplete="email" className={input} /></div>
          <div><label htmlFor="cfg-senha-email" className={label}>Senha atual</label><input id="cfg-senha-email" name="senhaAtual" type="password" required autoComplete="current-password" className={input} /></div>
        </Form>
      </Secao>

      <Secao icone={KeyRound} titulo="Senha">
        <Form rotulo="Trocar senha" onEnviar={async (f, form) => {
          if (f.novaSenha !== f.confirmar) throw new Error("A confirmação não confere com a nova senha.");
          await enviar("PATCH", { acao: "senha", senhaAtual: f.senhaAtual, novaSenha: f.novaSenha }); form.reset(); return "Senha alterada.";
        }}>
          <div><label htmlFor="cfg-senha-atual" className={label}>Senha atual</label><input id="cfg-senha-atual" name="senhaAtual" type="password" required autoComplete="current-password" className={input} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="cfg-nova" className={label}>Nova senha (mínimo 8 caracteres)</label><input id="cfg-nova" name="novaSenha" type="password" required minLength={8} autoComplete="new-password" className={input} /></div>
            <div><label htmlFor="cfg-confirmar" className={label}>Repita a nova senha</label><input id="cfg-confirmar" name="confirmar" type="password" required minLength={8} autoComplete="new-password" className={input} /></div>
          </div>
        </Form>
      </Secao>

      <Secao icone={Bell} titulo="Notificações" descricao="Escolha quais avisos você quer receber por e-mail.">
        <Link href="/cliente/notificacoes" className={btnSecundario}>Preferências de notificação</Link>
      </Secao>

      <Secao icone={Download} titulo="Seus dados pessoais (LGPD)" descricao="Baixe uma cópia de todos os dados que a OneMoreCode guarda sobre você.">
        <div className="flex flex-wrap gap-3">
          <a href="/api/portal/conta?exportar=1" className={btnSecundario}>Baixar meus dados</a>
          <Link href="/privacidade" className="inline-flex min-h-12 items-center text-sm text-blue-300 underline underline-offset-4">Política de Privacidade</Link>
        </div>
      </Secao>

      <Secao icone={Trash2} titulo="Excluir conta" perigo
        descricao={assinados > 0
          ? `Você tem ${assinados} documento(s) assinado(s). Por obrigação legal, eles ficam guardados pelo prazo previsto em lei, só com a OneMoreCode. Seu acesso, telefone e e-mail serão apagados, e os demais documentos e avisos, excluídos.`
          : "Sua conta, seus documentos e seus avisos serão apagados de forma definitiva."}>
        <Form rotulo="Excluir minha conta" perigo onEnviar={async (f) => {
          await enviar("DELETE", { senha: f.senha, confirmacao: f.confirmacao });
          window.location.replace(new URL("/cliente/entrar?conta=excluida", window.location.origin).href);
          return "Conta excluída.";
        }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="cfg-senha-excluir" className={label}>Sua senha</label><input id="cfg-senha-excluir" name="senha" type="password" required autoComplete="current-password" className={input} /></div>
            <div><label htmlFor="cfg-confirmacao" className={label}>Digite EXCLUIR para confirmar</label><input id="cfg-confirmacao" name="confirmacao" required pattern="[Ee][Xx][Cc][Ll][Uu][Ii][Rr]" autoComplete="off" className={input} /></div>
          </div>
          <p className="text-sm text-white/70">Esta ação não pode ser desfeita.</p>
        </Form>
      </Secao>
    </div>
  );
}
