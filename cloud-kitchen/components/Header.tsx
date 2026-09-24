"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import CartLink from "./CartLink";
import logo from "../public/logo.png";
import logo_bg from "../public/logo_f.png";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "Our Story" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hysteresis: 40px se neeche jaane par pill banega, 8px se upar aane par hi
  // wapas normal hoga. Isse threshold ke paas flicker nahi hota.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled((prev) => (prev ? y > 8 : y > 40));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Fixed + centered with -translate-x-1/2 so the header can shrink
          into a floating "pill" once scrolled. NOTE: this transform makes
          `header` a containing block for any `fixed` descendants, so the
          mobile overlay/drawer below are siblings of <header>, not
          children of it — otherwise they'd stop covering the viewport.

          Smooth transition ke liye: rounded-full aur border-2 dono states
          mein common hain, width dono states mein min() hai, aur colors
          /0 alpha se animate hote hain (transparent keyword se nahi). */}
      <header
        className={`fixed left-1/2 top-0 z-50 flex -translate-x-1/2 items-center justify-between gap-4 rounded-full border-2 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          scrolled
            ? "mt-4 w-[min(600px,92%)] border-forest/15 bg-cream/80 px-6 py-3 shadow-lg backdrop-blur-xl"
            : "mt-0 w-[min(1280px,95%)] border-forest/0 bg-cream/0 px-5 py-5 shadow-none backdrop-blur-[0px] md:px-8 lg:px-12"
        }`}
      >
        {/* Logo */}
        <Link
          href="/"
          className="focus-ring group flex shrink-0 items-center gap-3 transition-transform hover:scale-[1.02]"
        >
          <div className="relative">
            <div
              className={`absolute inset-0 rounded-full bg-sun/20 blur-xl transition-all duration-500 ${
                scrolled ? "opacity-40" : "opacity-100"
              }`}
            />
            <Image
              src={logo_bg}
              alt="Sunny's Kitchen"
              width={200}
              height={200}
              priority
              className={`shrink-0 rounded-full object-cover ring-2 ring-sun/40 transition-all duration-500 ease-out group-hover:ring-sun/70 ${
                scrolled ? "h-12 w-12 md:h-14 md:w-14" : "h-16 w-16 md:h-24 md:w-24"
              }`}
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-10 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="focus-ring group relative font-display text-sm font-semibold uppercase tracking-wide text-forest/80 transition-all hover:text-tomato"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-tomato transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex shrink-0 items-center gap-4">
          <CartLink />

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="focus-ring relative flex h-10 w-10 items-center justify-center rounded-full bg-forest/5 transition-all hover:bg-forest/10 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-forest transition-transform duration-300" />
            ) : (
              <Menu className="h-5 w-5 text-forest transition-transform duration-300" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay — z-[55] sits ABOVE the header (z-50) so the
          header (with its own hamburger/cart buttons) gets dimmed and
          covered too, not left poking out above the drawer. */}
      <div
        className={`fixed inset-0 z-[55] bg-forest/50 backdrop-blur-sm transition-opacity duration-500 md:hidden ${
          mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu — slides in from the right as a side drawer, above
          both the header and the overlay (z-[60]) so it's the only thing
          visible on top when open; it has its own close (X) button since
          the header's own toggle button is now hidden underneath it. */}
      <div
        className={`fixed inset-y-0 right-0 z-[60] flex h-full w-[80%] max-w-[340px] transform flex-col bg-cream shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b-2 border-forest/10 px-6 py-5">
          <span className="font-display text-xs font-bold uppercase tracking-widest text-forest/50">
            Menu
          </span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-full text-forest/60 transition-colors hover:bg-forest/5 hover:text-forest"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
          {links.map((l, index) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`focus-ring transform rounded-xl px-4 py-3.5 font-display text-base font-semibold text-forest/80 transition-all duration-500 hover:bg-forest/5 hover:text-tomato ${
                mobileMenuOpen ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
              }`}
              style={{ transitionDelay: mobileMenuOpen ? `${80 + index * 60}ms` : "0ms" }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}