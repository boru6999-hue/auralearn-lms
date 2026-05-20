"use client";
import { useState, useEffect } from "react";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import AdminLayout from "@/components/ai/admin/AdminLayout";

export default function AdminDashboard() {
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const [stats, setStats] = useState<any>({});
  const [loading, setLoad] = useState(true);

  const t = (mn: string, en: string, ja="",ko="",fr="",de="",zh="") =>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;

  useEffect(() => {
    fetch("/api/admin/analytics").then(r=>r.json()).then(d=>{ setStats(d); setLoad(false); }).catch(()=>setLoad(false));
  }, []);

  if (!mounted) return null;

  const BG    = isDark ? "#0a0a0f" : "#F2F0EB";
  const TEXT  = isDark ? "#fff" : "#1a1a1a";
  const MUTED = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
  const RULE  = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";

  const METRICS = [
    { label: t("Нийт хэрэглэгч","Total users","総ユーザー","총 사용자","Utilisateurs totaux","Nutzer gesamt","总用户"), val: stats.totalUsers||0 },
    { label: t("Premium хэрэглэгч","Premium users","プレミアム","프리미엄","Premium","Premium","高级用户"), val: stats.premiumUsers||0 },
    { label: t("Нийт сургалт","Total courses","総コース","총 강의","Cours totaux","Kurse gesamt","总课程"), val: stats.totalCourses||0 },
    { label: t("Нийтлэгдсэн","Published","公開済み","게시됨","Publiés","Veröffentlicht","已发布"), val: stats.publishedCourses||0 },
  ];

  const RECENT = stats.recentUsers || [];
  const RECENT_COURSES = stats.recentCourses || [];

  return (
    <AdminLayout>
      <div style={{ padding: "40px 48px", background: BG, minHeight: "100vh" }}>

        {/* Header */}
        <div style={{ marginBottom: "40px", paddingBottom: "24px", borderBottom: `1px solid ${RULE}` }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: MUTED, marginBottom: "6px" }}>
            {t("Хяналтын самбар","Overview","概要","개요","Vue d'ensemble","Übersicht","概览")}
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 300, color: TEXT, letterSpacing: "-1px" }}>
            {t("Статистик","Analytics","統計","통계","Statistiques","Statistiken","统计数据")}
          </h1>
        </div>

        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderBottom: `1px solid ${RULE}`, marginBottom: "40px" }}>
          {METRICS.map((m, i, arr) => (
            <div key={i} style={{ padding: "24px 0", borderRight: i < arr.length-1 ? `1px solid ${RULE}` : "none", paddingRight: i < arr.length-1 ? "24px" : "0", paddingLeft: i > 0 ? "24px" : "0" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, marginBottom: "8px" }}>{m.label}</div>
              <div style={{ fontSize: "36px", fontWeight: 300, color: TEXT, letterSpacing: "-1.5px" }}>{loading ? "—" : m.val.toLocaleString()}</div>
            </div>
          ))}
        </div>

        {/* Two column */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px" }}>

          {/* Recent users */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "16px" }}>
              <span style={{ fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: MUTED }}>
                {t("Сүүлийн хэрэглэгчид","Recent users","最近のユーザー","최근 사용자","Utilisateurs récents","Neue Nutzer","最近用户")}
              </span>
              <a href="/admin/users" style={{ fontSize: "11px", color: MUTED, textDecoration: "none" }}>
                {t("Бүгдийг харах","View all","すべて見る","모두 보기","Voir tout","Alle ansehen","查看全部")} →
              </a>
            </div>
            {RECENT.length === 0 ? (
              <div style={{ padding: "32px 0", fontSize: "12px", color: MUTED, fontWeight: 300 }}>
                {t("Хэрэглэгч байхгүй","No users yet")}
              </div>
            ) : RECENT.map((u: any, i: number) => (
              <div key={u._id || i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: `1px solid ${RULE}` }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 400, color: TEXT, flexShrink: 0 }}>
                  {(u.name || u.email || "?")[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 300, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name || u.email?.split("@")[0]}</div>
                  <div style={{ fontSize: "11px", color: MUTED }}>{u.email}</div>
                </div>
                <span style={{ fontSize: "10px", color: u.role === "admin" ? "#22c55e" : u.role === "premium" ? "#B5863A" : MUTED, letterSpacing: "0.08em" }}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>

          {/* Recent courses */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "16px" }}>
              <span style={{ fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: MUTED }}>
                {t("Сүүлийн сургалтууд","Recent courses","最近のコース","최근 강의","Cours récents","Neue Kurse","最近课程")}
              </span>
              <a href="/admin/courses" style={{ fontSize: "11px", color: MUTED, textDecoration: "none" }}>
                {t("Бүгдийг харах","View all","すべて見る","모두 보기","Voir tout","Alle ansehen","查看全部")} →
              </a>
            </div>
            {RECENT_COURSES.length === 0 ? (
              <div style={{ padding: "32px 0", fontSize: "12px", color: MUTED, fontWeight: 300 }}>
                {t("Сургалт байхгүй","No courses yet")}
              </div>
            ) : RECENT_COURSES.map((c: any, i: number) => (
              <div key={c._id || i} style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: `1px solid ${RULE}` }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 300, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
                  <div style={{ fontSize: "11px", color: MUTED }}>{c.category} · {c.sections?.length || 0} {t("хэсэг","sections")}</div>
                </div>
                <span style={{ fontSize: "10px", color: c.status === "published" ? "#22c55e" : MUTED, letterSpacing: "0.08em", flexShrink: 0 }}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
