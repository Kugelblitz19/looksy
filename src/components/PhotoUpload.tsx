"use client";

import { useCallback, useRef } from "react";

export interface UploadedPhoto {
  id: string;
  file: File;
  url: string;
}

interface Props {
  photos: UploadedPhoto[];
  onChange: (photos: UploadedPhoto[]) => void;
  max?: number;
  hint?: string;
}

export default function PhotoUpload({ photos, onChange, max = 4, hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const incoming = Array.from(fileList)
        .filter((f) => f.type.startsWith("image/"))
        .map((f) => ({
          id: `${f.name}-${f.size}-${f.lastModified}`,
          file: f,
          url: URL.createObjectURL(f),
        }));
      const merged = [...photos];
      for (const p of incoming) {
        if (merged.length >= max) break;
        if (!merged.some((m) => m.id === p.id)) merged.push(p);
      }
      onChange(merged);
    },
    [photos, onChange, max],
  );

  const remove = (id: string) => {
    const target = photos.find((p) => p.id === id);
    if (target) URL.revokeObjectURL(target.url);
    onChange(photos.filter((p) => p.id !== id));
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-ink-60">
          Your photo{photos.length > 1 ? "s" : ""}
        </label>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-30">
          {photos.length}/{max} · optional
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {photos.map((p) => (
          <div
            key={p.id}
            className="group relative h-24 w-24 overflow-hidden border border-ink/15"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.url}
              alt="upload preview"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => remove(p.id)}
              className="absolute right-1 top-1 grid h-6 w-6 place-items-center bg-paper/85 text-ink opacity-0 transition group-hover:opacity-100"
              aria-label="Remove photo"
            >
              ✕
            </button>
          </div>
        ))}

        {photos.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="grid h-24 w-24 place-items-center border border-dashed border-ink/25 bg-paper-2 text-center text-xs text-ink-30 transition hover:border-ink hover:text-ink-60"
          >
            <span>
              <span className="block text-2xl">＋</span>
              Add photo
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <p className="mt-2 font-serif text-xs italic text-ink-30">
        {hint ??
          "Add a clear selfie so the looks actually look like you. No photo? We’ll cast a model instead."}
      </p>
    </div>
  );
}
