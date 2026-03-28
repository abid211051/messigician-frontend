import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding",
  description: "A Mess Managing App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div>{children}</div>;
}
