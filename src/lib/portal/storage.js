// Armazenamento da área do cliente.
//
// Na Vercel:     dados no Upstash Redis e PDFs no Vercel Blob
//                (conectados em Storage, no painel do projeto).
// No computador: dados em data/portal.json e PDFs em data/arquivos/
//                (sem configurar nada; a pasta data/ fica fora do GitHub).
import fs from "fs";
import path from "path";

const KEY = "omc:portal";
const VAZIO = { clientes: [], propostas: [], sequencia: 0 };
const ON_VERCEL = !!process.env.VERCEL;

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
// O Blob pode vir conectado de dois jeitos: com BLOB_READ_WRITE_TOKEN (formato antigo)
// ou com BLOB_STORE_ID (formato novo, a Vercel autentica sozinha)
const BLOB_CONECTADO = !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

let redis = null;
async function getRedis() {
  if (!REDIS_URL || !REDIS_TOKEN) return null;
  if (!redis) {
    const { Redis } = await import("@upstash/redis");
    redis = new Redis({ url: REDIS_URL, token: REDIS_TOKEN });
  }
  return redis;
}

// ── Modo local ───────────────────────────────────────────
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "portal.json");
const FILES_DIR = path.join(DATA_DIR, "arquivos");

function garantirPastas() {
  fs.mkdirSync(FILES_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify(VAZIO, null, 2));
}

function faltaConfig(servico) {
  return new Error(
    `Área do cliente sem ${servico}. Conecte o ${servico} em Storage, no painel da Vercel, e faça um novo deploy.`
  );
}

// ── Dados ────────────────────────────────────────────────
export async function lerDB() {
  const r = await getRedis();
  if (r) return (await r.get(KEY)) || { ...VAZIO };
  if (ON_VERCEL) throw faltaConfig("Upstash Redis");
  garantirPastas();
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

export async function salvarDB(db) {
  const r = await getRedis();
  if (r) {
    await r.set(KEY, db);
    return;
  }
  if (ON_VERCEL) throw faltaConfig("Upstash Redis");
  garantirPastas();
  const tmp = DB_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE); // grava de forma atômica
}

// ── PDFs ─────────────────────────────────────────────────
// Na Vercel o PDF vai para o Blob em modo privado (só o servidor consegue ler).
// Se o Blob tiver sido criado como público, salva com nome aleatório impossível
// de adivinhar. Nos dois casos o endereço nunca é mostrado ao cliente: o PDF
// sempre passa pela rota /api/portal/arquivos, que confere quem está logado.
export async function salvarArquivo(nome, buffer) {
  if (BLOB_CONECTADO) {
    const { put } = await import("@vercel/blob");
    const opcoes = { contentType: "application/pdf", addRandomSuffix: true };
    try {
      const blob = await put(`propostas/${nome}`, buffer, { ...opcoes, access: "private" });
      return `private|${blob.url}`;
    } catch (erroPrivado) {
      try {
        const blob = await put(`propostas/${nome}`, buffer, { ...opcoes, access: "public" });
        return `public|${blob.url}`;
      } catch (erroPublico) {
        console.error("Blob (privado):", erroPrivado);
        console.error("Blob (público):", erroPublico);
        throw new Error(`Falha ao salvar o PDF no Vercel Blob: ${erroPrivado.message}`);
      }
    }
  }
  if (ON_VERCEL) throw faltaConfig("Vercel Blob");
  garantirPastas();
  fs.writeFileSync(path.join(FILES_DIR, nome), buffer);
  return nome;
}

export async function lerArquivo(nome) {
  if (!nome) return null;
  const [access, url] = nome.split("|");
  if (url && (access === "private" || access === "public")) {
    const { get } = await import("@vercel/blob");
    const resultado = await get(url, { access, useCache: false });
    if (!resultado || resultado.statusCode !== 200) return null;
    return Buffer.from(await new Response(resultado.stream).arrayBuffer());
  }
  const caminho = path.join(FILES_DIR, path.basename(nome));
  if (!fs.existsSync(caminho)) return null;
  return fs.readFileSync(caminho);
}

// Apaga PDFs (usado ao excluir um documento ou um cliente).
// Se algum arquivo já não existir, segue em frente sem erro.
export async function apagarArquivos(nomes) {
  const lista = nomes.filter(Boolean);
  if (!lista.length) return;
  const urls = lista.map((n) => n.split("|")[1]).filter(Boolean);
  if (urls.length) {
    try {
      const { del } = await import("@vercel/blob");
      await del(urls);
    } catch (e) {
      console.error("Não foi possível apagar PDFs do Blob:", e);
    }
  }
  for (const n of lista) {
    if (n.includes("|")) continue;
    const caminho = path.join(FILES_DIR, path.basename(n));
    try { fs.unlinkSync(caminho); } catch {}
  }
}
