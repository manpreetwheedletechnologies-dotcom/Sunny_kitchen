"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Receipt,
  Users,
  ShieldCheck,
  UserCircle,
  LogOut,
  ShoppingBag,
  Store,
  MessageSquare,
  Wallet
} from "lucide-react";
import { clearAdminToken, getAdminRole } from "@/lib/admin-auth";
import { useRouter } from "next/navigation";

const SwiggyIcon = ({ className }: { className?: string }) => (
  <img 
    src="/swiggy.png" 
    alt="Swiggy" 
    className={className} 
    style={{ objectFit: "contain" }}
  />
);

const ZomatoIcon = ({ className }: { className?: string }) => (
  <img 
    src="/zomato.png" 
    alt="Zomato" 
    className={className} 
    style={{ objectFit: "contain" }}
  />
);

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Menu", href: "/admin/menu", icon: UtensilsCrossed },
  { name: "Orders", href: "/admin/orders", icon: Receipt },
  { name: "Payments", href: "/admin/payments", icon: Wallet },
  { name: "Swiggy Hub", href: "/admin/swiggy", icon: SwiggyIcon },
  { name: "Zomato Hub", href: "/admin/zomato", icon: ZomatoIcon },
  { name: "Testimonials", href: "/admin/testimonials", icon: Users },
  { name: "Leads", href: "/admin/leads", icon: MessageSquare },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Role & Access", href: "/admin/roles", icon: ShieldCheck, adminOnly: true },
  { name: "My Profile", href: "/admin/profile", icon: UserCircle },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(getAdminRole());
  }, []);

  function handleLogout() {
    clearAdminToken();
    router.push("/admin/login");
  }

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r-2 border-forest/10">
      <div className="flex h-20 shrink-0 items-center px-6 border-b-2 border-forest/10">
        <h1 className="font-script text-3xl text-forest">Sunny&apos;s Kitchen</h1>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <nav className="mt-2 flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            if (item.adminOnly && role !== "admin") return null;
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`focus-ring group flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold font-display transition-colors ${isActive
                    ? "bg-forest text-cream"
                    : "text-forest/70 hover:bg-forest/5 hover:text-forest"
                  }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? "text-cream" : "text-forest/50 group-hover:text-forest"
                    }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t-2 border-forest/10 p-4">
        <button
          onClick={handleLogout}
          className="focus-ring group flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-semibold font-display text-forest/70 transition-colors hover:bg-tomato/10 hover:text-tomato"
        >
          <LogOut className="mr-3 h-5 w-5 text-forest/50 group-hover:text-tomato" />
          Log out
        </button>
      </div>
    </div>
  );
}
