"use client";

import { useRef } from "react";

export function ConfirmSubmit({
  action,
  id,
  label,
  message,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  label: string;
  message: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" className="min-h-11 text-sm" onClick={() => dialog.current?.showModal()}>
        {label}
      </button>
      <dialog ref={dialog} className="w-[min(100%,24rem)] rounded-md border border-brand-soft p-4">
        <p>{message}</p>
        <form action={action} className="mt-4 flex gap-2">
          <input type="hidden" name="id" value={id} />
          <button className="min-h-11 rounded-md bg-brand-ink px-3 font-semibold text-white" type="submit">
            {label}
          </button>
          <button type="button" className="min-h-11 rounded-md border px-3" onClick={() => dialog.current?.close()}>
            Cancel
          </button>
        </form>
      </dialog>
    </>
  );
}
