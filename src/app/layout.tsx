import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sewa Delivery | Votre bonheur livré avec le sourire",
  description: "La solution logistique instantanée, joyeuse et impeccablement organisée pour tous vos envois à Conakry.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sewa Delivery",
  },
};

export const viewport = {
  themeColor: "#E3000F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} antialiased flex flex-col min-h-screen`}>
        <Header />
        <main className="flex-1 flex flex-col pb-20 md:pb-0">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
