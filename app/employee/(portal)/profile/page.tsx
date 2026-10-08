import { passwordAction, profileAction } from "@/actions/ops";
import { Notice } from "@/components/notice";
import { requirePage } from "@/lib/auth";

export const metadata = { title: "Profile" };

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ error?: string; notice?: string }> }) {
  const user = await requirePage(["EMPLOYEE", "OWNER"], "/employee/login");
  const params = await searchParams;
  return (
    <div className="grid max-w-lg gap-6">
      <h1 className="font-display text-3xl">Profile</h1>
      <Notice error={params.error} notice={params.notice} />
      <form action={profileAction} className="grid gap-3 rounded-md bg-white p-4">
        <input name="name" defaultValue={user.name} aria-label="Name" className="min-h-11 rounded-md border px-3" />
        <input name="phone" defaultValue={user.phone ?? ""} aria-label="Phone" className="min-h-11 rounded-md border px-3" />
        <button className="min-h-11 rounded-md bg-brand-ink font-semibold text-white">Save profile</button>
      </form>
      <form action={passwordAction} className="grid gap-3 rounded-md bg-white p-4">
        <h2 className="font-semibold">Change password</h2>
        <input name="currentPassword" type="password" required aria-label="Current password" className="min-h-11 rounded-md border px-3" />
        <input name="nextPassword" type="password" required aria-label="New password" className="min-h-11 rounded-md border px-3" />
        <button className="min-h-11 rounded-md border">Update password</button>
      </form>
    </div>
  );
}
