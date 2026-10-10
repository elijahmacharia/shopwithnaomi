import { passwordAction, profileAction } from "@/actions/ops";
import { Notice } from "@/components/notice";
import { requirePage } from "@/lib/auth";

export const metadata = { title: "Profile" };

export default async function AdminProfilePage({ searchParams }: { searchParams: Promise<{ error?: string; notice?: string }> }) {
  const user = await requirePage("OWNER", "/admin/login");
  const params = await searchParams;
  return (
    <div className="grid max-w-lg gap-6">
      <div>
        <h1 className="font-display text-3xl">Profile</h1>
        <p className="mt-2 text-sm text-brand-muted">Signed in as the owner.</p>
      </div>
      <Notice error={params.error} notice={params.notice} />
      <form action={profileAction} className="grid gap-3 rounded-2xl border border-brand-soft bg-white p-4 shadow-card">
        <input type="hidden" name="returnTo" value="/admin/profile" />
        <label className="grid gap-1 text-sm">
          Name
          <input name="name" defaultValue={user.name} required className="min-h-11 rounded-xl border border-brand-soft px-3" />
        </label>
        <label className="grid gap-1 text-sm">
          Phone
          <input name="phone" defaultValue={user.phone ?? ""} className="min-h-11 rounded-xl border border-brand-soft px-3" />
        </label>
        <button className="min-h-11 rounded-xl bg-brand-primary font-semibold text-brand-ink">Save profile</button>
      </form>
      <form action={passwordAction} className="grid gap-3 rounded-2xl border border-brand-soft bg-white p-4 shadow-card">
        <input type="hidden" name="returnTo" value="/admin/profile" />
        <h2 className="font-semibold">Change password</h2>
        <label className="grid gap-1 text-sm">
          Current password
          <input name="currentPassword" type="password" required className="min-h-11 rounded-xl border border-brand-soft px-3" />
        </label>
        <label className="grid gap-1 text-sm">
          New password
          <input name="nextPassword" type="password" required className="min-h-11 rounded-xl border border-brand-soft px-3" />
        </label>
        <button className="min-h-11 rounded-xl border border-brand-soft">Update password</button>
      </form>
    </div>
  );
}
