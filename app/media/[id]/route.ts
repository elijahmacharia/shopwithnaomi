import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const file = await prisma.storedFile.findUnique({ where: { id: (await context.params).id } });
  if (!file) {
    return new NextResponse("Picture not found", { status: 404 });
  }
  return new NextResponse(Buffer.from(file.bytes), {
    headers: {
      "Content-Type": file.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
