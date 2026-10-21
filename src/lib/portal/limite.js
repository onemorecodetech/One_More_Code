// Limite de tentativas (contra quem tenta adivinhar senhas).
// Na Vercel usa o Redis (vale para todos os servidores); no computador, a memória.

const memoria = new Map();

async function getRedis() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const { Redis } = await import("@upstash/redis");
  return new Redis({ url, token });
}

// IP de quem fez a requisição (a Vercel informa no cabeçalho x-forwarded-for)
export function ipDe(request) {
  const fwd = request.headers.get("x-forwarded-for") || "";
  return fwd.split(",")[0].trim() || request.headers.get("x-real-ip") || "desconhecido";
}

// Conta uma tentativa. Devolve { bloqueado, restante (em minutos) }
export async function registrarTentativa(chave, { maximo, minutos }) {
  const k = `omc:limite:${chave}`;
  const janela = minutos * 60;
  const r = await getRedis().catch(() => null);
  if (r) {
    const total = await r.incr(k);
    if (total === 1) await r.expire(k, janela);
    const ttl = total > maximo ? await r.ttl(k) : 0;
    return { bloqueado: total > maximo, restante: Math.ceil(Math.max(ttl, 60) / 60) };
  }
  const agora = Date.now();
  const atual = memoria.get(k);
  if (!atual || atual.ate < agora) {
    memoria.set(k, { total: 1, ate: agora + janela * 1000 });
    return { bloqueado: false, restante: 0 };
  }
  atual.total += 1;
  return { bloqueado: atual.total > maximo, restante: Math.ceil((atual.ate - agora) / 60000) };
}

// Zera o contador (ex.: depois de um login certo)
export async function limparTentativas(chave) {
  const k = `omc:limite:${chave}`;
  const r = await getRedis().catch(() => null);
  if (r) await r.del(k);
  else memoria.delete(k);
}

// Lê quantas tentativas já foram registradas, sem somar. Devolve { total, restante (min) }
export async function lerTentativas(chave) {
  const k = `omc:limite:${chave}`;
  const r = await getRedis().catch(() => null);
  if (r) {
    const total = Number(await r.get(k)) || 0;
    const ttl = total ? await r.ttl(k) : 0;
    return { total, restante: Math.ceil(Math.max(ttl, 60) / 60) };
  }
  const atual = memoria.get(k);
  if (!atual || atual.ate < Date.now()) return { total: 0, restante: 0 };
  return { total: atual.total, restante: Math.ceil((atual.ate - Date.now()) / 60000) };
}
