import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4">
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/images/Logo_onemorecode.jpeg"
          alt="OneMoreCode"
          width={50}
          height={50}
        />
        <span className="text-xl font-bold">
          OneMore<span className="text-blue-500">Code</span>
        </span>
      </Link>

      <div className="flex gap-6">
        <Link href="/">Home</Link>
        <Link href="/services">Serviços</Link>
        <Link href="/about">Sobre</Link>
        <Link href="/portfolio">Portfólio</Link>
        <Link href="/contact">Contato</Link>
      </div>
    </nav>
  );
}