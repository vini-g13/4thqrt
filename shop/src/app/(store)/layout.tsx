import { cookies } from "next/headers";
import { CartProvider } from "@/contexts/CartContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import DropMode from "@/components/DropMode";
import { DROP_MODE } from "@/config";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const unlocked = cookieStore.get("qrt_access")?.value === "granted";

  if (DROP_MODE && !unlocked) {
    return (
      <LocaleProvider>
        <DropMode locale="en" />
      </LocaleProvider>
    );
  }

  return (
    <LocaleProvider>
      <CartProvider>
        <div className="flex min-h-full flex-col bg-black text-white">
          <Navbar />
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
          <CookieBanner />
        </div>
      </CartProvider>
    </LocaleProvider>
  );
}
