import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://skitelkompurwokerto.site'),
  title: "SKI | Sentral Kerohanian Islam Telkom Purwokerto",
  description: "Website resmi Sentral Kerohanian Islam (SKI) Telkom Purwokerto. Wadah dakwah, kegiatan keislaman, dan ukhuwah islamiyah mahasiswa.",
  keywords: [
    "SKI Telkom Purwokerto",
    "Sentral Kerohanian Islam",
    "skitelkompurwokerto.site",
    "SKI IT Telkom Purwokerto",
    "organisasi islam kampus purwokerto",
    "kajian islam telkom"
  ],
  openGraph: {
    title: "SKI | Sentral Kerohanian Islam Telkom Purwokerto",
    description: "Website resmi Sentral Kerohanian Islam (SKI) Telkom Purwokerto. Wadah dakwah, kegiatan keislaman, dan ukhuwah islamiyah mahasiswa.",
    url: "https://skitelkompurwokerto.site",
    siteName: "SKI Telkom Purwokerto",
    images: [
      {
        url: "/ski-logo.png",
        width: 800,
        height: 800,
        alt: "Logo SKI Telkom Purwokerto",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SKI | Sentral Kerohanian Islam Telkom Purwokerto",
    description: "Website resmi Sentral Kerohanian Islam (SKI) Telkom Purwokerto. Wadah dakwah, kegiatan keislaman, dan ukhuwah islamiyah mahasiswa.",
    images: ["/ski-logo.png"],
  },
  verification: {
    google: "haOSD52Kko3uxRJ2NXkenv7ohaHbSL1BH6P8pTrgZVg",
  },
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