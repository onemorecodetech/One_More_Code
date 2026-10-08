"use client";
import { useState } from "react";

// Envia dados para a API e controla carregando/erro
export function useEnvio() {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(url, { json, formData, method = "POST" } = {}) {
    setEnviando(true);
    setErro("");
    try {
      const res = await fetch(url, {
        method,
        headers: json ? { "Content-Type": "application/json" } : undefined,
        body: json ? JSON.stringify(json) : formData,
      });
      const dados = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(dados.erro || "Não foi possível concluir. Tente de novo.");
      return dados;
    } catch (e) {
      setErro(e.message === "Failed to fetch" ? "Sem conexão. Verifique a internet." : e.message);
      return null;
    } finally {
      setEnviando(false);
    }
  }

  return { enviando, erro, setErro, enviar };
}
