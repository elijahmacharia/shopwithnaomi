import { PortalShell, type PortalLink } from "@/components/portal-shell";

export function PortalFrame({
  title,
  role,
  links,
  children,
}: {
  title: string;
  role: string;
  links: PortalLink[];
  children: React.ReactNode;
}) {
  return (
    <PortalShell title={title} role={role} links={links}>
      {children}
    </PortalShell>
  );
}
