"use client";
import { useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Props {
  accept?: string;
  bucket?: string;
  folder?: string;
  onUpload: (url: string) => void;
  label?: string;
}

export default function SupabaseUpload({ accept = "*", bucket = "AuraLearn", folder = "uploads", onUpload, label }: Props) {
  const { isDark } = useTheme();
  const { lang } = useLang();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]  = useState(0);
  const [error, setError]        = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const t = (mn: string, en: string) => lang === "mn" ? mn : en;

  const TEXT  = isDark ? "#fff" : "#1a1a1a";
  const MUTED = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
  const RULE  = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const BG    = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true); setError(""); setProgress(10);

    try {
      const ext  = file.name.split(".").pop();
      const name = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      setProgress(30);

      const { data, error: upErr } = await supabase.storage
        .from(bucket)
        .upload(name, file, { upsert: true });

      if (upErr) throw upErr;

      setProgress(80);

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(name);

      setProgress(100);
      onUpload(publicUrl);
      setTimeout(() => { setProgress(0); setUploading(false); }, 800);
    } catch (err: any) {
      setError(err.message || t("Upload алдаа", "Upload failed"));
      setUploading(false); setProgress(0);
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept={accept} onChange={handleFile} style={{ display: "none" }} id="supabase-upload"/>
      <label htmlFor="supabase-upload" style={{
        display: "inline-flex", alignItems: "center", gap: "7px",
        padding: "7px 16px", border: `1px solid ${RULE}`,
        background: uploading ? BG : "transparent",
        color: uploading ? MUTED : TEXT,
        borderRadius: "100px", cursor: uploading ? "not-allowed" : "pointer",
        fontSize: "12px", fontFamily: "inherit", transition: "all 0.15s",
        pointerEvents: uploading ? "none" : "auto",
      }}>
        {uploading
          ? <><i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "11px" }}/> {progress}%</>
          : <><i className="fa-solid fa-arrow-up-from-bracket" style={{ fontSize: "11px" }}/> {label || t("Файл upload", "Upload file")}</>
        }
      </label>
      {/* Progress bar */}
      {uploading && (
        <div style={{ marginTop: "6px", height: "1px", background: RULE, width: "100%", borderRadius: "1px" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "#22c55e", transition: "width 0.3s", borderRadius: "1px" }}/>
        </div>
      )}
      {error && <div style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>{error}</div>}
    </div>
  );
}
