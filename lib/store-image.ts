import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { imageMime, MAX_IMAGE_BYTES } from "@/lib/domain/image-file";

export async function storeImage(file: File): Promise<string> {
  if (file.size === 0) {
    throw new AppError("Choose a picture file.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new AppError("Picture must be under 4 MB.");
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = imageMime(bytes);
  if (!mime) {
    throw new AppError("Use a JPEG, PNG, or WebP picture.");
  }
  const stored = await prisma.storedFile.create({ data: { mime, bytes } });
  return `/media/${stored.id}`;
}

export async function imageFromForm(formData: FormData, field = "image"): Promise<string | undefined> {
  const file = formData.get(field);
  if (!(file instanceof File) || file.size === 0) {
    return undefined;
  }
  return storeImage(file);
}
