import Link from "next/link";
import HeroBackground from "@/components/HeroBackground";
import SunIcon from "@/components/SunIcon";
import MenuCard from "@/components/MenuCard";
import DishPhoto from "@/components/DishPhoto";
import AddToCart from "@/components/AddToCart";
import OurStory from "@/components/OurStory";
import SignatureCollection from "@/components/SignatureCollection";
import SpecialFeatures from "@/components/SpecialFeatures";
import SignatureDish from "@/components/SignatureDish";
import Testimonials from "@/components/Testimonials";
import { badges } from "@/lib/menu";
import { getProducts, type Product } from "@/lib/api";
import { Sparkles, Star, Heart, Clock, ChefHat, Award, ArrowRight } from "lucide-react";
import logo from "../public/logo_f.png"
import Image from "next/image";
export default async function Home() {
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
    <main className="relative -mt-14 overflow-x-hidden">
      {/* Yellow Dot Pattern Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-dot-pattern opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-cream/80 via-cream/40 to-cream/80" />
      </div>

      {/* Animated Floating Dots */}
      <div className="pointer-events-none fixed inset-0 -z-5 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-sun/30"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `floatDot ${10 + Math.random() * 20}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`,
              transform: `scale(${0.5 + Math.random()})`,
            }}
          />
        ))}
      </div>

      {/* Hero with Background Image Slideshow */}
      <section className="relative overflow-hidden border-b-2 border-forest/10">
        <HeroBackground />

        {/* Animated background elements */}
        <div className="pointer-events-none absolute -left-10 -top-10 z-10 h-40 w-40 rounded-full bg-sun/40 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute -right-16 -top-16 z-10 h-48 w-48 rounded-full bg-sun/30 blur-3xl animate-pulse delay-1000" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 z-10 h-32 w-32 -translate-x-1/2 rounded-full bg-sun/20 blur-3xl animate-pulse delay-500" />

        {/* Yellow Dot Decoration */}
        <div className="pointer-events-none absolute left-8 top-8 z-10 h-3 w-3 rounded-full bg-sun/60 animate-ping" />
        <div className="pointer-events-none absolute right-12 top-12 z-10 h-4 w-4 rounded-full bg-sun/40 animate-ping delay-700" />
        <div className="pointer-events-none absolute bottom-12 left-1/4 z-10 h-2 w-2 rounded-full bg-sun/50 animate-ping delay-300" />

        <div className="relative z-20 mx-auto max-w-4xl px-5 pb-16 pt-32 text-center md:px-8 md:pb-24 md:pt-40">
          {/* <div className="ml-auto mb-4 hidden w-fit items-center gap-2 rounded-full border-2 border-forest bg-card/90 px-4 py-1.5 backdrop-blur-sm md:flex animate-fadeIn"> */}
            {/* <span className="font-display text-xs font-bold uppercase tracking-wide text-forest">
              Cloud kitchen · exclusive on
            </span>
            <span className="font-display text-sm font-extrabold text-tomato animate-pulse">
              zomato
            </span> */}
            {/* <Award className="h-4 w-4 text-sun" /> */}
          {/* </div> */}

          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 rounded-full bg-sun/40 blur-3xl animate-pulse" />
            <div className="absolute -inset-4 rounded-full border-2 border-sun/30 animate-spin-slow" style={{ animationDuration: '12s' }} />
            <div className="absolute -inset-8 rounded-full border border-sun/10 animate-spin-slow" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
            
            <div className="relative group">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-sun/40 via-tomato/20 to-sun/40 blur-2xl animate-pulse" />
              <Image
                src={logo}
                alt="Sunny's Kitchen"
                width={180}
                height={180}
                priority
                className="relative z-10 rounded-full object-cover ring-4 ring-sun/50 shadow-2xl transition-all duration-500 group-hover:ring-sun/80 group-hover:scale-105"
              />
            </div>
          </div>

          <h1 className="relative mt-4 font-script text-6xl leading-none text-forest drop-shadow-sm md:text-8xl animate-slideUp">
            Sunny&apos;s kitchen
            <span className="absolute -right-8 -top-4 text-2xl animate-bounce">✨</span>
          </h1>
          <p className="mt-3 font-display text-lg font-semibold text-forest/90 drop-shadow-sm md:text-xl animate-slideUp delay-100">
            Homemade Goodness, Just for You!
          </p>

          <div className="mx-auto mt-6 w-fit rounded-full bg-forest/95 px-6 py-3 shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:shadow-2xl animate-slideUp delay-200">
            <p className="font-display text-sm font-bold tracking-widest text-cream md:text-base">
              FRESH &nbsp;•&nbsp; HYGIENIC &nbsp;•&nbsp; TASTY
            </p>
            <p className="mt-0.5 font-body text-xs text-cream/80 md:text-sm">
              Made with love, delivered with care.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 animate-slideUp delay-300">
            <Link
              href="/menu"
              className="focus-ring group relative inline-flex items-center overflow-hidden rounded-full bg-tomato px-8 py-3 font-display text-sm font-bold text-cream shadow-lg transition-all hover:bg-forest hover:scale-105 hover:shadow-2xl"
            >
              <span className="relative z-10 flex items-center gap-2">
                View Menu
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-sun/30 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              <Sparkles className="absolute -right-2 -top-2 h-4 w-4 text-sun animate-pulse" />
            </Link>

            <Link
              href="/about"
              className="focus-ring group inline-flex items-center rounded-full border-2 border-forest/30 bg-cream/80 px-6 py-3 font-display text-sm font-semibold text-forest backdrop-blur-sm transition-all hover:scale-105 hover:border-forest hover:bg-cream hover:shadow-lg"
            >
              <ChefHat className="mr-2 h-4 w-4" />
              Our Story
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 md:gap-12 animate-slideUp delay-400">
            <div className="text-center">
              <p className="font-display text-2xl font-bold text-tomato">50+</p>
              <p className="font-display text-xs text-forest/70">Happy Customers</p>
            </div>
            <div className="h-8 w-px bg-forest/20" />
            <div className="text-center">
              <p className="font-display text-2xl font-bold text-tomato">20+</p>
              <p className="font-display text-xs text-forest/70">Delicious Items</p>
            </div>
            <div className="h-8 w-px bg-forest/20" />
            <div className="text-center">
              <p className="font-display text-2xl font-bold text-tomato">4.8★</p>
              <p className="font-display text-xs text-forest/70">Zomato Rating</p>
            </div>
          </div>
        </div>
      </section>

      <OurStory />
      <SignatureCollection products={products} />
      <SpecialFeatures />
      <SignatureDish />
      <Testimonials />



 
    </main>
  );
}