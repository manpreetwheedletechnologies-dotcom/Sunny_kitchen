import { resolveImageUrl } from "@/lib/api";

export default function DishPhoto({
  emoji,
  imageUrl,
  label,
}: {
  emoji: string;
  imageUrl?: string | null;
  label: string;
}) {
  const src = resolveImageUrl(imageUrl);

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={label}
        className="aspect-square w-full rounded-full border-4 border-card object-cover shadow-md"
      />
    );
  }

  return (
    <div
      className="flex aspect-square w-full items-center justify-center rounded-full border-4 border-card bg-gradient-to-br from-sun/40 to-tomato/20 shadow-md"
      role="img"
      aria-label={label}
    >
      <span className="text-4xl md:text-5xl">{emoji}</span>
    </div>
  );
}
