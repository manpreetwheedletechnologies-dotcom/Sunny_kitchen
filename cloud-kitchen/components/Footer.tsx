import SunIcon from "./SunIcon";

export default function Footer() {
  return (
    <footer className="border-t-2 border-forest/10 bg-creamDark">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-4 md:px-8">
        <div>
          <div className="flex items-center gap-2">
            <SunIcon className="h-8 w-8" />
            <span className="font-script text-2xl text-forest">
              Sunny&apos;s kitchen
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-forest/70">
            Homemade goodness, just for you - fresh, hygienic, and made with
            love in a home-style cloud kitchen.
          </p>
        </div>
        <div>
          <p className="font-display text-sm font-bold text-forest">
            Kitchen
          </p>
          <p className="mt-3 text-sm text-forest/70">
            Open 10:00 - 22:00 daily
           <br />
            H.NO.29 Scheme 114 Part-1 Vijay Nagar, Indore, Indore, Indore, Madhya Pradesh-452010
          </p>
        </div>
        <div>
          <p className="font-display text-sm font-bold text-forest">
            Order
          </p>
          <p className="mt-3 text-sm text-forest/70">
            Sunnyskitchen8@gmail.com
            <br />
            +91 98270 50095
          </p>
        </div>
        <div>
          <p className="font-display text-sm font-bold text-forest">
            Find us on
          </p>
          <p className="mt-3 text-sm text-forest/70">
            Cloud kitchen - exclusive on Zomato
          </p>
        </div>
      </div>
      <div className="border-t-2 border-forest/10 bg-forest px-5 py-3 text-center font-display text-xs font-semibold uppercase tracking-widest text-cream md:px-8">
        Good food · Good mood · Everytime
        <span className="mx-2 text-cream/30">·</span>
        <a href="/admin/login" className="text-cream/40 transition hover:text-cream/80">
          Kitchen Admin
        </a>
      </div>
    </footer>
  );
}
