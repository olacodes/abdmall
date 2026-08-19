import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StorefrontOnly } from "@/components/storefront-only";
import { CartProvider } from "@/lib/cart-context";
import { getCategories } from "@/lib/catalogue";

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
  const categories = await getCategories();

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${hanken.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <CartProvider>
          <SiteHeader categories={categories} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <StorefrontOnly>
            <SiteFooter categories={categories} />
          </StorefrontOnly>
        </CartProvider>
      </body>
    </html>
  );
}
