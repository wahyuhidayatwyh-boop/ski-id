import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SKI | Sentral Kerohanian Islam",
  description: "Website Resmi Sentral Kerohanian Islam, Organisasi Mahasiswa Islam yang modern, profesional, dan inspiratif.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body
        className={`${outfit.variable} ${outfit.className} antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}