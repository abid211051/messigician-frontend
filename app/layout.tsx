import type { Metadata } from "next";
import { PT_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const PtSans = PT_Sans({
  variable: "--font-PT_Sans",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Messigician",
  description: "A Mess Managing App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={PtSans.variable}>
      <body className="antialiased bg-slate-200">
        <Toaster />
        {children}
      </body>
    </html>
  );
}
