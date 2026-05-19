import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/layout/SessionProvider";
import NavbarWrapper from "@/components/layout/NavbarWrapper";

export const metadata: Metadata = {
  title: "AuraLearn – Level Up Your Skills",
  description: "Онлайн сургалтын платформ",

  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var c = document.cookie.match(/aura_theme=([^;]+)/);
              var t = c ? c[1] : (localStorage.getItem('aura_theme') || 'dark');
              document.documentElement.setAttribute('data-theme', t);
              document.documentElement.style.background = t === 'light' ? '#F2F0EB' : '#0a0a0f';
            } catch(e) {
              document.documentElement.style.background = '#0a0a0f';
            }
          })();
        `}} />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <SessionProvider>
          <NavbarWrapper />
          <main style={{ paddingTop: "60px" }}>
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}