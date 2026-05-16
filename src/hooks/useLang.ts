"use client";
import { useState, useEffect } from "react";

const T: Record<string, Record<string, any>> = {
  mn: {
    home: { badge: "⚡ Next-level онлайн сургалт", title: "Skill-ээ", subtitle: "Level Up хий", desc: "Мэргэжлийн багш нараас суралцаж, өөрийн хурдаар хөгжил дэвшил гарга", cta_courses: "Сургалт үзэх", cta_register: "Эхлэх →" },
    auth: { login_title: "AuraLearn-д нэвтрэх", no_account: "Бүртгэл байхгүй юу?", register_link: "Бүртгүүлэх", google: "Google-ээр нэвтрэх", github: "GitHub-ээр нэвтрэх", or: "эсвэл", email: "И-мэйл", password: "Нууц үг", forgot: "Мартсан уу?", continue: "Үргэлжлүүлэх →", login_btn: "Нэвтрэх", change: "Өөрчлөх", terms_text: "Нэвтрэснээр та манай", terms: "Нөхцөл", terms_and: "болон", privacy: "Нууцлалын бодлого", terms_agree: "-г зөвшөөрч байна.", register_title: "Бүртгэл үүсгэх", have_account: "Бүртгэл байгаа юу?", login_link: "Нэвтрэх", google_reg: "Google-ээр бүртгүүлэх", github_reg: "GitHub-ээр бүртгүүлэх", name: "Нэр", name_ph: "Таны нэр", register_btn: "Бүртгүүлэх", error_wrong: "И-мэйл эсвэл нууц үг буруу байна", loading_login: "Нэвтэрч байна...", loading_reg: "Бүртгэж байна..." },
    dashboard: { welcome: "Тавтай морилно уу", add_course: "+ Сургалт нэмэх", total_courses: "Нийт сургалт", completed: "Дууссан хичээл", avg_progress: "Дундаж явц", my_courses: "Миний сургалтууд", no_courses: "Та одоогоор ямар ч сургалтад бүртгүүлээгүй байна", browse: "Сургалт үзэх →" },
    profile: { name: "Нэр", email: "И-мэйл", role: "Үүрэг", student: "Оюутан", teacher: "Багш", save: "Хадгалах", saving: "Хадгалж байна...", saved: "✓ Амжилттай хадгалагдлаа", cover: "Cover солих", change_pass: "Нууц үг солих", change_pass_desc: "И-мэйлээр нууц үг сэргээх линк илгээнэ" },
  },
  en: {
    home: { badge: "⚡ Next-level online learning", title: "Level Up", subtitle: "Your Skills", desc: "Learn from professional instructors and grow at your own pace", cta_courses: "Browse Courses", cta_register: "Get Started →" },
    auth: { login_title: "Sign in to AuraLearn", no_account: "Don't have an account?", register_link: "Sign up", google: "Continue with Google", github: "Continue with GitHub", or: "or", email: "Email", password: "Password", forgot: "Forgot password?", continue: "Continue →", login_btn: "Sign In", change: "Change", terms_text: "By signing in, you agree to our", terms: "Terms", terms_and: "and", privacy: "Privacy Policy", terms_agree: ".", register_title: "Create an account", have_account: "Already have an account?", login_link: "Sign in", google_reg: "Sign up with Google", github_reg: "Sign up with GitHub", name: "Name", name_ph: "Your name", register_btn: "Create account", error_wrong: "Invalid email or password", loading_login: "Signing in...", loading_reg: "Creating account..." },
    dashboard: { welcome: "Welcome back", add_course: "+ Add Course", total_courses: "Total Courses", completed: "Completed Lessons", avg_progress: "Avg Progress", my_courses: "My Courses", no_courses: "You haven't enrolled in any courses yet", browse: "Browse Courses →" },
    profile: { name: "Name", email: "Email", role: "Role", student: "Student", teacher: "Instructor", save: "Save changes", saving: "Saving...", saved: "✓ Saved successfully", cover: "Change cover", change_pass: "Change password", change_pass_desc: "We'll send a password reset link to your email" },
  },
  ja: {
    home: { badge: "⚡ 次世代オンライン学習", title: "スキルを", subtitle: "レベルアップしよう", desc: "プロの講師から学び、自分のペースで成長しましょう", cta_courses: "コースを見る", cta_register: "始める →" },
    auth: { login_title: "AuraLearnにログイン", no_account: "アカウントをお持ちでないですか？", register_link: "登録する", google: "Googleでログイン", github: "GitHubでログイン", or: "または", email: "メールアドレス", password: "パスワード", forgot: "パスワードを忘れた？", continue: "続ける →", login_btn: "ログイン", change: "変更", terms_text: "ログインすることで、", terms: "利用規約", terms_and: "および", privacy: "プライバシーポリシー", terms_agree: "に同意します。", register_title: "アカウントを作成", have_account: "すでにアカウントをお持ちですか？", login_link: "ログイン", google_reg: "Googleで登録", github_reg: "GitHubで登録", name: "名前", name_ph: "お名前", register_btn: "登録する", error_wrong: "メールまたはパスワードが正しくありません", loading_login: "ログイン中...", loading_reg: "登録中..." },
    dashboard: { welcome: "おかえりなさい", add_course: "+ コースを追加", total_courses: "コース合計", completed: "完了したレッスン", avg_progress: "平均進捗", my_courses: "マイコース", no_courses: "まだコースに登録していません", browse: "コースを見る →" },
    profile: { name: "名前", email: "メールアドレス", role: "役割", student: "学生", teacher: "講師", save: "保存する", saving: "保存中...", saved: "✓ 保存しました", cover: "カバーを変更", change_pass: "パスワードを変更", change_pass_desc: "リセットリンクを送信します" },
  },
  ko: {
    home: { badge: "⚡ 차세대 온라인 학습", title: "스킬을", subtitle: "레벨업 하세요", desc: "전문 강사에게 배우고 자신의 속도로 성장하세요", cta_courses: "강의 보기", cta_register: "시작하기 →" },
    auth: { login_title: "AuraLearn 로그인", no_account: "계정이 없으신가요?", register_link: "회원가입", google: "Google로 로그인", github: "GitHub로 로그인", or: "또는", email: "이메일", password: "비밀번호", forgot: "비밀번호를 잊으셨나요?", continue: "계속하기 →", login_btn: "로그인", change: "변경", terms_text: "로그인하면", terms: "이용약관", terms_and: "및", privacy: "개인정보 처리방침", terms_agree: "에 동의합니다.", register_title: "계정 만들기", have_account: "이미 계정이 있으신가요?", login_link: "로그인", google_reg: "Google로 가입", github_reg: "GitHub로 가입", name: "이름", name_ph: "이름을 입력하세요", register_btn: "가입하기", error_wrong: "이메일 또는 비밀번호가 올바르지 않습니다", loading_login: "로그인 중...", loading_reg: "가입 중..." },
    dashboard: { welcome: "돌아오셨군요", add_course: "+ 강의 추가", total_courses: "전체 강의", completed: "완료한 수업", avg_progress: "평균 진도", my_courses: "내 강의", no_courses: "아직 등록한 강의가 없습니다", browse: "강의 보기 →" },
    profile: { name: "이름", email: "이메일", role: "역할", student: "학생", teacher: "강사", save: "저장하기", saving: "저장 중...", saved: "✓ 저장되었습니다", cover: "커버 변경", change_pass: "비밀번호 변경", change_pass_desc: "재설정 링크를 이메일로 보내드립니다" },
  },
  fr: {
    home: { badge: "⚡ Apprentissage en ligne", title: "Améliorez", subtitle: "vos compétences", desc: "Apprenez auprès de formateurs professionnels", cta_courses: "Voir les cours", cta_register: "Commencer →" },
    auth: { login_title: "Connexion à AuraLearn", no_account: "Pas encore de compte ?", register_link: "S'inscrire", google: "Continuer avec Google", github: "Continuer avec GitHub", or: "ou", email: "E-mail", password: "Mot de passe", forgot: "Mot de passe oublié ?", continue: "Continuer →", login_btn: "Se connecter", change: "Modifier", terms_text: "En vous connectant, vous acceptez nos", terms: "CGU", terms_and: "et", privacy: "Politique de confidentialité", terms_agree: ".", register_title: "Créer un compte", have_account: "Vous avez déjà un compte ?", login_link: "Se connecter", google_reg: "S'inscrire avec Google", github_reg: "S'inscrire avec GitHub", name: "Nom", name_ph: "Votre nom", register_btn: "Créer un compte", error_wrong: "Email ou mot de passe incorrect", loading_login: "Connexion...", loading_reg: "Création..." },
    dashboard: { welcome: "Bon retour", add_course: "+ Ajouter", total_courses: "Total des cours", completed: "Leçons terminées", avg_progress: "Progression", my_courses: "Mes cours", no_courses: "Aucun cours", browse: "Voir les cours →" },
    profile: { name: "Nom", email: "E-mail", role: "Rôle", student: "Étudiant", teacher: "Formateur", save: "Enregistrer", saving: "...", saved: "✓ Enregistré", cover: "Changer la couverture", change_pass: "Changer le mot de passe", change_pass_desc: "Lien envoyé par email" },
  },
  de: {
    home: { badge: "⚡ Online-Lernen", title: "Verbessere", subtitle: "deine Fähigkeiten", desc: "Lerne von professionellen Dozenten", cta_courses: "Kurse ansehen", cta_register: "Loslegen →" },
    auth: { login_title: "Bei AuraLearn anmelden", no_account: "Noch kein Konto?", register_link: "Registrieren", google: "Mit Google anmelden", github: "Mit GitHub anmelden", or: "oder", email: "E-Mail", password: "Passwort", forgot: "Passwort vergessen?", continue: "Weiter →", login_btn: "Anmelden", change: "Ändern", terms_text: "Mit der Anmeldung stimmen Sie unseren", terms: "AGB", terms_and: "und", privacy: "Datenschutzrichtlinie", terms_agree: "zu.", register_title: "Konto erstellen", have_account: "Bereits ein Konto?", login_link: "Anmelden", google_reg: "Mit Google registrieren", github_reg: "Mit GitHub registrieren", name: "Name", name_ph: "Ihr Name", register_btn: "Konto erstellen", error_wrong: "Ungültige Anmeldedaten", loading_login: "Anmeldung...", loading_reg: "Wird erstellt..." },
    dashboard: { welcome: "Willkommen zurück", add_course: "+ Kurs hinzufügen", total_courses: "Kurse gesamt", completed: "Abgeschlossen", avg_progress: "Fortschritt", my_courses: "Meine Kurse", no_courses: "Noch keine Kurse", browse: "Kurse ansehen →" },
    profile: { name: "Name", email: "E-Mail", role: "Rolle", student: "Student", teacher: "Dozent", save: "Speichern", saving: "...", saved: "✓ Gespeichert", cover: "Titelbild ändern", change_pass: "Passwort ändern", change_pass_desc: "Reset-Link per E-Mail" },
  },
  zh: {
    home: { badge: "⚡ 下一代在线学习", title: "提升", subtitle: "您的技能", desc: "向专业讲师学习，按照自己的节奏成长", cta_courses: "浏览课程", cta_register: "立即开始 →" },
    auth: { login_title: "登录 AuraLearn", no_account: "还没有账号？", register_link: "注册", google: "使用 Google 登录", github: "使用 GitHub 登录", or: "或者", email: "电子邮件", password: "密码", forgot: "忘记密码？", continue: "继续 →", login_btn: "登录", change: "修改", terms_text: "登录即表示您同意", terms: "服务条款", terms_and: "和", privacy: "隐私政策", terms_agree: "。", register_title: "创建账号", have_account: "已有账号？", login_link: "登录", google_reg: "使用 Google 注册", github_reg: "使用 GitHub 注册", name: "姓名", name_ph: "您的姓名", register_btn: "创建账号", error_wrong: "邮箱或密码错误", loading_login: "登录中...", loading_reg: "注册中..." },
    dashboard: { welcome: "欢迎回来", add_course: "+ 添加课程", total_courses: "总课程", completed: "已完成", avg_progress: "平均进度", my_courses: "我的课程", no_courses: "还没有课程", browse: "浏览课程 →" },
    profile: { name: "姓名", email: "电子邮件", role: "角色", student: "学生", teacher: "讲师", save: "保存", saving: "...", saved: "✓ 已保存", cover: "更换封面", change_pass: "修改密码", change_pass_desc: "发送重置链接" },
  },
};

export function useLang() {
  const [lang, setLang] = useState("mn");

  useEffect(() => {
    // Read current lang from storage
    function readLang(): string {
      const cookie = document.cookie.match(/aura_lang=([^;]+)/);
      const val = cookie ? cookie[1] : (localStorage.getItem("aura_lang") || "mn");
      return T[val] ? val : "mn";
    }

    setLang(readLang());

    // Custom event from Navbar toggle
    const onLangChange = (e: Event) => {
      const newLang = (e as CustomEvent).detail;
      if (T[newLang]) setLang(newLang);
    };

    // Storage event for cross-page sync
    const onStorage = (e: StorageEvent) => {
      if (e.key === "aura_lang" && e.newValue && T[e.newValue]) {
        setLang(e.newValue);
      }
    };

    window.addEventListener("langChange", onLangChange);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("langChange", onLangChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return { lang, t: T[lang] || T["mn"] };
}
