import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Abdullah Al Saki | Founder & Director of Engineering",
  description:
    "Founder & CEO of SKARION and Director of Engineering at SKARION Engineering.",
  keywords: [
    "Abdullah Al Saki",
    "SKARION",
    "OSP Engineer",
    "Fiber Network Design",
    "Engineering Leader",
    "Workforce Development",
  ],
  openGraph: {
    title: "Abdullah Al Saki | Founder & Director of Engineering",
    description: "Founder & CEO of SKARION and Director of Engineering at SKARION Engineering.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-grow flex flex-col">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
