"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Serviços" },
  { href: "/about", label: "Sobre" },
  { href: "/portfolio", label: "Portfólio" },
  { href: "/contact", label: "Contato" },
];

const AREA_CLIENTE = { href: "/cliente", label: "Área do cliente" };

export default function Navbar() {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  const ativo = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  // Fecha o menu ao trocar de página
  useEffect(() => setAberto(false), [pathname]);

  // Fecha com a tecla Esc e trava a rolagem da página com o menu aberto
  useEffect(() => {
    if (!aberto) return;
    const onKey = (e) => e.key === "Escape" && setAberto(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [aberto]);

  return (
    <>
    {/* Atalho para quem navega pelo teclado: aparece ao apertar Tab */}
    <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-[#0B0F1A]">Pular para o conteúdo</a>
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0F1A]/70 backdrop-blur-md">
      <nav className="relative max-w-6xl mx-auto flex items-center justify-between gap-6 px-6 py-4" aria-label="Principal">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="OneMoreCode, página inicial">
          <Image src="/images/logo.png" alt="" width={52} height={40} priority />
          <span className="text-xl font-bold">
            OneMore<span className="text-blue-500">Code</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={ativo(link.href) ? "page" : undefined}
              className={`transition ${ativo(link.href) ? "text-white" : "text-white/70 hover:text-white"}`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={AREA_CLIENTE.href}
            aria-current={ativo(AREA_CLIENTE.href) ? "page" : undefined}
            className="rounded-xl border border-white/15 px-4 py-2 font-medium text-white/90 transition hover:border-blue-400 hover:text-blue-400"
          >
            {AREA_CLIENTE.label}
          </Link>
        </div>

        {/* Botão hambúrguer (celular) */}
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={aberto}
          aria-controls="menu-mobile"
          className="md:hidden flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 text-white transition hover:border-blue-400"
        >
          <span className="relative block h-4 w-5" aria-hidden="true">
            <span className={`absolute left-0 h-0.5 w-5 rounded bg-current transition-all duration-300 ${aberto ? "top-[7px] rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 top-[7px] h-0.5 w-5 rounded bg-current transition-opacity duration-200 ${aberto ? "opacity-0" : "opacity-100"}`} />
            <span className={`absolute left-0 h-0.5 w-5 rounded bg-current transition-all duration-300 ${aberto ? "top-[7px] -rotate-45" : "top-[14px]"}`} />
          </span>
        </button>
      </nav>

      {/* Menu do celular */}
      <div
        id="menu-mobile"
        className={`md:hidden overflow-hidden border-t border-white/10 bg-[#0B0F1A]/95 backdrop-blur-md transition-[max-height,opacity] duration-300 ${
          aberto ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0 border-transparent"
        }`}
      >
        <ul className="flex flex-col gap-1 px-6 py-4">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                tabIndex={aberto ? 0 : -1}
                aria-current={ativo(link.href) ? "page" : undefined}
                className={`block rounded-xl px-4 py-3.5 text-lg transition ${
                  ativo(link.href) ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="pt-3">
            <Link
              href={AREA_CLIENTE.href}
              tabIndex={aberto ? 0 : -1}
              className="flex min-h-14 items-center justify-center rounded-xl bg-blue-600 text-lg font-semibold text-white transition hover:bg-blue-700"
            >
              {AREA_CLIENTE.label}
            </Link>
          </li>
        </ul>
      </div>
    </header>
    <div id="conteudo" tabIndex={-1} className="outline-none" />
    </>
  );
}
