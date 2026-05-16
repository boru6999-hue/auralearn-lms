"use client";
import { useLang } from "@/hooks/useLang";
import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

const TL: Record<string, Record<string, string>> = {
  add:      { mn:"Нэмэх",      en:"Add",        ja:"追加",     ko:"추가",    fr:"Ajouter",   de:"Hinzufügen",  zh:"添加" },
  save:     { mn:lang==="mn"?"Хадгалах":lang==="ja"?"保存":lang==="ko"?"저장":"Save",   en:"Save",       ja:"保存",     ko:"저장",    fr:"Enregistrer",de:"Speichern",   zh:"保存" },
  cancel:   { mn:lang==="mn"?"Цуцлах":lang==="ja"?"キャンセル":lang==="ko"?"취소":"Cancel",     en:"Cancel",     ja:"キャンセル",ko:"취소",   fr:"Annuler",   de:"Abbrechen",   zh:"取消" },
  delete:   { mn:"Устгах",     en:"Delete",     ja:"削除",     ko:"삭제",    fr:"Supprimer", de:"Löschen",     zh:"删除" },
  search:   { mn:"Хайх...",    en:"Search...",  ja:"検索...",  ko:"검색...", fr:"Rechercher...",de:"Suchen...", zh:"搜索..." },
  all:      { mn:"Бүгд",       en:"All",        ja:"すべて",   ko:"전체",    fr:"Tous",      de:"Alle",        zh:"全部" },
  ban:      { mn:"Хаах",       en:"Ban",        ja:"禁止",     ko:"차단",    fr:"Bannir",    de:"Sperren",     zh:"封禁" },
  unban:    { mn:"Нээх",       en:"Unban",      ja:"解除",     ko:"차단해제", fr:"Débannir",  de:"Entsperren",  zh:"解封" },
  publish:  { mn:"Нийтлэх",    en:"Publish",    ja:"公開",     ko:"게시",    fr:"Publier",   de:"Veröffentlichen",zh:"发布"},
  draft:    { mn:"Ноорог",     en:"Draft",      ja:"下書き",   ko:"초안",    fr:"Brouillon", de:"Entwurf",     zh:"草稿" },
  refund:   { mn:"Буцаах",     en:"Refund",     ja:"返金",     ko:"환불",    fr:"Rembourser",de:"Erstatten",   zh:"退款" },
  revenue:  { mn:"Орлого",     en:"Revenue",    ja:"収益",     ko:"수익",    fr:"Revenu",    de:"Umsatz",      zh:"收入" },
  users_page: { mn:"Хэрэглэгч удирдлага", en:"User Management", ja:"ユーザー管理", ko:"사용자 관리", fr:"Gestion Utilisateurs", de:"Benutzerverwaltung", zh:"用户管理" },
  courses_page:{ mn:"Сургалт удирдлага", en:"Course Management",ja:"コース管理",  ko:"강의 관리",  fr:"Gestion Cours",       de:"Kursverwaltung",     zh:"课程管理" },
};
function tl(key: string, lang: string): string { return TL[key]?.[lang] || TL[key]?.en || key; }

const CARD = "rgba(255,255,255,0.04)";
const BORDER = "#1e1e1e";
const MUTED = "#555";

const MOCK_COURSES = [
  { id: 1, title: "Full Stack Web Dev", category: "development", status: "published", featured: true, price: 89, students: 2100, rating: 4.9, img: "🚀" },
  { id: 2, title: "English for Beginners", category: "language", status: "published", featured: true, price: 29, students: 1240, rating: 4.8, img: "🇺🇸" },
  { id: 3, title: "React & Next.js", category: "development", status: "published", featured: false, price: 59, students: 1560, rating: 4.8, img: "⚛️" },
  { id: 4, title: "Japanese N5-N4", category: "language", status: "draft", featured: false, price: 39, students: 0, rating: 0, img: "🇯🇵" },
  { id: 5, title: "Python Basics", category: "development", status: "published", featured: false, price: 39, students: 1890, rating: 4.8, img: "🐍" },
  { id: 6, title: "UI/UX Design", category: "design", status: "draft", featured: false, price: 44, students: 0, rating: 0, img: "🎨" },
];

export default function CoursesPage() {
  const { lang } = useLang();
  const [courses, setCourses] = useState(MOCK_COURSES);
  const { lang } = useLang();
  const [search, setSearch] = useState("");
  const { lang } = useLang();
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState<any>(null);
  const [form, setForm] = useState({ title: "", category: "development", price: "", status: "draft", featured: false });

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) &&
    (filter === "all" || c.status === filter || c.category === filter)
  );

  function toggleStatus(id: number) {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, status: c.status === "published" ? "draft" : "published" } : c));
  }
  function toggleFeatured(id: number) {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, featured: !c.featured } : c));
  }
  function deleteCourse(id: number) {
    if (confirm(lang==="mn"?"Курс устгах уу?":"Delete this course?")) setCourses(prev => prev.filter(c => c.id !== id));
  }
  function saveCourse() {
    if (editCourse) {
      setCourses(prev => prev.map(c => c.id === editCourse.id ? { ...c, ...form, price: Number(form.price) } : c));
    } else {
      const newC = { ...form, id: Date.now(), price: Number(form.price), students: 0, rating: 0, img: "📚" };
      setCourses(prev => [...prev, newC]);
    }
    setShowModal(false);
    setEditCourse(null);
    setForm({ title: "", category: "development", price: "", status: "draft", featured: false });
  }

  const inputSt = { width: "100%", height: "38px", background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "0 12px", color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box" as const };
  const STATUS_COLOR: any = { published: "#34d399", draft: "#f59e0b" };

  return (
    <AdminLayout>
      <div style={{ padding: "28px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", marginBottom: "4px" }}>Courses</h1>
            <p style={{ color: MUTED, fontSize: "13px" }}>{filtered.length} курс</p>
          </div>
          <button onClick={() => { setEditCourse(null); setForm({ title: "", category: "development", price: "", status: "draft", featured: false }); setShowModal(true); }}
            style={{ background: "#333", color: "#fff", border: "none", padding: "9px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            <i className="fa-solid fa-plus" /> Курс нэмэх
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder=lang==="mn"?"Курс хайх...":lang==="ja"?"コース検索...":lang==="ko"?"강의 검색...":"Search courses..."
            style={{ ...inputSt, width: "220px", height: "34px" }} />
          {["all","published","draft","language","development","design"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 12px", borderRadius: "8px", border: `1px solid ${filter===f?"#999":BORDER}`, background: filter===f?"rgba(255,255,255,0.08)":"transparent", color: filter===f?"#ddd":MUTED, fontSize: "12px", cursor: "pointer", textTransform: "capitalize" }}>{f}</button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "12px" }}>
          {filtered.map(c => (
            <div key={c.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "12px", overflow: "hidden" }}>
              <div style={{ height: "80px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
                <span style={{ fontSize: "32px" }}>{c.img}</span>
                <div style={{ display: "flex", gap: "6px" }}>
                  {c.featured && <span style={{ background: "#f59e0b22", color: "#f59e0b", fontSize: "10px", padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>FEATURED</span>}
                  <span style={{ background: `${STATUS_COLOR[c.status]}22`, color: STATUS_COLOR[c.status], fontSize: "10px", padding: "2px 8px", borderRadius: "4px", fontWeight: 600 }}>{c.status}</span>
                </div>
              </div>
              <div style={{ padding: "14px" }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: "13px", marginBottom: "6px" }}>{c.title}</div>
                <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                  <span style={{ color: MUTED, fontSize: "11px" }}><i className="fa-solid fa-users" style={{ marginRight: "3px" }} />{c.students.toLocaleString()}</span>
                  <span style={{ color: MUTED, fontSize: "11px" }}><i className="fa-solid fa-star" style={{ marginRight: "3px", color: "#f59e0b" }} />{c.rating || "—"}</span>
                  <span style={{ color: "#34d399", fontSize: "11px", fontWeight: 700 }}>${c.price}</span>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => toggleStatus(c.id)} style={{ flex: 1, background: "none", border: `1px solid ${BORDER}`, color: c.status==="published"?"#f59e0b":"#34d399", padding: "5px", borderRadius: "6px", cursor: "pointer", fontSize: "11px" }}>
                    {c.status==="published"?"Draft":"Publish"}
                  </button>
                  <button onClick={() => { setEditCourse(c); setForm({ title: c.title, category: c.category, price: String(c.price), status: c.status, featured: c.featured }); setShowModal(true); }} style={{ background: "none", border: `1px solid ${BORDER}`, color: "#aaa", padding: "5px 8px", borderRadius: "6px", cursor: "pointer", fontSize: "11px" }}>
                    <i className="fa-solid fa-pen" />
                  </button>
                  <button onClick={() => toggleFeatured(c.id)} style={{ background: "none", border: `1px solid ${BORDER}`, color: c.featured?"#f59e0b":"#555", padding: "5px 8px", borderRadius: "6px", cursor: "pointer", fontSize: "11px" }}>
                    <i className="fa-solid fa-star" />
                  </button>
                  <button onClick={() => deleteCourse(c.id)} style={{ background: "none", border: `1px solid ${BORDER}`, color: "#f87171", padding: "5px 8px", borderRadius: "6px", cursor: "pointer", fontSize: "11px" }}>
                    <i className="fa-solid fa-trash" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#111", border: `1px solid ${BORDER}`, borderRadius: "16px", padding: "28px", width: "420px", maxWidth: "90vw" }}>
            <h2 style={{ color: "#fff", fontSize: "16px", fontWeight: 700, marginBottom: "20px" }}>{editCourse ? lang==="mn"?"Курс засах":lang==="ja"?"コース編集":lang==="ko"?"강의 수정":"Edit Course" : lang==="mn"?"Шинэ курс":lang==="ja"?"新しいコース":lang==="ko"?"새 강의":"New Course"}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div><label style={{ color: MUTED, fontSize: "11px", display: "block", marginBottom: "5px" }}>Нэр</label>
                <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} style={inputSt} /></div>
              <div><label style={{ color: MUTED, fontSize: "11px", display: "block", marginBottom: "5px" }}>Категори</label>
                <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} style={inputSt}>
                  <option value="development">Development</option>
                  <option value="language">Language</option>
                  <option value="design">Design</option>
                </select></div>
              <div><label style={{ color: MUTED, fontSize: "11px", display: "block", marginBottom: "5px" }}>Үнэ ($)</label>
                <input value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} type="number" style={inputSt} /></div>
              <div><label style={{ color: MUTED, fontSize: "11px", display: "block", marginBottom: "5px" }}>Статус</label>
                <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))} style={inputSt}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select></div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({...f, featured: e.target.checked}))} id="featured" />
                <label htmlFor="featured" style={{ color: "#aaa", fontSize: "13px" }}>Featured курс</label>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
              <button onClick={saveCourse} style={{ flex: 1, background: "#333", color: "#fff", border: "none", padding: "10px", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>Хадгалах</button>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, background: "none", border: `1px solid ${BORDER}`, color: MUTED, padding: "10px", borderRadius: "8px", cursor: "pointer" }}>Цуцлах</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
