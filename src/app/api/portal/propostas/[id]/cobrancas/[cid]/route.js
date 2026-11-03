// Cliente: gera o Pix (QR Code + copia e cola) e informa que pagou
import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { lerSessao } from "@/lib/portal/auth";
import { lerDB, salvarDB } from "@/lib/portal/storage";
import { statusAtual, moeda } from "@/lib/portal/util";
import { cobrancasVisiveis } from "@/lib/portal/cobrancas";
import { lerConfigPix, gerarBRCode } from "@/lib/pix";
import { publicarSeguro, processarDepois } from "@/lib/notificacoes/central";

const json = (d, status = 200) => NextResponse.json(d, { status, headers: { "Cache-Control": "no-store" } });

// Só o dono do contrato (conta ativa) acessa; o valor vem sempre do servidor
async function carregar(contexto) {
  const s = await lerSessao();
  if (s?.tipo !== "cliente") return { erro: json({ erro: "Faça login novamente." }, 401) };
  const { id, cid } = await contexto.params;
  const db = await lerDB();
  const cliente = db.clientes.find((c) => c.id === s.id && !c.encerrada);
  const doc = db.propostas.find((p) => p.id === id && p.clienteId === s.id);
  if (!cliente || !doc) return { erro: json({ erro: "Documento não encontrado." }, 404) };
  const cob = cobrancasVisiveis(doc, statusAtual(doc)).find((c) => c.id === cid);
  if (!cob) return { erro: json({ erro: "Cobrança não encontrada." }, 404) };
  return { db, doc, cob, cliente };
}

export async function GET(request, contexto) {
  const { doc, cob, erro } = await carregar(contexto); if (erro) return erro;
  if (cob.status === "confirmado") return json({ erro: "Esta cobrança já foi paga." }, 409);
  const config = await lerConfigPix();
  if (!config) return json({ erro: "O pagamento por Pix ainda não está disponível. Fale com a OneMoreCode pelo WhatsApp." }, 503);
  const copiaECola = gerarBRCode({ ...config, valor: cob.valor, txid: cob.txid });
  const qrSvg = await QRCode.toString(copiaECola, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#0B0F1A", light: "#FFFFFF" } });
  return json({ copiaECola, qrSvg, valor: cob.valor, recebedor: config.nome, txid: cob.txid, codigo: doc.codigo });
}

export async function POST(request, contexto) {
  const { db, doc, cob, cliente, erro } = await carregar(contexto); if (erro) return erro;
  if (cob.status !== "pendente") return json({ ok: true, status: cob.status });
  cob.status = "informado"; cob.informadoEm = new Date().toISOString();
  doc.historico.push({ em: cob.informadoEm, texto: `Cliente informou o pagamento de "${cob.descricao}" (${moeda(cob.valor)})` });
  await salvarDB(db);
  await publicarSeguro("pagamento.informado", { chave: `pagamento-informado:${cob.id}:${cob.informadoEm}`, dados: { id: doc.id, codigo: doc.codigo, descricao: cob.descricao, valorTexto: moeda(cob.valor), txid: cob.txid, nomeCliente: cliente.nome } });
  await processarDepois();
  return json({ ok: true, status: cob.status });
}
