import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope } from "next/font/google";
import "./globals.css";
import Providers from "@/providers/Providers";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "EduApp | Learn Skills That Make You Job Ready",
    template: "%s | EduApp",
  },

  description:
    "EduApp is a modern learning platform offering industry-ready courses, mentorship, and hands-on projects. Learn web development, data science, DSA, and Gen AI with expert guidance.",

  keywords: [
    "EduApp",
    "online learning platform",
    "coding courses",
    "web development",
    "data science",
    "DSA",
    "Gen AI",
    "job ready courses",
    "mentorship platform",
  ],

  openGraph: {
    title: "EduApp – Learn Skills That Make You Job Ready",
    description:
      "Upskill with EduApp through practical courses, expert mentorship, and real-world projects designed for students and professionals.",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "EduApp",
    description:
      "Learn coding, data science, DSA, and Gen AI with mentorship on EduApp.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
