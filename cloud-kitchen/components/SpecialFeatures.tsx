import { Utensils, Leaf, ShieldCheck, Clock } from "lucide-react";

const features = [
  {
    num: "01",
    title: "HOME-COOKED GOODNESS",
    desc: "Meals prepared with love, using authentic family recipes that bring the comfort of home right to your doorstep.",
    icon: <Utensils className="h-6 w-6 text-[#c09665]" />,
  },
  {
    num: "02",
    title: "FRESH INGREDIENTS",
    desc: "We source the finest, freshest local ingredients daily to ensure every dish is packed with nutrition and natural flavor.",
    icon: <Leaf className="h-6 w-6 text-[#c09665]" />,
  },
  {
    num: "03",
    title: "HYGIENIC KITCHEN",
    desc: "Prepared in a pristine, state-of-the-art cloud kitchen maintaining the highest standards of cleanliness and food safety.",
    icon: <ShieldCheck className="h-6 w-6 text-[#c09665]" />,
  },
  {
    num: "04",
    title: "FAST & HOT DELIVERY",
    desc: "Optimized packaging and swift delivery ensuring your food arrives steaming hot and ready to be enjoyed instantly.",
    icon: <Clock className="h-6 w-6 text-[#c09665]" />,
  },
];

export default function SpecialFeatures() {
  return (
    <section className="bg-cream py-20 px-5 md:px-8 border-b-[px] border-sun/20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[#c09665] mb-3">
            THE SUNNY&apos;S KITCHEN EXPERIENCE
          </p>
          <h2 className="font-script text-5xl md:text-6xl text-forest">
            What Makes Sunny&apos;s Kitchen Special?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div 
              key={i} 
              className="bg-card rounded-2xl p-8 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all hover:-translate-y-1 border border-forest/5 flex flex-col group"
            >
              {/* Background Number */}
              <div className="absolute top-2 right-4 text-8xl font-display font-extrabold text-[#f5ebd2] group-hover:text-[#f0e3c0] transition-colors -z-0 select-none opacity-60">
                {f.num}
              </div>
              
              <div className="relative z-10 mt-4">
                <div className="mb-6 p-3 bg-cream inline-block rounded-xl border border-forest/5">
                  {f.icon}
                </div>
                <h3 className="font-display font-extrabold text-forest text-sm uppercase tracking-widest mb-4">
                  {f.title}
                </h3>
                <p className="font-body text-sm text-forest/70 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
