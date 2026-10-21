import { linkWhatsApp } from "@/lib/portal/util";

// Botão para falar com a OneMoreCode pelo WhatsApp (disponível em toda a área do cliente)
export default function ContatoWhatsApp({ mensagem = "Olá! Vim pela área do cliente da OneMoreCode.", compacto = false, className = "" }) {
  return (
    <a
      href={linkWhatsApp(mensagem)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a OneMoreCode pelo WhatsApp"
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 font-semibold text-white transition hover:bg-emerald-800 ${compacto ? "h-11 px-4 text-sm" : "min-h-12 px-6"} ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.5h-.01a9.5 9.5 0 0 1-4.84-1.33l-.35-.2-3.6.94.96-3.5-.23-.36a9.46 9.46 0 0 1-1.45-5.05c0-5.24 4.27-9.5 9.52-9.5 2.54 0 4.93 1 6.73 2.79a9.43 9.43 0 0 1 2.78 6.72c0 5.24-4.27 9.5-9.51 9.5m8.1-17.6A11.4 11.4 0 0 0 12.05.53C5.73.53.6 5.66.6 11.97c0 2.02.53 3.99 1.53 5.72L.5 23.67l6.13-1.6a11.43 11.43 0 0 0 5.42 1.38h.01c6.31 0 11.45-5.13 11.45-11.45 0-3.06-1.19-5.93-3.36-8.1" />
      </svg>
      {compacto ? "WhatsApp" : "Falar no WhatsApp"}
    </a>
  );
}
