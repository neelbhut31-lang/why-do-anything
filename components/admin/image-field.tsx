"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

export function ImageField({ initialValue = "" }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/upload", { method: "POST", body: form });
    const data = (await response.json()) as { url?: string; error?: string };
    setUploading(false);
    if (!response.ok || !data.url) return window.alert(data.error ?? "Upload failed");
    setValue(data.url);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      void upload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <input type="hidden" name="featuredImage" value={value} />
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => void upload(event.target.files?.[0])} />
      {value ? (
        <div className="relative overflow-hidden rounded-xl">
          <Image src={value} alt="" width={900} height={394} className="aspect-[16/7] w-full object-cover" />
          <button type="button" onClick={() => setValue("")} className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/70 text-white" aria-label="Remove featured image">
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className={`flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-10 text-sm transition ${
            dragActive
              ? "border-moss-500 bg-moss-50/50 text-moss-700 dark:bg-moss-900/20 dark:text-moss-300"
              : "border-black/15 text-black/45 hover:border-moss-500 dark:border-white/15 dark:text-white/40"
          }`}
        >
          <ImagePlus size={18} /> {uploading ? "Uploading…" : dragActive ? "Drop to upload!" : "Choose featured image"}
        </button>
      )}
    </div>
  );
}
