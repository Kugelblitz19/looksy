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
}

export default function PhotoUpload({ photos, onChange, max = 4 }: Props) {
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
        <label className="text-sm font-medium text-white/80">
          Your photo{photos.length > 1 ? "s" : ""}
        </label>
        <span className="text-xs text-white/40">
          {photos.length}/{max} · optional
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {photos.map((p) => (
          <div
            key={p.id}
            className="group relative h-24 w-24 overflow-hidden rounded-xl border border-line"
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
              className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
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
            className="grid h-24 w-24 place-items-center rounded-xl border border-dashed border-line bg-white/5 text-center text-xs text-white/50 transition hover:border-white/40 hover:text-white/80"
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
      <p className="mt-2 text-xs text-white/40">
        Add a clear selfie so the looks actually look like you. No photo? We’ll
        style a model instead.
      </p>
    </div>
  );
}
