import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import DropMode from "@/components/DropMode";
import { DROP_MODE } from "@/config";

export const metadata: Metadata = {
  title: "4THQRT â€” Your quarter, your way.",
  description:
    "4THQRT is a clothing brand built on the belief that it's never over. Come back. Fight back. Push through.",
  openGraph: {
    title: "4THQRT",
    description: "Your quarter, your way.",
    type: "website",
    locale: "en_US",
  },
  keywords: ["4thqrt", "streetwear", "clothing", "fourth quarter", "motivation"],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const requestHeaders = await headers();
  const unlocked = cookieStore.get("qrt_access")?.value === "granted";
  const isAdminRoute = requestHeaders.get("x-4thqrt-pathname")?.startsWith("/admin");

  if (DROP_MODE && !unlocked && !isAdminRoute) {
    return (
      <html lang="en" className="h-full">
        <body className="min-h-full bg-black text-white">
          {/* DROP_MODE is aan â€” zie src/config.ts om dit uit te zetten */}
          <LocaleProvider>
            <DropMode locale="en" />
          </LocaleProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-black text-white">
        <LocaleProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
            <CookieBanner />
          </CartProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
