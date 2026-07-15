"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import CartBar from "./CartBar";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    // Dashboard has its own header — no storefront nav/footer/cart bar here.
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <div className="pt-[50px]">
        {children}
      </div>
      <CartBar />
      <Footer />
    </>
  );
}
