"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "product-images";
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Uploads straight from the browser to Supabase Storage, then hands the public
 * URL to the form as a hidden field. The file never passes through the Next
 * server — the browser client already holds the session, and the bucket's RLS
 * policy only lets admins write.
 *
 * Replacing a photo leaves the old object in the bucket on purpose: order_items
 * snapshots image_url at purchase time, so deleting it would blank the picture
 * on past orders.
 */
export function ImageField({
  initialUrl,
  label = "Photo",
  emptyHint = "No photo — the swatch gradient shows instead",
}: {
  initialUrl: string | null;
  label?: string;
  emptyHint?: string;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("That's not an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(
        `That image is ${(file.size / 1024 / 1024).toFixed(1)}MB — keep it under 5MB.`,
      );
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      setBusy(false);
      setError(uploadError.message);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(path);
    setUrl(publicUrl);
    setBusy(false);
  }

  return (
    <div className="space-y-2">
      <span className="block text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      <input type="hidden" name="image_url" value={url ?? ""} />

      <div className="flex items-start gap-4">
        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-surface-2">
          {url ? (
            <Image
              src={url}
              alt=""
              width={112}
              height={112}
              className="h-28 w-28 object-cover"
              unoptimized
            />
          ) : (
            <span className="px-2 text-center text-xs text-faint">
              {emptyHint}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
            className="block w-full text-sm text-muted file:mr-3 file:cursor-pointer file:rounded-full file:border file:border-line-strong file:bg-surface file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink hover:file:bg-surface-2"
          />
          {busy ? <p className="text-xs text-muted">Uploading…</p> : null}
          {error ? <p className="text-xs text-sale">{error}</p> : null}
          {url && !busy ? (
            <button
              type="button"
              onClick={() => {
                setUrl(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="text-xs font-semibold text-muted underline hover:text-sale"
            >
              Remove photo
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
