import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { AppError } from "@/lib/errors";

export async function storeImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new AppError("Choose a picture file.");
  }
  if (file.size > 1_500_000) {
    throw new AppError("Picture must be under 1.5 MB.");
  }
  const ext = file.type.includes("png") ? "png" : file.type.includes("webp") ? "webp" : "jpg";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  return `/uploads/${name}`;
}

export async function imageFromForm(formData: FormData, field = "image"): Promise<string | undefined> {
  const file = formData.get(field);
  if (!(file instanceof File) || file.size === 0) {
    return undefined;
  }
  return storeImage(file);
}
