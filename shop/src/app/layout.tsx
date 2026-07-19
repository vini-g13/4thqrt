import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "4THQRT - Your quarter, your way.",
  description: "4THQRT is a clothing brand built on the belief that it is never over. Come back. Fight back. Push through.",
  openGraph: { title: "4THQRT", description: "Your quarter, your way.", type: "website", locale: "en_US" },
  keywords: ["4thqrt", "streetwear", "clothing", "fourth quarter", "motivation"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-black text-white">{children}</body>
    </html>
  );
}