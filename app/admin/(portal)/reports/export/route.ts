import ExcelJS from "exceljs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";
import { profitReport } from "@/services/reports";
import { listSales } from "@/services/sales";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const from = url.searchParams.get("from") ?? undefined;
  const to = url.searchParams.get("to") ?? undefined;
  const report = await profitReport({ from, to });
  const sales = await listSales({ from, to, page: "1" });
  if (url.searchParams.get("format") === "xlsx") {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sales");
    sheet.columns = [
      { header: "Sale", key: "sale", width: 16 },
      { header: "Date", key: "date", width: 16 },
      { header: "Employee", key: "employee", width: 20 },
      { header: "Customer", key: "customer", width: 20 },
      { header: "Total", key: "total", width: 14 },
      { header: "Status", key: "status", width: 16 },
    ];
    for (const sale of sales.sales) {
      sheet.addRow({ sale: sale.saleNumber, date: sale.createdAt.toISOString().slice(0, 10), employee: sale.employee, customer: sale.customer, total: sale.total, status: sale.status });
    }
    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=shop-with-naome-sales.xlsx",
      },
    });
  }
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  page.drawText("SHOP WITH NÁOMÉ", { x: 40, y: 800, size: 18, font, color: rgb(0.12, 0.1, 0.29) });
  page.drawText("Sales report", { x: 40, y: 770, size: 14, font });
  page.drawText(`Revenue KSh ${report.revenue}`, { x: 40, y: 740, size: 12, font });
  page.drawText(`COGS KSh ${report.cogs}`, { x: 40, y: 720, size: 12, font });
  page.drawText(`Gross profit KSh ${report.gross}`, { x: 40, y: 700, size: 12, font });
  page.drawText(`Expenses KSh ${report.expenses}`, { x: 40, y: 680, size: 12, font });
  page.drawText(`Net profit KSh ${report.net}`, { x: 40, y: 660, size: 12, font });
  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": "attachment; filename=shop-with-naome-report.pdf" },
  });
}
