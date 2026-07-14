import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function OurStory() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24 border-b-2 border-forest/10">
      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] items-center">
        {/* Left: Image */}
        <div className="relative overflow-hidden rounded-[2rem] shadow-2xl h-[300px] sm:h-[400px] lg:h-[500px]">
          <Image
            src="/hero_1.jpeg" 
            alt="Sunny's Kitchen Interior"
            fill
            className="object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>
        
        {/* Right: Content */}
        <div className="relative z-10 lg:pl-10">
          {/* Background Accent (Leaf shape approximation) */}
          <div className="pointer-events-none absolute -right-20 -top-20 -z-10 opacity-[0.03]">
            <svg width="400" height="500" viewBox="0 0 200 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 300C100 300 50 200 0 150C50 150 100 200 100 300Z" fill="#1b4332"/>
              <path d="M100 300C100 300 150 200 200 150C150 150 100 200 100 300Z" fill="#1b4332"/>
              <path d="M100 250C100 250 20 150 0 50C50 100 100 150 100 250Z" fill="#1b4332"/>
              <path d="M100 250C100 250 180 150 200 50C150 100 100 150 100 250Z" fill="#1b4332"/>
              <path d="M100 300L100 0" stroke="#1b4332" strokeWidth="4"/>
            </svg>
          </div>
          
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[#c09665] mb-2">
            ABOUT SUNNY&apos;S KITCHEN
          </p>
          <h2 className="font-script text-5xl md:text-7xl text-forest mb-8">
            Our Story
          </h2>
          <div className="space-y-6 text-forest/80 leading-relaxed font-body text-lg">
            <p>
              At Sunny&apos;s Kitchen, we believe every meal, every coffee, and every conversation deserves the perfect setting.
            </p>
            <p>
              Thoughtfully designed and passionately crafted, Sunny&apos;s Kitchen is more than just a kitchen; it is a destination for connections, celebrations, work sessions, and memorable experiences.
            </p>
          </div>
          <Link
            href="/about"
            className="mt-10 inline-flex items-center rounded-full bg-[#c09665] px-8 py-3.5 font-display text-sm font-bold tracking-widest text-cream transition-all hover:bg-forest hover:shadow-lg hover:scale-105"
          >
            Discover More About Us <ArrowRight className="ml-3 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
