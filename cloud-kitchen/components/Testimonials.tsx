"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { getTestimonials, type Testimonial } from "@/lib/api";

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    getTestimonials().then(setTestimonials).catch(console.error);
  }, []);

  if (testimonials.length === 0) return null;

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <section className="relative overflow-hidden border-b-2 border-forest/10 bg-cream px-5 py-16 md:px-8 md:py-24">
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <p className="mb-4 font-display text-xs font-bold uppercase tracking-[0.3em] text-[#c09665]">
          TESTIMONIALS
        </p>

        <h2 className="mb-12 font-script text-5xl text-forest md:text-7xl">
          What Our Guests Say
        </h2>

        <div className="relative rounded-[2.5rem] border border-forest/5 bg-card p-8 shadow-2xl md:p-14">
          <Quote className="absolute left-6 top-6 h-12 w-12 rotate-180 text-[#c09665]/20" />

          {/* Slider */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial._id ?? index}
                  className="flex w-full flex-shrink-0 flex-col items-center justify-center"
                >
                  <div className="min-h-[170px] flex flex-col items-center justify-center">
                    <p className="mb-8 px-4 text-lg italic leading-relaxed text-forest/80 md:px-12 md:text-2xl">
                      "{testimonial.content}"
                    </p>

                    <div className="flex flex-col items-center gap-2">
                      <div className="mb-1 flex gap-1">
                        {Array.from({ length: testimonial.rating }).map(
                          (_, i) => (
                            <span key={i} className="text-xl text-sun">
                              ⭐
                            </span>
                          )
                        )}
                      </div>

                      <h4 className="font-display text-lg font-bold uppercase tracking-wide text-forest">
                        {testimonial.name}
                      </h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-forest/10 bg-cream p-3 text-forest shadow-lg transition-all duration-300 hover:scale-110 hover:bg-forest hover:text-cream"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                onClick={next}
                className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 rounded-full border border-forest/10 bg-cream p-3 text-forest shadow-lg transition-all duration-300 hover:scale-110 hover:bg-forest hover:text-cream"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentIndex
                        ? "w-6 bg-[#c09665]"
                        : "w-2 bg-forest/20 hover:bg-forest/40"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}