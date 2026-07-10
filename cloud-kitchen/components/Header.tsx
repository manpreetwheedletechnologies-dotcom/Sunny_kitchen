"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import CartLink from "./CartLink";
import logo from "../public/logo.png";
import logo_bg from "../public/logo_f.png"
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b-2 border-forest/10 py-3 shadow-lg"
          : "border-b-2 border-transparent py-5"
      }`}
    >
      {/* Background sirf scroll k baad aata hai; hero pe fully transparent */}
      <div
        className={`absolute inset-0 -z-10 transition-all duration-500 ${
          scrolled
            ? "bg-cream/80 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      />

      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 md:px-8 lg:px-12">
        {/* Logo */}
        <Link
          href="/"
          className="focus-ring group flex items-center gap-3 transition-transform hover:scale-[1.02]"
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
        <div className="flex items-center gap-4">
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
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-forest/50 backdrop-blur-sm transition-all duration-500 md:hidden ${
          mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu */}
      <div
        className={`fixed inset-x-0 top-[76px] z-40 transform bg-cream/95 shadow-2xl backdrop-blur-xl transition-all duration-500 ease-in-out md:hidden ${
          mobileMenuOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-8 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-1 border-t-2 border-forest/10 p-6">
          {links.map((l, index) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`focus-ring transform rounded-xl px-4 py-3.5 font-display text-base font-semibold text-forest/80 transition-all hover:bg-forest/5 hover:text-tomato ${
                mobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}