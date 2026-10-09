// Senhas com scrypt e sessão em cookie assinado (sem dependências extras).
import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { lerDB } from "./storage";

const COOKIE = "omc_sessao";
const DURACAO = 60 * 60 * 24 * 7; // 7 dias, em segundos

// Nenhuma senha ou chave fica escrita no código: tudo vem de variáveis de ambiente.
// Na Vercel: Settings > Environment Variables. No computador: arquivo .env.local.
const SECRET = process.env.SESSION_SECRET || null;

// Mensagem clara quando falta alguma configuração (null = tudo certo)
export function faltaConfiguracao({ admin = false } = {}) {
  const faltando = [];
  if (!SECRET || SECRET.length < 32) faltando.push("SESSION_SECRET (mínimo 32 caracteres)");
  if (admin && !process.env.ADMIN_USER) faltando.push("ADMIN_USER");
  if (admin && !process.env.ADMIN_PASSWORD) faltando.push("ADMIN_PASSWORD");
  if (!faltando.length) return null;
  return `Login não configurado. Falta: ${faltando.join(", ")}. Cadastre nas variáveis de ambiente (ou no .env.local, no computador).`;
}

export function hashSenha(senha) {
  const salt = crypto.randomBytes(16).toString("hex");
  return `${salt}:${crypto.scryptSync(senha, salt, 64).toString("hex")}`;
}

export function conferirSenha(senha, armazenado) {
  const [salt, hash] = String(armazenado || "").split(":");
  if (!salt || !hash) return false;
  const a = Buffer.from(hash, "hex");
  const b = crypto.scryptSync(senha, salt, 64);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function iguais(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

function assinar(valor) {
  return crypto.createHmac("sha256", SECRET).update(valor).digest("base64url");
}

export function iniciarSessao(dados) {
  if (!SECRET) throw new Error("SESSION_SECRET não configurado");
  const payload = Buffer.from(
    JSON.stringify({ ...dados, exp: Date.now() + DURACAO * 1000 })
  ).toString("base64url");
  cookies().set(COOKIE, `${payload}.${assinar(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACAO,
  });
}

export function encerrarSessao() {
  cookies().set(COOKIE, "", { path: "/", maxAge: 0 });
}

export function lerSessao() {
  const token = cookies().get(COOKIE)?.value;
  if (!SECRET || !token) return null;
  const [payload, assinatura] = token.split(".");
  if (!payload || !assinatura || !iguais(assinatura, assinar(payload))) return null;
  try {
    const dados = JSON.parse(Buffer.from(payload, "base64url").toString());
    return dados.exp > Date.now() ? dados : null;
  } catch {
    return null;
  }
}

// Devolve o cliente logado, ou null se não houver sessão
// ou se o cliente foi excluído (a sessão antiga deixa de valer)
export async function clienteLogado() {
  const sessao = lerSessao();
  if (sessao?.tipo !== "cliente") return null;
  const db = await lerDB();
  return db.clientes.find((c) => c.id === sessao.id) || null;
}

// Usado nas páginas: devolve o cliente logado ou manda para o login
export async function exigirCliente() {
  const sessao = lerSessao();
  if (sessao?.tipo !== "cliente") redirect("/cliente/entrar");
  const db = await lerDB();
  const cliente = db.clientes.find((c) => c.id === sessao.id);
  if (!cliente) redirect("/cliente/entrar");
  return { cliente, db };
}

export async function exigirAdmin() {
  const sessao = lerSessao();
  if (sessao?.tipo !== "admin") redirect("/admin/entrar");
  return { db: await lerDB() };
}

// Login do admin: somente pelas variáveis ADMIN_USER e ADMIN_PASSWORD
export function credenciaisAdminConferem(usuario, senha) {
  const u = process.env.ADMIN_USER;
  const s = process.env.ADMIN_PASSWORD;
  if (!u || !s) return false;
  return iguais(usuario, u) && iguais(senha, s);
}
