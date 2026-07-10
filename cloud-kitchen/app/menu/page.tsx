import MenuRow from "@/components/MenuRow";
import DishPhoto from "@/components/DishPhoto";
import AddToCart from "@/components/AddToCart";
import { getProducts, type Product } from "@/lib/api";

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

  const rows: [Product, Product | null][] = [];
  for (let i = 0; i < menuItems.length; i += 2) {
    rows.push([menuItems[i], menuItems[i + 1] ?? null]);
  }

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
        <>
          <div className="mt-10 rounded-3xl border-2 border-forest/15 bg-card px-5 py-2 shadow-sm md:px-10">
            {rows.map(([left, right], i) => (
              <MenuRow
                key={left._id}
                left={left}
                right={right}
                leftN={i * 2 + 1}
                rightN={right ? i * 2 + 2 : null}
              />
            ))}
          </div>

          {combo && (
            <div className="mt-8 rounded-3xl border-2 border-forest/15 bg-card p-6">
              <span className="inline-block rounded-full bg-forest px-4 py-1.5 font-display text-sm font-bold text-cream">
                Combo Deal
              </span>
              <div className="mt-4 flex items-center gap-4">
                <DishPhoto emoji={combo.emoji} imageUrl={combo.imageUrl} label={combo.name} />
                <div>
                  <p className="font-display text-lg font-semibold leading-tight text-forest">
                    {combo.name}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-block rounded-md bg-tomato px-4 py-1.5 font-display text-lg font-extrabold text-cream">
                      ₹{combo.price}
                    </span>
                    <AddToCart
                      id={combo._id}
                      name={combo.name}
                      price={combo.price}
                      emoji={combo.emoji}
                      outOfStock={combo.outOfStock}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
