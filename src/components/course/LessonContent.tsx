"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function CourseActions({ courseId, price, isEnrolled, isLoggedIn }: {
  courseId: string; price: number; isEnrolled: boolean; isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!isLoggedIn) {
    return (
      <Link href="/auth/login" style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)", color: "#fff", padding: "10px 24px", borderRadius: "8px", textDecoration: "none", fontWeight: 600 }}>
        Нэвтрэн суралцах
      </Link>
    );
  }

  if (isEnrolled) {
    return (
      <span style={{ background: "#34d39920", color: "#34d399", padding: "10px 20px", borderRadius: "8px", fontWeight: 600, border: "1px solid #34d39940" }}>
        ✓ Бүртгүүлсэн
      </span>
    );
  }

  if (price === 0) {
    async function handleEnroll() {
      setLoading(true);
      const res = await fetch("/api/enroll", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId }) });
      if (res.ok) router.refresh();
      else alert("Алдаа гарлаа");
      setLoading(false);
    }
    return (
      <button onClick={handleEnroll} disabled={loading} style={{
        background: loading ? "#3b1d8a" : "linear-gradient(135deg, #7c3aed, #2563eb)",
        color: "#fff", border: "none", padding: "10px 24px", borderRadius: "8px",
        fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 0 20px #7c3aed40",
      }}>
        {loading ? "Түр хүлээнэ үү..." : "Үнэгүй бүртгүүлэх"}
      </button>
    );
  }

  async function handlePayment() {
    setLoading(true);
    const res = await fetch("/api/payments/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId }) });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else alert("Алдаа гарлаа");
    setLoading(false);
  }

  return (
    <button onClick={handlePayment} disabled={loading} style={{
      background: loading ? "#065f46" : "linear-gradient(135deg, #059669, #0284c7)",
      color: "#fff", border: "none", padding: "10px 24px", borderRadius: "8px",
      fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 0 20px #05966940",
    }}>
      {loading ? "Түр хүлээнэ үү..." : "💳 Худалдаж авах"}
    </button>
  );
}