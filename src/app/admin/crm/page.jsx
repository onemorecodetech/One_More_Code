import PortalShell from "@/components/portal/shell";
import PainelCRM from "@/components/crm/painel";
import { exigirAdmin } from "@/lib/portal/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "CRM Comercial | OneMoreCode", robots: { index: false, follow: false } };

export default async function CRMPage() {
  await exigirAdmin();
  return <PortalShell><PainelCRM /></PortalShell>;
}
