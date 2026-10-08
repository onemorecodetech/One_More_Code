import Link from "next/link";
import Image from "next/image";

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Serviços" },
  { href: "/about", label: "Sobre" },
  { href: "/portfolio", label: "Portfólio" },
  { href: "/contact", label: "Contato" },
  { href: "/cliente", label: "Área do cliente" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0F1A]/70 backdrop-blur-md">
      <nav className="max-w-6xl mx-auto flex items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="OneMoreCode, página inicial">
          <Image
            src="/images/logo.png"
            alt=""
            width={52}
            height={40}
            priority
          />
          <span className="hidden sm:inline text-xl font-bold">
            OneMore<span className="text-blue-500">Code</span>
          </span>
        </Link>

        <div className="flex min-w-0 gap-4 md:gap-8 text-sm md:text-base overflow-x-auto whitespace-nowrap">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white/80 hover:text-white transition"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
