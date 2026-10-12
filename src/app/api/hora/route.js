// Hora oficial do servidor (para o status de atendimento não depender do relógio do aparelho)
export const dynamic = "force-dynamic";
export function GET() {
  return Response.json({ agora: Date.now() }, { headers: { "Cache-Control": "no-store" } });
}
