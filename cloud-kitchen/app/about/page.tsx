import { badges } from "@/lib/menu";
import Image from "next/image";
import hero1 from "../../public/hero_1.jpeg";
import Testimonials from "@/components/Testimonials";


const facts = [
  { label: "Dishes on the menu", value: "10+" },
  { label: "Cooked fresh, daily", value: "100%" },
  { label: "Avg. delivery time", value: "35 min" },
  { label: "Home cooks in the kitchen", value: "3" },
];

export default function AboutPage() {
  return (
    <main className="bg-cream min-h-screen pb-10">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[450px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={hero1}
            alt="Sunny's Kitchen Cooking"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-forest/50 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-cream via-transparent to-transparent" />
          {/* Top gradient to make the dark header text readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream/70 to-transparent h-52" />
        </div>

        <div className="relative z-10 text-center px-5 max-w-4xl mx-auto mt-26">
          <p className="font-display text-sm font-extrabold uppercase tracking-[0.3em] text-sun drop-shadow-md mb-4">
            Our Story
          </p>
          <h1 className="font-script text-6xl text-cream md:text-8xl drop-shadow-2xl mb-6">
            From our home to yours
          </h1>
        </div>
      </section>

      {/* Enhanced Story Text Section */}
      <section className="relative z-20 -mt24 mx-auto max-w-5xl px-5 pb-20 md:px-8">
        <div className="bg-white rounded-[2rem] shadow-2xl border border-forest/5 p-8 md:p-14 lg:p-20">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6 text-center md:text-left">
              <h2 className="font-display text-3xl font-extrabold text-forest md:text-4xl leading-tight">
                What Makes Sunny's Kitchen Special?
              </h2>
              <p className="font-body text-lg text-forest/70 leading-relaxed">
                Sunny's Kitchen brings together the freshness of quality ingredients, the comfort of homestyle cooking, and the experience of a premium café in every order. 
              </p>
              <p className="font-body text-lg text-forest/70 leading-relaxed">
              From thoughtful preparation and exceptional hygiene to flavours crafted to delight, we believe great food should do more than satisfy hunger, it should brighten your day and leave you looking forward to your next meal.
              </p>
              <div className="pt-4 flex justify-center md:justify-start">
                <div className="h-1.5 w-24 bg-tomato rounded-full opacity-80"></div>
              </div>
            </div>

            <div className="w-full md:w-2/5 flex flex-col gap-6">
              <div className="relative h-72 w-full rounded-[2rem] overflow-hidden shadow-xl border-[6px] border-white transform rotate-3 transition-transform hover:rotate-0 duration-500">
                <Image src={hero1} alt="Cooking with love" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facts Section */}
      <section className="bg-forest text-cream py-16 border-y-4 border-sun/20 shadow-inner">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 sm:grid-cols-2 md:grid-cols-4 md:px-8">
          {facts.map((f) => (
            <div key={f.label} className="text-center group">
              <p className="font-display text-5xl font-black text-sun mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:text-tomato drop-shadow-md">
                {f.value}
              </p>
              <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-cream/70">
                {f.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Us Section */}
      <section className="mx-auto max-w-5xl px-5 py-20 md:px-8 md:py-24">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="bg-card p-10 rounded-3xl shadow-md border border-forest/10 hover:shadow-xl transition-all hover:-translate-y-1">
            <h2 className="font-display text-2xl font-black text-forest mb-5 flex items-center gap-4">
              <span className="bg-tomato text-cream w-12 h-12 flex items-center justify-center rounded-full text-xl shadow-md">1</span>
              Freshly Crafted, Never Rushed
            </h2>
            <p className="text-forest/75 leading-relaxed text-lg">
              Every dish is prepared fresh to order using quality ingredients, ensuring exceptional flavour and freshness every time.
            </p>
          </div>
          <div className="bg-card p-10 rounded-3xl shadow-md border border-forest/10 hover:shadow-xl transition-all hover:-translate-y-1">
            <h2 className="font-display text-2xl font-black text-forest mb-5 flex items-center gap-4">
              <span className="bg-tomato text-cream w-12 h-12 flex items-center justify-center rounded-full text-xl shadow-md">2</span>
              Café Quality, Delivered
            </h2>
            <p className="text-forest/75 leading-relaxed text-lg">
             We bring the warmth, comfort, and attention to detail of a premium café experience directly to your doorstep.
            </p>
          </div>
          <div className="bg-card p-10 rounded-3xl shadow-md border border-forest/10 hover:shadow-xl transition-all hover:-translate-y-1">
            <h2 className="font-display text-2xl font-black text-forest mb-5 flex items-center gap-4">
              <span className="bg-tomato text-cream w-12 h-12 flex items-center justify-center rounded-full text-xl shadow-md">3</span>
              Ingredients That Speak for Themselves
            </h2>
            <p className="text-forest/75 leading-relaxed text-lg">
              From fresh vegetables and artisanal breads to rich cheeses and carefully chosen seasonings, quality begins with what goes into every dish.
            </p>
          </div>
          <div className="bg-card p-10 rounded-3xl shadow-md border border-forest/10 hover:shadow-xl transition-all hover:-translate-y-1">
            <h2 className="font-display text-2xl font-black text-forest mb-5 flex items-center gap-4">
              <span className="bg-tomato text-cream w-12 h-12 flex items-center justify-center rounded-full text-xl shadow-md">4</span>
              Thoughtful Cooking, Exceptional Taste
            </h2>
            <p className="text-forest/75 leading-relaxed text-lg">
              Our food is prepared with precision and care, balancing comforting classics with flavours you'll want to come back for.
            </p>
          </div>
          <div className="bg-card p-10 rounded-3xl shadow-md border border-forest/10 hover:shadow-xl transition-all hover:-translate-y-1">
            <h2 className="font-display text-2xl font-black text-forest mb-5 flex items-center gap-4">
              <span className="bg-tomato text-cream w-12 h-12 flex items-center justify-center rounded-full text-xl shadow-md">5</span>
             Hygiene Meets Hospitality
            </h2>
            <p className="text-forest/75 leading-relaxed text-lg">
             Maintaining the highest standards of cleanliness, preparation, and packaging is as important to us as the food itself.
            </p>
          </div>
          <div className="bg-card p-10 rounded-3xl shadow-md border border-forest/10 hover:shadow-xl transition-all hover:-translate-y-1">
            <h2 className="font-display text-2xl font-black text-forest mb-5 flex items-center gap-4">
              <span className="bg-tomato text-cream w-12 h-12 flex items-center justify-center rounded-full text-xl shadow-md">6</span>
             Made for Everyday Indulgence
            </h2>
            <p className="text-forest/75 leading-relaxed text-lg">
              Whether you're craving a perfectly grilled sandwich, a wholesome breakfast, or a comforting meal, Sunny's Kitchen turns everyday dining into something worth looking forward to.
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="mt-16 grid grid-cols-2 gap-8 rounded-[2.5rem] border-2 border-forest/5 bg-white p-10 sm:grid-cols-4 shadow-sm hover:shadow-lg transition-shadow">
          {badges.map((b) => (
            <div key={b.label} className="text-center flex flex-col items-center justify-center group">
              <div className="bg-cream w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4 shadow-inner group-hover:scale-110 group-hover:bg-sun/20 transition-all duration-300">
                {b.emoji}
              </div>
              <p className="font-display text-sm font-black text-forest tracking-wide uppercase">
                {b.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Testimonials />
    </main>
  );
}
