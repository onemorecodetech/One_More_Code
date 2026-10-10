/** @type {import('next').NextConfig} */

const dev = process.env.NODE_ENV !== "production";

// Política de segurança de conteúdo: o navegador só carrega scripts, estilos,
// imagens e conexões das origens listadas aqui. Se um dia o site passar a usar
// outro serviço externo (ex.: Google Analytics), ele precisa entrar nesta lista.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.web3forms.com",
  "frame-src 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(dev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const headers = [
  { key: "Content-Security-Policy", value: csp },
  // Força HTTPS por 2 anos, inclusive em subdomínios
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Impede que outro site abra o seu dentro de um iframe (golpes de clique)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers }];
  },
};

module.exports = nextConfig;
