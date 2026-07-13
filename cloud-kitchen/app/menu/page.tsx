import MenuCard from "@/components/MenuCard";
import { getProducts, type Product } from "@/lib/api";
import Testimonials from "@/components/Testimonials";


export default async function MenuPage() {
  let products: Product[] = [];
  let loadError = false;

  try {
    products = await getProducts();
  } catch {
    loadError = true;
  }

  const menuItems = products.filter((p) => !p.isCombo);
  const combo = products.find((p) => p.isCombo);



  return (
    <main className="mx-auto max-w-4xl px-5 py-14 md:px-8 md:py-20">
      <p className="font-display text-sm font-bold uppercase tracking-widest text-tomato">
        Fresh · Hygienic · Tasty
      </p>
      <h1 className="mt-2 font-script text-6xl text-forest md:text-7xl">
        Full Menu
      </h1>
      <p className="mt-3 max-w-md text-forest/70">
        Everything is cooked fresh, same-day, in small batches. Prices are in
        ₹ per plate unless noted.
      </p>

      {loadError ? (
        <p className="mt-10 rounded-2xl border-2 border-tomato/30 bg-card p-6 text-center font-display text-sm font-semibold text-tomato">
          Couldn&apos;t load the menu right now — the kitchen&apos;s server
          might be offline. Please try again shortly.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {menuItems.map((item) => (
            <MenuCard key={item._id} item={item} />
          ))}
        </div>
      )}
      {/* Testimonials */}
      <Testimonials />

    </main>
  );
}
