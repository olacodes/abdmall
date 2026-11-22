"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "product-images";
const MAX_BYTES = 20 * 1024 * 1024;
const MAX_EDGE = 1200; // 3x density on a ~400pt phone view
const JPEG_QUALITY = 0.72;

/**
 * Shrinks a photo in the browser before it is uploaded.
 *
 * Phone cameras produce 2–5 MB files, and uploading them untouched is how the
 * catalogue ended up at 93 MB. The web storefront hid that because next/image
 * resizes on the fly, but the mobile app fetches the stored file, so a grid of
 * ten products was 20 MB and the photos simply never arrived over mobile data.
 * Supabase image transformation would solve it server-side but is a paid
 * feature, so the file has to be the right size before it lands.
 *
 * Returns the original untouched if shrinking would not help.
 */
async function shrink(file: File): Promise<File> {
  try {
    // from-image honours EXIF rotation — without it, photos taken in portrait
    // on a phone come out on their side.
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    // JPEG has no alpha; without this, anything transparent turns black.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    // Anything unexpected — an exotic format, a browser without canvas
    // encoding — and we upload what we were given rather than fail.
    return file;
  }
}

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
        `That image is ${(file.size / 1024 / 1024).toFixed(1)}MB — keep it under 20MB.`,
      );
      return;
    }

    setBusy(true);
    const toUpload = await shrink(file);
    const supabase = createClient();
    const ext = toUpload.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, toUpload, { cacheControl: "3600", upsert: false });

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
