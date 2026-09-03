import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "ANDRÉ OS", template: "%s · ANDRÉ OS" },
  description:
    "Sistema operacional pessoal para executar metas, tarefas, rotinas, foco e evolução.",
  applicationName: "ANDRÉ OS",
  keywords: ["produtividade", "tarefas", "rotinas", "foco", "ANDRÉ OS"],
  authors: [{ name: "André Lucas" }],
  creator: "André Lucas",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      {
        url: "/brand/app-icon-dark.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/brand/app-icon-light.png",
        media: "(prefers-color-scheme: light)",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8F9FB" },
    { media: "(prefers-color-scheme: dark)", color: "#0F1014" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
