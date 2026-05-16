"use client";
import { useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UploadResult {
  url: string;
  name: string;
  type: string;
  size: number;
}

interface Props {
  onUpload: (result: UploadResult) => void;
  accept?: string;
  label?: string;
  bucket?: string;
  folder?: string;
}

export default function SupabaseUpload({
  onUpload,
  accept = "video/*,application/pdf,image/*",
  label = "Файл сонгох",
  bucket = "AuraLearn",
  folder = "uploads",
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [error, setError]         = useState("");
  const [fileName, setFileName]   = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setProgress(0);
    setFileName(file.name);

    try {
      const ext  = file.name.split(".").pop();
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 10, 90));
      }, 200);

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { cacheControl: "3600", upsert: false });

      clearInterval(progressInterval);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      setProgress(100);
      onUpload({
        url:  publicUrl,
        name: file.name,
        type: file.type,
        size: file.size,
      });

      setTimeout(() => {
        setUploading(false);
        setProgress(0);
        setFileName("");
      }, 1000);

    } catch (err: any) {
      setError(err.message || "Upload failed");
      setUploading(false);
      setProgress(0);
    }

    // Reset input
    if (inputRef.current) inputRef.current.value = "";
  }

  const isDark = typeof window !== "undefined" &&
    document.documentElement.getAttribute("data-theme") === "dark";

  return (
    <div style={{ width: "100%" }}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFile}
        style={{ display: "none" }}
        disabled={uploading}
      />

      {!uploading ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          style={{
            width: "100%", height: "38px",
            background: "transparent",
            border: "1px dashed #555",
            borderRadius: "8px",
            color: "#888", fontSize: "13px",
            cursor: "pointer",
            display: "flex", alignItems: "center",
            justifyContent: "center", gap: "8px",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "#888";
            e.currentTarget.style.color = "#aaa";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "#555";
            e.currentTarget.style.color = "#888";
          }}
        >
          <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: "14px" }} />
          {label}
        </button>
      ) : (
        <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid #1e1e1e", borderRadius: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ color: "#888", fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>{fileName}</span>
            <span style={{ color: "#34d399", fontSize: "12px", fontWeight: 600 }}>{progress}%</span>
          </div>
          <div style={{ height: "3px", background: "#1a1a1a", borderRadius: "2px" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "#34d399", borderRadius: "2px", transition: "width 0.2s" }} />
          </div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: "6px", color: "#f87171", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
          <i className="fa-solid fa-circle-exclamation" />
          {error}
        </div>
      )}
    </div>
  );
}
