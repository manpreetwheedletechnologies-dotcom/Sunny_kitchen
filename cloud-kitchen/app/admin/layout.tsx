"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAdminToken } from "@/lib/admin-auth";
import AdminSidebar from "@/components/AdminSidebar";
import { Menu, X } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/admin/login") return;
    
    const token = getAdminToken();
    if (!token) {
      router.push("/admin/login");
    } else {
      setIsAuthorized(true);
    }
  }, [router, pathname]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!isAuthorized) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex h-screen w-full bg-creamDark/40 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <AdminSidebar />
      </div>

      {/* Mobile Header */}
      <div className="flex items-center justify-between bg-card px-4 py-3 border-b-2 border-forest/10 md:hidden absolute top-0 w-full z-20">
        <h1 className="font-script text-2xl text-forest">Sunny&apos;s Kitchen</h1>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="focus-ring rounded-lg p-2 text-forest"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-30 bg-forest/50 backdrop-blur-sm transition-opacity md:hidden ${
          mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-card shadow-2xl transition-transform duration-300 md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <AdminSidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto mt-[60px] md:mt-0 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
