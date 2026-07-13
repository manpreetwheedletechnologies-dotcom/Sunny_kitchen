import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SignatureDish() {
  return (
    <section className="bg-cream py-16 md:py-24 px-5 md:px-8 border-b-2 border-forest/10">
      <div className="mx-auto max-w-6xl">
        <div className="bg-card rounded-[2.5rem] p-5 sm:p-10 lg:p-14 shadow-2xl border border-forest/5 flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
          
          {/* Left: Image */}
          <div className="w-full lg:w-1/2 relative h-[350px] sm:h-[450px] lg:h-[550px] rounded-[2rem] overflow-hidden shadow-lg border border-forest/5 shrink-0 group">
            <Image
              src="/peri-peri-sandwich.png"
              alt="Peri Peri Sandwich"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          
          {/* Right: Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-start text-left">
            <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-[#c09665] mb-4">
              SIGNATURE SANDWICH
            </p>
            
            <h2 className="font-script text-6xl md:text-7xl lg:text-8xl text-forest mb-6 leading-[0.9]">
              Peri Peri<br/>Sandwich
            </h2>
            
            <p className="font-body text-base sm:text-lg text-forest/80 leading-relaxed mb-8 max-w-lg">
              Freshly baked artisanal bread layered with fiery peri-peri marinated vegetables, melting cheese, and our secret in-house spicy spread. A bold and irresistibly satisfying combination that leaves a lasting kick.
            </p>
            
            <div className="flex flex-wrap gap-4 sm:gap-6 mb-10">
              <span className="font-display text-xs font-bold uppercase tracking-widest text-[#c09665]">
                SPICY & FIERY
              </span>
              <span className="font-display text-xs font-bold uppercase tracking-widest text-[#c09665]">
                MELTING CHEESE
              </span>
              <span className="font-display text-xs font-bold uppercase tracking-widest text-[#c09665]">
                FRESHLY GRILLED
              </span>
            </div>
            
            <Link
              href="/menu"
              className="inline-flex items-center rounded-full bg-[#c09665] px-10 py-4 font-display text-sm font-bold tracking-widest text-cream transition-all hover:bg-forest hover:shadow-xl hover:-translate-y-1"
            >
              View Menu <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
          </div>
          
        </div>
      </div>
    </section>
  );
}
