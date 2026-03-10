import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { FinanceProvider } from "@/lib/finance-context";
import { TutorialProvider } from "@/lib/tutorial-context";
import { TutorialOverlay } from "@/components/TutorialOverlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CapitaFin — Gestão Financeira",
  description: "Gerencie suas finanças com inteligência. Contas, transações, metas e orçamento em um só lugar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <FinanceProvider>
            <TutorialProvider>
              {children}
              <TutorialOverlay />
            </TutorialProvider>
          </FinanceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
