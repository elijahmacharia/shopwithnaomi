import { readNotificationAction } from "@/actions/ops";
import { listNotifications } from "@/services/notifications";

export const metadata = { title: "Alerts" };

export default async function AdminNotificationsPage() {
  const data = await listNotifications();
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Alerts ({data.unread} unread)</h1>
        <form action={readNotificationAction}><input type="hidden" name="id" value="all" /><input type="hidden" name="next" value="/admin/notifications" /><button className="min-h-11 rounded-md border px-3">Mark all as read</button></form>
      </div>
      <ul className="mt-4 divide-y rounded-md border bg-white">
        {data.notifications.map((item) => (
          <li key={item.id} className="px-4 py-3">
            <p className="font-semibold">{item.title}</p>
            <p>{item.message}</p>
            {!item.isRead && <form action={readNotificationAction}><input type="hidden" name="id" value={item.id} /><input type="hidden" name="next" value="/admin/notifications" /><button className="min-h-11 text-sm">Mark read</button></form>}
          </li>
        ))}
      </ul>
    </div>
  );
}
