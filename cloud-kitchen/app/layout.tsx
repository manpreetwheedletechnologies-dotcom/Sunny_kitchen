import type { Metadata } from "next";
import "@fontsource/caveat/600.css";
import "@fontsource/caveat/700.css";
import "@fontsource/baloo-2/500.css";
import "@fontsource/baloo-2/600.css";
import "@fontsource/baloo-2/700.css";
import "@fontsource/baloo-2/800.css";
import "@fontsource/quicksand/400.css";
import "@fontsource/quicksand/500.css";
import "@fontsource/quicksand/600.css";
import "@fontsource/quicksand/700.css";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import { CartProvider } from "@/lib/cart-context";

export const metadata: Metadata = {
  title: "Sunny's Kitchen - Homemade Goodness, Just for You!",
  description:
    "Sunny's Kitchen is a home-style cloud kitchen serving fresh, hygienic, made-with-love sandwiches, pasta, and tiffin meals — exclusive on Zomato.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-body bg-cream text-ink antialiased">
        <CartProvider>
          <SiteChrome>{children}</SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
