// Armazenamento chave-valor para notificações, fila de e-mails e controles.
// Na Vercel: Upstash Redis (o mesmo da área do cliente), compartilhado entre servidores.
// No computador: arquivo data/kv.json (só para testes locais).
import fs from "fs";
import path from "path";

const URL_R = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN_R = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const ARQ = path.join(process.cwd(), "data", "kv.json");

let redis = null;
async function r() {
  if (!URL_R || !TOKEN_R) return null;
  if (!redis) {
    const { Redis } = await import("@upstash/redis");
    redis = new Redis({ url: URL_R, token: TOKEN_R, automaticDeserialization: false });
  }
  return redis;
}

function falta() {
  if (process.env.VERCEL) throw new Error("Notificações sem Upstash Redis configurado.");
}

// ── modo local (arquivo) ──
function ler() {
  try {
    const d = JSON.parse(fs.readFileSync(ARQ, "utf-8"));
    const agora = Date.now();
    for (const k of Object.keys(d)) if (d[k].exp && d[k].exp < agora) delete d[k];
    return d;
  } catch { return {}; }
}
function gravar(d) {
  fs.mkdirSync(path.dirname(ARQ), { recursive: true });
  fs.writeFileSync(ARQ + ".tmp", JSON.stringify(d));
  fs.renameSync(ARQ + ".tmp", ARQ);
}

const enc = (v) => JSON.stringify(v);
const dec = (v) => { if (v == null) return null; try { return JSON.parse(v); } catch { return v; } };

export async function get(key) {
  const c = await r(); if (c) return dec(await c.get(key));
  falta(); return ler()[key]?.v ?? null;
}

export async function set(key, valor, ttlSeg) {
  const c = await r(); if (c) return ttlSeg ? c.set(key, enc(valor), { ex: ttlSeg }) : c.set(key, enc(valor));
  falta(); const d = ler(); d[key] = { v: valor, exp: ttlSeg ? Date.now() + ttlSeg * 1000 : 0 }; gravar(d);
}

// Grava só se a chave não existir. Devolve true se gravou (usado para evitar duplicidade)
export async function setNX(key, valor, ttlSeg) {
  const c = await r(); if (c) return (await c.set(key, enc(valor), { nx: true, ex: ttlSeg })) === "OK";
  falta(); const d = ler(); if (d[key]) return false;
  d[key] = { v: valor, exp: Date.now() + ttlSeg * 1000 }; gravar(d); return true;
}

export async function del(key) {
  const c = await r(); if (c) return c.del(key);
  falta(); const d = ler(); delete d[key]; gravar(d);
}

export async function incr(key, ttlSeg) {
  const c = await r();
  if (c) { const n = await c.incr(key); if (n === 1 && ttlSeg) await c.expire(key, ttlSeg); return n; }
  falta(); const d = ler(); const n = (Number(d[key]?.v) || 0) + 1;
  d[key] = { v: n, exp: d[key]?.exp || (ttlSeg ? Date.now() + ttlSeg * 1000 : 0) }; gravar(d); return n;
}

// Hash: guarda vários itens numa chave (notificações, fila de e-mails)
export async function hset(key, campo, valor) {
  const c = await r(); if (c) return c.hset(key, { [campo]: enc(valor) });
  falta(); const d = ler(); d[key] = d[key] || { v: {} }; d[key].v[campo] = valor; gravar(d);
}
export async function hgetall(key) {
  const c = await r();
  if (c) {
    // Sem desserialização automática, o Upstash devolve [campo, valor, campo, valor...]
    const bruto = (await c.hgetall(key)) || [];
    const pares = Array.isArray(bruto) ? bruto : Object.entries(bruto).flat();
    const obj = {};
    for (let i = 0; i + 1 < pares.length; i += 2) obj[pares[i]] = dec(pares[i + 1]);
    return obj;
  }
  falta(); return ler()[key]?.v || {};
}
export async function hdel(key, ...campos) {
  if (!campos.length) return;
  const c = await r(); if (c) return c.hdel(key, ...campos);
  falta(); const d = ler(); if (d[key]) { for (const f of campos) delete d[key].v[f]; gravar(d); }
}

// Substitui a lista inteira (usado na limpeza de dados antigos)
export async function substituirLista(key, itens) {
  const c = await r();
  if (c) { await c.del(key); for (const x of [...itens].reverse()) await c.lpush(key, enc(x)); return; }
  falta(); const d = ler(); d[key] = { v: itens }; gravar(d);
}

// Lista com tamanho máximo (histórico)
export async function lpushTrim(key, valor, max) {
  const c = await r(); if (c) { await c.lpush(key, enc(valor)); return c.ltrim(key, 0, max - 1); }
  falta(); const d = ler(); const l = d[key]?.v || []; l.unshift(valor); d[key] = { v: l.slice(0, max) }; gravar(d);
}
export async function lrange(key, n) {
  const c = await r(); if (c) return ((await c.lrange(key, 0, n - 1)) || []).map(dec);
  falta(); return (ler()[key]?.v || []).slice(0, n);
}
