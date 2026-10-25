import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StorefrontOnly } from "@/components/storefront-only";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth";
import { getCategories } from "@/lib/catalogue";
import { getShopSettings } from "@/lib/settings";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  style: ["normal", "italic"],
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "abdmall — Modern commerce, simplified",
    template: "%s · abdmall",
  },
  description:
    "Shop fashion, electronics, home, beauty and daily essentials. Pay your way, delivered to your door.",
  metadataBase: new URL("https://abdmall.com"),
  authors: [
    { name: "Osmani Technologies Limited", url: "https://osmani.com.ng" },
  ],
  creator: "Osmani Technologies Limited",
  publisher: "Osmani Technologies Limited",
  openGraph: {
    title: "abdmall — Modern commerce, simplified",
    description:
      "Shop everything you love, delivered. Secure checkout, real deals, fast delivery.",
    images: ["/abdmall.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getShopSettings(),
  ]);

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${hanken.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <AuthProvider>
          <CartProvider
            deliveryFee={settings.deliveryFee}
            freeDeliveryThreshold={settings.freeDeliveryThreshold}
          >
            <SiteHeader categories={categories} settings={settings} />
            <main id="main" className="flex-1">
              {children}
            </main>
            <StorefrontOnly>
              <SiteFooter categories={categories} settings={settings} />
            </StorefrontOnly>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
