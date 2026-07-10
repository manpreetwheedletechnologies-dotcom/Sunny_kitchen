import { badges } from "@/lib/menu";
import SunIcon from "@/components/SunIcon";

const facts = [
  { label: "Dishes on the menu", value: "10+" },
  { label: "Cooked fresh, daily", value: "100%" },
  { label: "Avg. delivery time", value: "35 min" },
  { label: "Home cooks in the kitchen", value: "3" },
];

export default function AboutPage() {
  return (
    <main>
      <section className="border-b-2 border-forest/10">
        <div className="mx-auto max-w-4xl px-5 py-14 text-center md:px-8 md:py-20">
          <SunIcon className="mx-auto h-14 w-14" />
          <p className="mt-3 font-display text-sm font-bold uppercase tracking-widest text-tomato">
            Our story
          </p>
          <h1 className="mt-2 font-script text-6xl text-forest md:text-7xl">
            From our home to yours
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-forest/70">
            Sunny&apos;s Kitchen started as a handful of tiffins made for
            neighbours who didn&apos;t want to cook on a busy weekday. No
            dining room, no menu printed in five languages — just simple,
            homestyle food, made fresh in small batches and sent out the door
            while it&apos;s still warm.
          </p>
        </div>
      </section>

      <section className="border-b-2 border-forest/10 bg-creamDark">
        <div className="mx-auto grid max-w-4xl gap-8 px-5 py-12 sm:grid-cols-2 md:grid-cols-4 md:px-8">
          {facts.map((f) => (
            <div key={f.label} className="text-center">
              <p className="font-display text-3xl font-extrabold text-tomato">
                {f.value}
              </p>
              <p className="mt-1 font-display text-xs font-semibold uppercase tracking-widest text-forest/70">
                {f.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-14 md:px-8 md:py-20">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-forest">
              Why homemade, not restaurant-style
            </h2>
            <p className="mt-3 text-forest/70">
              Restaurant kitchens cook for volume. Ours cooks for taste —
              small batches, simple ingredients, and recipes that come from
              an actual home kitchen rather than a commercial one. What you
              order is close to what we&apos;d make for ourselves.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-forest">
              Why it&apos;s only on Zomato
            </h2>
            <p className="mt-3 text-forest/70">
              Keeping to one platform means one queue, one kitchen, and no
              orders falling through the cracks between apps. It&apos;s a
              small kitchen choice that keeps every plate consistent.
            </p>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-6 rounded-3xl border-2 border-forest/15 bg-card p-6 sm:grid-cols-4">
          {badges.map((b) => (
            <div key={b.label} className="text-center">
              <span className="text-2xl">{b.emoji}</span>
              <p className="mt-1 font-display text-xs font-semibold text-forest/80">
                {b.label}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
