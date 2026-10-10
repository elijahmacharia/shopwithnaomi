import { PortalShell, type PortalLink } from "@/components/portal-shell";

export function PortalFrame({
  title,
  role,
  userName,
  unread,
  alertsHref,
  links,
  children,
}: {
  title: string;
  role: string;
  userName: string;
  unread: number;
  alertsHref: string;
  links: PortalLink[];
  children: React.ReactNode;
}) {
  return (
    <PortalShell title={title} role={role} userName={userName} unread={unread} alertsHref={alertsHref} links={links}>
      {children}
    </PortalShell>
  );
}
