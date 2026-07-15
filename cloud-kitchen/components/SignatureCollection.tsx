"use client";
import { Product, resolveImageUrl } from "@/lib/api";
import { useEffect, useRef, useState } from "react";
import DishPhoto from "@/components/DishPhoto";
import Image from "next/image";
import Link from "next/link";

export default function SignatureCollection({ products }: { products: Product[] }) {
  // Take up to 5 non-combo products as signature items
  const signatureItems = products.filter(p => !p.isCombo).slice(0, 5);
  
  if (signatureItems.length === 0) return null;

  // Duplicate the array to create seamless loop
  const scrollItems = [...signatureItems, ...signatureItems];

  const [activeIndex, setActiveIndex] = useState(0);
const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);

useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          const idx = Number(entry.target.getAttribute("data-idx"));
          setActiveIndex(idx);
        }
      });
    },
    { threshold: [0.6], root: null }
  );

  cardRefs.current.forEach((el) => el && observer.observe(el));
  return () => observer.disconnect();
}, [signatureItems.length]);

  return (
    <section className="bg-cream py-20 overflow-hidden border-b-2 border-forest/10">
      <div className="text-center mb-12 relative z-10">
        <h2 className="text-forest font-script text-5xl md:text-6xl mb-3 drop-shadow-sm">
          Signature Collection
        </h2>
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-[1px] w-12 bg-forest/20"></div>
          <p className="text-[#c09665] font-display text-sm uppercase tracking-[0.3em] font-bold">
            Handcrafted Favourites
          </p>
          <div className="h-[1px] w-12 bg-forest/20"></div>
        </div>
      </div>
      
      <div className="relative w-full hidden sm:block">
        {/* Fading edges for marquee */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 sm:w-24 bg-gradient-to-r from-cream to-transparent"></div>
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 sm:w-24 bg-gradient-to-l from-cream to-transparent"></div>

        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] gap-6 px-3">
          {scrollItems.map((item, i) => (
            <Link 
              href="/menu"
              key={`${item._id}-${i}`} 
              className="bg-card w-[280px] sm:w-[320px] shrink-0 rounded-[2rem] overflow-hidden flex flex-col border border-forest/10 transition-all hover:-translate-y-2 hover:shadow-2xl focus-ring block"
            >
              <div className="bg-cream/40 h-56 flex items-center justify-center relative overflow-hidden group">
                {item.imageUrl ? (
                  <Image
                    src={resolveImageUrl(item.imageUrl) as string}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-sun/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-36 h-36 transition-transform duration-700 group-hover:scale-110 drop-shadow-2xl">
                      <DishPhoto emoji={item.emoji} label={item.name} />
                    </div>
                  </>
                )}
              </div>
              <div className="p-8 text-center flex-1 flex flex-col bg-card relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-forest text-cream shadow-md text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  ₹{item.price}
                </div>
                <h3 className="font-display font-extrabold text-forest text-lg uppercase tracking-wide mb-3 mt-2">
                  {item.name}
                </h3>
                <p className="font-body text-sm text-forest/70 leading-relaxed">
                  {item.ingredients || "Crafted with premium ingredients and our signature blend of authentic flavors."}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile: snap-scroll focus carousel */}
<div className="sm:hidden">
  <div
    className="flex overflow-x-auto snap-x snap-mandatory gap-5 px-[12vw] pb-4 no-scrollbar"
    style={{ scrollSnapType: "x mandatory" }}
  >
    {signatureItems.map((item, i) => {
      const isActive = i === activeIndex;
      return (
        <Link
          href="/menu"
          key={item._id}
          data-idx={i}
          ref={(el) => { cardRefs.current[i] = el; }}
          className={`snap-center shrink-0 w-[76vw] rounded-[2rem] overflow-hidden flex flex-col border transition-all duration-500 ease-out block ${
            isActive
              ? "scale-100 opacity-100 border-forest/20 shadow-2xl"
              : "scale-90 opacity-50 border-forest/10 shadow-md"
          }`}
        >
          <div className="bg-cream/40 h-52 flex items-center justify-center relative overflow-hidden">
            {item.imageUrl ? (
              <Image
                src={resolveImageUrl(item.imageUrl) as string}
                alt={item.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-32 h-32 drop-shadow-2xl">
                <DishPhoto emoji={item.emoji} label={item.name} />
              </div>
            )}
          </div>
          <div className="p-6 text-center flex-1 flex flex-col bg-card relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-forest text-cream shadow-md text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              ₹{item.price}
            </div>
            <h3 className="font-display font-extrabold text-forest text-base uppercase tracking-wide mb-2 mt-2">
              {item.name}
            </h3>
            <p className="font-body text-sm text-forest/70 leading-relaxed">
              {item.ingredients || "Crafted with premium ingredients and our signature blend of authentic flavors."}
            </p>
          </div>
        </Link>
      );
    })}
  </div>

  {/* Dot indicators */}
  <div className="flex justify-center gap-2 mt-5">
    {signatureItems.map((_, i) => (
      <div
        key={i}
        className={`h-1.5 rounded-full transition-all duration-300 ${
          i === activeIndex ? "w-6 bg-forest" : "w-1.5 bg-forest/25"
        }`}
      />
    ))}
  </div>
</div>
    </section>
  );
}
