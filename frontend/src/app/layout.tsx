import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/components/providers/AuthProvider";
import dynamic from "next/dynamic";

// CursorGrid was removed — the cursor-reactive grid box animation that
// followed the mouse is no longer rendered.
const CommandPalette = dynamic(() => import("@/components/ui/CommandPalette"), { ssr: false });

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "TRKFLY AI | Engineering Intelligence at Scale",
  description:
    "We build AI-powered systems that solve real-world problems at production scale.",
  keywords: ["AI", "Machine Learning", "Infrastructure", "Enterprise AI", "TRKFLY"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Always dark mode — light mode was removed */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('dark');`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          <CommandPalette />
          <Navbar />
          <main className="relative z-10 min-h-screen">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
