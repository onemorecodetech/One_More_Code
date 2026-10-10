import { redirect } from "next/navigation";
import PortalShell from "@/components/portal/shell";
import FormEntrar from "@/components/portal/form-entrar";
import { lerSessao } from "@/lib/portal/auth";
import { card } from "@/components/portal/ui";

export default async function AdminEntrarPage() {
  if ((await lerSessao())?.tipo === "admin") redirect("/admin");
  return (
    <PortalShell>
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8">Propostas e contratos</h1>
        <div className={card}>
          <FormEntrar admin />
        </div>
      </div>
    </PortalShell>
  );
}
