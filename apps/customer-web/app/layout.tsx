import type { Metadata } from "next";
import { DM_Sans, Noto_Sans_Khmer } from "next/font/google";

import { Providers } from "@/app/providers";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const notoSansKhmer = Noto_Sans_Khmer({
  variable: "--font-khmer",
  subsets: ["khmer", "latin"],
});

export const metadata: Metadata = {
  title: "KMRS Customer Web",
  description: "Customer-facing digital menu for KMRS shops.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${notoSansKhmer.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
