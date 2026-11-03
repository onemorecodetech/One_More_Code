// Pix estático com valor (padrão BR Code / EMV do Banco Central).
// Gera o "copia e cola" a partir da chave Pix da OneMoreCode. Não usa API de banco:
// a confirmação do pagamento é feita manualmente pelo admin.
import * as kv from "@/lib/kv";

const CHAVE_CONFIG = "omc:pix:config";

export const TIPOS_CHAVE = { cnpj: "CNPJ", cpf: "CPF", email: "E-mail", telefone: "Telefone", aleatoria: "Chave aleatória" };

// Texto do recebedor: sem acentos, maiúsculo e só caracteres aceitos pelos bancos
export const textoPix = (s, max) =>
  String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9 .\-]/g, "").replace(/\s+/g, " ").trim().toUpperCase().slice(0, max);

function digitosCpfCnpjValidos(d) {
  const calc = (base, pesos) => { const s = base.split("").reduce((t, n, i) => t + Number(n) * pesos[i], 0); const r = s % 11; return r < 2 ? 0 : 11 - r; };
  if (d.length === 11) {
    if (/^(\d)\1+$/.test(d)) return false;
    const p1 = [10, 9, 8, 7, 6, 5, 4, 3, 2], p2 = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
    const r = (b, p) => { const s = b.split("").reduce((t, n, i) => t + Number(n) * p[i], 0) * 10 % 11; return s === 10 ? 0 : s; };
    return r(d.slice(0, 9), p1) === Number(d[9]) && r(d.slice(0, 10), p2) === Number(d[10]);
  }
  if (d.length === 14) {
    if (/^(\d)\1+$/.test(d)) return false;
    const d1 = calc(d.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    const d2 = calc(d.slice(0, 12) + d1, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    return d1 === Number(d[12]) && d2 === Number(d[13]);
  }
  return false;
}

// Valida e normaliza a chave conforme o tipo. Lança erro com mensagem amigável.
export function normalizarChave(tipo, valor) {
  const v = String(valor || "").trim();
  if (tipo === "cpf" || tipo === "cnpj") {
    const d = v.replace(/\D/g, "");
    if ((tipo === "cpf" && d.length !== 11) || (tipo === "cnpj" && d.length !== 14) || !digitosCpfCnpjValidos(d)) throw new Error(`${TIPOS_CHAVE[tipo]} inválido.`);
    return d;
  }
  if (tipo === "email") {
    const e = v.toLowerCase();
    if (e.length > 77 || !/^[^\s@<>"]+@[^\s@<>"]+\.[a-z]{2,}$/i.test(e)) throw new Error("E-mail inválido.");
    return e;
  }
  if (tipo === "telefone") {
    let d = v.replace(/\D/g, "");
    if (d.length === 10 || d.length === 11) d = "55" + d;
    if (!/^55\d{10,11}$/.test(d)) throw new Error("Telefone inválido. Use DDD + número.");
    return "+" + d;
  }
  if (tipo === "aleatoria") {
    const a = v.toLowerCase();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(a)) throw new Error("Chave aleatória inválida (formato 00000000-0000-0000-0000-000000000000).");
    return a;
  }
  throw new Error("Escolha o tipo da chave.");
}

const campo = (id, valor) => `${id}${String(valor.length).padStart(2, "0")}${valor}`;

// CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF), exigido no campo 63
export function crc16(texto) {
  let crc = 0xffff;
  for (const byte of Buffer.from(texto, "utf8")) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

// Monta o "copia e cola" do Pix
export function gerarBRCode({ chave, nome, cidade, valor, txid, descricao }) {
  const conta = campo("00", "br.gov.bcb.pix") + campo("01", chave) + (descricao ? campo("02", textoPix(descricao, 40)) : "");
  if (conta.length > 99) throw new Error("Chave Pix e descrição longas demais.");
  const id = (String(txid || "").replace(/[^A-Za-z0-9]/g, "").slice(0, 25)) || "***";
  const payload =
    campo("00", "01") +
    campo("26", conta) +
    campo("52", "0000") +
    campo("53", "986") +
    (valor ? campo("54", Number(valor).toFixed(2)) : "") +
    campo("58", "BR") +
    campo("59", textoPix(nome, 25)) +
    campo("60", textoPix(cidade, 15)) +
    campo("62", campo("05", id)) +
    "6304";
  return payload + crc16(payload);
}

export async function lerConfigPix() { return (await kv.get(CHAVE_CONFIG)) || null; }

export async function salvarConfigPix(b) {
  const tipo = String(b?.tipo || "");
  const chave = normalizarChave(tipo, b?.chave);
  const nome = textoPix(b?.nome, 25);
  const cidade = textoPix(b?.cidade, 15);
  if (nome.length < 3) throw new Error("Informe o nome do recebedor (como aparece no banco).");
  if (cidade.length < 2) throw new Error("Informe a cidade.");
  const config = { tipo, chave, nome, cidade, atualizadoEm: new Date().toISOString() };
  await kv.set(CHAVE_CONFIG, config);
  return config;
}
