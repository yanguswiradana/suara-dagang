import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SuaraDagang - Caption & Hashtag untuk UMKM",
  description:
    "Bantu UMKM bikin caption Instagram + hashtag siap posting dalam hitungan detik.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-stone-50 text-stone-900 antialiased">
        {children}
      </body>
    </html>
  );
}
