"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const images = [
  "/hero_1.jpeg",
  "/hero_2.jpeg",
  "/hero_3.jpeg",
];

export default function HeroBackground() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <div className="relative h-full w-full">
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt="Delicious homemade food spread"
            fill
            className={`object-cover object-[center_70%] transition-opacity duration-1000 ease-in-out ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
            priority={i === 0}
            quality={100}
            unoptimized={true}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-cream/95 via-cream/80 to-cream/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-cream/95 via-cream/10 to-cream/60" />
      </div>
    </div>
  );
}