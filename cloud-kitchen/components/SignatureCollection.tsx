import { Product, resolveImageUrl } from "@/lib/api";
import DishPhoto from "@/components/DishPhoto";
import Image from "next/image";

export default function SignatureCollection({ products }: { products: Product[] }) {
  // Take up to 4 non-combo products as signature items
  const signatureItems = products.filter(p => !p.isCombo).slice(0, 5);
  
  if (signatureItems.length === 0) return null;

  // Duplicate the array to create seamless loop
  const scrollItems = [...signatureItems, ...signatureItems];

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
      
      <div className="relative w-full">
        {/* Fading edges for marquee */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 sm:w-24 bg-gradient-to-r from-cream to-transparent"></div>
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 sm:w-24 bg-gradient-to-l from-cream to-transparent"></div>

        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] gap-6 px-3">
          {scrollItems.map((item, i) => (
            <div 
              key={`${item._id}-${i}`} 
              className="bg-card w-[280px] sm:w-[320px] shrink-0 rounded-[2rem] overflow-hidden flex flex-col border border-forest/10 transition-all hover:-translate-y-2 hover:shadow-2xl"
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
