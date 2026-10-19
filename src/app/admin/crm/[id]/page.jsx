import PortalShell from "@/components/portal/shell";
import LeadDetalhe from "@/components/crm/lead-detalhe";
import { exigirAdmin } from "@/lib/portal/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Empresa | CRM OneMoreCode", robots: { index: false, follow: false } };

export default async function LeadPage(props) {
  await exigirAdmin();
  const { id } = await props.params;
  return <PortalShell><LeadDetalhe id={id} /></PortalShell>;
}
