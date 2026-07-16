"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Copy, Check, ArrowRight, ShieldCheck, PiggyBank, Heart, Gift } from "lucide-react";
import logo from "../../public/logo_f.png";

function WelcomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [copied, setCopied] = useState(false);
  const [platform, setPlatform] = useState<"swiggy" | "zomato" | "general">("general");

  const utmSource = searchParams.get("utm_source")?.toLowerCase();

  useEffect(() => {
    if (utmSource === "swiggy") {
      setPlatform("swiggy");
    } else if (utmSource === "zomato") {
      setPlatform("zomato");
    } else {
      setPlatform("general");
    }
  }, [utmSource]);

  const couponCode = "DIRECT20";

  function handleCopy() {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleClaim() {
    localStorage.setItem("promo_coupon", couponCode);
    localStorage.setItem("promo_source", platform === "general" ? "website" : platform);
    router.push("/menu");
  }

  const platformName = platform === "swiggy" ? "Swiggy" : platform === "zomato" ? "Zomato" : "";

  return (
    <main className="relative -mt-14 overflow-x-hidden min-h-screen flex items-center justify-center py-16 px-4">
      {/* Yellow Dot Pattern Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-dot-pattern opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-b from-cream/80 via-cream/40 to-cream/80" />
      </div>

      <div className="relative z-10 max-w-xl w-full text-center">
        {/* Animated background elements */}
        <div className="pointer-events-none absolute -left-12 -top-12 z-0 h-40 w-40 rounded-full bg-sun/30 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute -right-12 bottom-4 z-0 h-40 w-40 rounded-full bg-tomato/20 blur-3xl animate-pulse delay-1000" />

        <div className="relative border-2 border-forest/15 bg-card/95 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-2xl transition-all duration-300 hover:shadow-forest/5">
          {/* Logo container */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 rounded-full bg-sun/20 blur-xl animate-pulse" />
            <Image
              src={logo}
              alt="Sunny's Kitchen"
              width={100}
              height={100}
              priority
              className="relative z-10 rounded-full object-cover ring-4 ring-sun/40 shadow-md"
            />
          </div>

          {/* Dynamic Welcome Heading */}
          {platform !== "general" ? (
            <div className="mx-auto mb-4 w-fit items-center gap-1.5 rounded-full border border-tomato/20 bg-tomato/5 px-4 py-1 flex animate-bounce">
              <Sparkles className="h-3.5 w-3.5 text-tomato" />
              <span className="font-display text-xs font-bold uppercase tracking-wider text-tomato">
                Special Offer for {platformName} Foodies
              </span>
            </div>
          ) : (
            <div className="mx-auto mb-4 w-fit items-center gap-1.5 rounded-full border border-forest/20 bg-forest/5 px-4 py-1 flex">
              <Gift className="h-3.5 w-3.5 text-forest" />
              <span className="font-display text-xs font-bold uppercase tracking-wider text-forest">
                Direct Ordering Privilege
              </span>
            </div>
          )}

          <h1 className="font-script text-5xl text-forest leading-tight md:text-6xl">
            Welcome to Sunny&apos;s kitchen!
          </h1>
          
          <p className="mt-4 font-body text-base text-forest/80 leading-relaxed">
            {platform !== "general" ? (
              <>
                Saw us on <strong>{platformName}</strong>? Avoid platform markups, high delivery fees, and order directly from us for the freshest homemade taste.
              </>
            ) : (
              <>
                Avoid food aggregator markups, high service charges, and order directly from us to support local homemade cooking!
              </>
            )}
          </p>

          {/* Coupon Display Box */}
          <div className="mt-8 rounded-2xl border-2 border-dashed border-tomato/30 bg-tomato/5 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-16 h-16 bg-tomato/10 rounded-full blur-md"></div>
            
            <p className="font-display text-xs font-bold uppercase tracking-widest text-tomato/80 mb-2">
              YOUR EXCLUSIVE FIRST-ORDER COUPON
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="font-display text-3xl font-extrabold text-forest bg-cream px-6 py-2 rounded-xl border border-forest/15 shadow-inner select-all tracking-wider">
                {couponCode}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="focus-ring flex items-center justify-center gap-2 rounded-xl bg-forest px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-cream shadow-md transition hover:bg-forestDark active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-sun" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
            
            <p className="mt-4 font-display text-lg font-bold text-tomato">
              Enjoy FLAT 20% OFF on your entire order!
            </p>
            <p className="text-xs text-forest/60 mt-1">
              *Applied automatically at checkout once claimed.
            </p>
          </div>

          {/* Direct Ordering Benefits */}
          <div className="mt-8 space-y-3.5 border-t border-forest/10 pt-6 text-left">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-forest/70 mb-3 text-center sm:text-left">
              Why Order Direct from Us?
            </h3>
            
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest mt-0.5">
                <PiggyBank className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="font-display text-sm font-bold text-forest">No Aggregator Markup</p>
                <p className="font-body text-xs text-forest/70">aggregator apps charge up to 25% extra. Our direct pricing is pure and lower!</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest mt-0.5">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="font-display text-sm font-bold text-forest">Free & Direct Delivery</p>
                <p className="font-body text-xs text-forest/70">Free delivery on orders above ₹299. Managed directly by our trusted delivery guys.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest mt-0.5">
                <Heart className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="font-display text-sm font-bold text-forest">Fresh & Personalized Service</p>
                <p className="font-body text-xs text-forest/70">Your food goes straight from our frying pan to your plate, customized to your notes.</p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={handleClaim}
              className="focus-ring group w-full flex items-center justify-center gap-2 rounded-full bg-tomato py-4 font-display text-base font-bold text-cream shadow-lg transition hover:bg-forest hover:scale-[1.02] active:scale-[0.98]"
            >
              Claim Discount & Explore Menu
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            
            <Link
              href="/"
              className="font-display text-sm font-semibold text-forest/60 hover:text-tomato transition"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={
      <main className="mx-auto max-w-xl px-5 py-24 text-center">
        <p className="font-display text-sm font-semibold text-forest/60 animate-pulse">
          Loading welcome deal...
        </p>
      </main>
    }>
      <WelcomePageContent />
    </Suspense>
  );
}
