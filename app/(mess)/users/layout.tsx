import { AuthStoreinit } from "@/components/initializerComponent/AuthStoreInit";
import NavTabs from "@/components/nav/navTab";
import { getUser } from "@/lib/helpers/getUser";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messigician",
  description: "A Mess Managing App",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  return (
    <div>
      <NavTabs />
      <AuthStoreinit user={user} />
      {children}
    </div>
  );
}
