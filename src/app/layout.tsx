import type { Metadata } from "next";
import { Inter, Jura } from "next/font/google";
import "./globals.css";

const jura = Jura({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MotusDAO | Clinical Futurism Landing",
  description:
    "MotusDAO builds AI-powered, privacy-first infrastructure for psychologists and modern mental health practices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jura.variable} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
