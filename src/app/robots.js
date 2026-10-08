// Gera automaticamente o /robots.txt
// Se o domínio mudar, troque só a linha abaixo
const SITE_URL = "https://onemorecode.tech";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/cliente", "/admin"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
