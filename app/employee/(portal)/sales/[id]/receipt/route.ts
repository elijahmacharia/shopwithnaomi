import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";
import { paymentMethodLabel, paymentStatusLabel } from "@/lib/labels";
import { getSale } from "@/services/sales";
import { getSettings } from "@/services/settings";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const sale = await getSale((await context.params).id);
  if (!sale) {
    return new NextResponse("Receipt not found", { status: 404 });
  }
  const settings = await getSettings();
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([420, 640]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  let y = 600;
  const write = (text: string, size = 12) => {
    page.drawText(text.slice(0, 70), { x: 32, y, size, font, color: rgb(0.12, 0.1, 0.29) });
    y -= size + 8;
  };
  write(settings.businessName, 18);
  write(`Receipt ${sale.saleNumber}`);
  write(sale.createdAt.toLocaleString("en-KE"));
  write(`Employee: ${sale.employee}`);
  write(`Customer: ${sale.customer}`);
  for (const item of sale.items) {
    write(`${item.name} x ${item.quantity}  KSh ${item.subtotal}`, 11);
  }
  write(`Total KSh ${sale.total}`);
  write(`Paid KSh ${sale.amountPaid}`);
  write(`Balance KSh ${sale.balance}`);
  write(`${paymentMethodLabel[sale.method]} · ${paymentStatusLabel[sale.status]}`);
  write(settings.receiptFooter, 10);
  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${sale.saleNumber}.pdf"`,
    },
  });
}
