"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Serviços" },
  { href: "/about", label: "Sobre" },
  { href: "/portfolio", label: "Portfólio" },
  { href: "/contact", label: "Contato" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // Fecha o menu ao voltar para a largura de desktop
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const close = () => media.matches && setOpen(false);
    media.addEventListener("change", close);
    return () => media.removeEventListener("change", close);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F1A]/90 backdrop-blur border-b border-white/10 pt-[env(safe-area-inset-top)]">
      <nav className="max-w-6xl mx-auto flex items-center justify-between gap-4 py-3 md:py-4 pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))]">
        <Link href="/" className="flex items-center gap-3 min-w-0" onClick={() => setOpen(false)}>
          <Image
            src="/images/Logo_onemorecode.jpeg"
            alt="OneMoreCode"
            width={50}
            height={50}
            className="h-10 w-auto md:h-[50px] shrink-0"
          />
          <span className="text-lg md:text-xl font-bold truncate">
            OneMore<span className="text-blue-500">Code</span>
          </span>
        </Link>

        <div className="hidden md:flex gap-6">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-blue-400 transition">
              {link.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center h-11 w-11 -mr-2 rounded-lg hover:bg-white/10 transition"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="md:hidden border-t border-white/10 pb-4 pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))]">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-lg border-b border-white/5 last:border-b-0 hover:text-blue-400 transition"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
    );
  }