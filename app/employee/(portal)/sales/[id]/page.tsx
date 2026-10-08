import Link from "next/link";
import { PrintButton } from "@/components/print-button";
import { notFound } from "next/navigation";
import { paymentMethodLabel, paymentStatusLabel } from "@/lib/labels";
import { formatKsh, parseMoneyToCents } from "@/lib/domain/money";
import { buildOrderMessage, whatsappUrl } from "@/lib/domain/whatsapp";
import { getSale } from "@/services/sales";
import { getSettings, getWhatsappNumber } from "@/services/settings";

export const metadata = { title: "Receipt" };

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const sale = await getSale((await params).id);
  if (!sale) {
    notFound();
  }
  const settings = await getSettings();
  const message = buildOrderMessage({
    businessName: settings.businessName,
    customerName: sale.customer,
    phone: sale.customerPhone ?? "",
    orderNumber: sale.saleNumber,
    lines: sale.items.map((item) => ({ name: item.name, quantity: item.quantity, unitPrice: formatKsh(parseMoneyToCents(item.unitPrice)), subtotal: formatKsh(parseMoneyToCents(item.subtotal)) })),
    total: formatKsh(parseMoneyToCents(sale.total)),
    deliveryMethod: "PICKUP",
    notes: `Paid ${formatKsh(parseMoneyToCents(sale.amountPaid))} · Balance ${formatKsh(parseMoneyToCents(sale.balance))} · ${paymentMethodLabel[sale.method]}`,
  });
  const phone = sale.customerPhone || (await getWhatsappNumber());
  return (
    <div className="mx-auto max-w-lg rounded-md bg-white p-6 print:shadow-none">
      <p className="text-sm">Sale completed</p>
      <h1 className="font-display text-3xl">{settings.businessName}</h1>
      <p>{sale.saleNumber}</p>
      <p>{sale.createdAt.toLocaleString("en-KE")}</p>
      <p>Served by {sale.employee}</p>
      <p>Customer {sale.customer}</p>
      <ul className="my-4 divide-y">
        {sale.items.map((item) => (
          <li key={item.name} className="flex justify-between py-2">
            <span>{item.name} × {item.quantity}</span>
            <span>KSh {item.subtotal}</span>
          </li>
        ))}
      </ul>
      <p>Total KSh {sale.total}</p>
      <p>Amount paid KSh {sale.amountPaid}</p>
      <p>Balance KSh {sale.balance}</p>
      <p>{paymentMethodLabel[sale.method]} · {paymentStatusLabel[sale.status]}</p>
      <p className="mt-4 text-sm">{settings.receiptFooter}</p>
      <div className="mt-6 flex flex-wrap gap-2 print:hidden">
        <a href={`/employee/sales/${sale.id}/receipt`} className="inline-flex min-h-11 items-center rounded-md border px-3">Download PDF</a>
        <a href={whatsappUrl(phone, message)} className="inline-flex min-h-11 items-center rounded-md border px-3">Send receipt via WhatsApp</a>
        <Link href="/employee/sales/new" className="inline-flex min-h-11 items-center rounded-md bg-brand-ink px-3 font-semibold text-white">New sale</Link>
        <PrintButton />
      </div>
    </div>
  );
}
