// Gera automaticamente o /sitemap.xml
// Se o domínio mudar, troque só a linha abaixo
const SITE_URL = "https://onemorecode.tech";

export default function sitemap() {
  const pages = [
    { path: "", priority: 1.0 },
    { path: "/services", priority: 0.9 },
    { path: "/portfolio", priority: 0.8 },
    { path: "/about", priority: 0.7 },
    { path: "/contact", priority: 0.8 },
  ];

  return pages.map((page) => ({
    url: `${SITE_URL}${page.path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: page.priority,
  }));
}
