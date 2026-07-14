import { Product, resolveImageUrl } from "@/lib/api";
import Image from "next/image";
import DishPhoto from "./DishPhoto";
import AddToCart from "./AddToCart";

export default function MenuCard({ item }: { item: Product }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-sm transition-all hover:shadow-md">
      {/* Image Container */}
      <div className="relative h-56 w-full overflow-hidden bg-cream/40 flex items-center justify-center">
        {item.imageUrl ? (
          <Image
            src={resolveImageUrl(item.imageUrl) as string}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="h-24 w-24 transition-transform duration-700 group-hover:scale-110">
            <DishPhoto emoji={item.emoji} label={item.name} />
          </div>
        )}

        {/* Bottom Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Category Badge */}
        {item.category && (
          <div className="absolute bottom-3 right-3 z-10">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-forest shadow-lg backdrop-blur-md">
              {item.category}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col bg-white p-3 sm:p-4">
        {/* Dish Name */}
        <h3 className="mb-1 line-clamp-1 font-sans text-[15px] font-bold leading-tight text-forest sm:text-[16px]">
          {item.name}
        </h3>

        {/* Ingredients */}
        {/* <p className="mt-1 line-clamp-2 text-[13px] text-gray-500">
          {item.ingredients || "North Indian, Snacks, Beverages"}
        </p> */}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between pt-2">
          <div className="text-[17px] font-extrabold text-gray-900 sm:text-lg">
            ₹{item.price}
          </div>

          <AddToCart
            id={item._id}
            name={item.name}
            price={item.price}
            emoji={item.emoji}
            outOfStock={item.outOfStock}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}