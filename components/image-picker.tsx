"use client";

import { useId, useRef, useState } from "react";
import { MAX_IMAGE_BYTES } from "@/lib/domain/image-file";

export function ImagePicker({
  name = "image",
  label = "Choose image",
  currentUrl,
}: {
  name?: string;
  label?: string;
  currentUrl?: string | null;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  function assign(file: File | undefined) {
    if (!file) {
      return;
    }
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    const named = /\.(jpe?g|png|webp)$/i.test(file.name);
    if (!allowed.includes(file.type) && !named) {
      setError("Use a JPEG, PNG, or WebP picture.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Picture must be under 4 MB.");
      return;
    }
    const input = inputRef.current;
    if (input && input.files?.[0] !== file) {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      input.files = transfer.files;
    }
    setError("");
    setFileName(file.name);
    setPreview((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return URL.createObjectURL(file);
    });
  }

  function clear() {
    const input = inputRef.current;
    if (input) {
      input.value = "";
    }
    setFileName("");
    setError("");
    setPreview((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return null;
    });
  }

  const shown = preview || currentUrl;

  function openPicker() {
    const input = inputRef.current;
    if (!input) {
      return;
    }
    input.value = "";
    input.click();
  }

  return (
    <div
      className="relative grid gap-2 rounded-xl border border-dashed border-brand-secondary bg-brand-background p-3"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        assign(event.dataTransfer.files?.[0]);
      }}
    >
      <input
        ref={inputRef}
        id={inputId}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        className="pointer-events-none absolute h-px w-px opacity-0"
        tabIndex={-1}
        onChange={(event) => assign(event.target.files?.[0])}
      />
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="inline-flex min-h-11 cursor-pointer items-center rounded-xl bg-brand-primary px-4 text-sm font-semibold text-brand-ink" onClick={openPicker}>
          {label}
        </button>
        {preview ? (
          <button type="button" className="min-h-11 rounded-xl border border-brand-soft bg-white px-3 text-sm" onClick={clear}>
            Remove new picture
          </button>
        ) : currentUrl ? (
          <label className="inline-flex min-h-11 items-center gap-2 text-sm">
            <input type="checkbox" name="removeImage" className="h-4 w-4" />
            Remove current picture
          </label>
        ) : null}
        <span className="text-sm text-brand-muted">{fileName || "JPEG, PNG, or WebP, up to 4 MB"}</span>
      </div>
      {shown ? <img src={shown} alt="" className="h-28 w-28 rounded-xl object-cover" /> : null}
      {error ? <p className="text-sm text-red-800">{error}</p> : null}
    </div>
  );
}
