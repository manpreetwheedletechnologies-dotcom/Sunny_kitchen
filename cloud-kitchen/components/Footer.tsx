import SunIcon from "./SunIcon";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="border-t-2 border-forest/10 bg-creamDark">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-4 md:px-8">
        {/* Logo */}
        <div>
          <div className="flex items-center gap-2">
            <SunIcon className="h-8 w-8" />
            <span className="font-script text-2xl text-forest">
              Sunny&apos;s Kitchen
            </span>
          </div>

          <p className="mt-3 max-w-xs text-sm text-forest/70">
            Homemade goodness, just for you - fresh, hygienic, and made with
            love in a home-style cloud kitchen.
          </p>
        </div>

        {/* Kitchen Info */}
        <div>
          <p className="font-display text-sm font-bold text-forest">
            Kitchen
          </p>

          <p className="mt-3 text-sm text-forest/70">
            Open 07:00 AM - 11:00 AM daily
            <br />
            H.NO.29 Scheme 114 Part-1 Vijay Nagar,
            <br />
            Indore, Madhya Pradesh - 452010
          </p>
        </div>

        {/* Contact */}
        <div>
          <p className="font-display text-sm font-bold text-forest">
            Order
          </p>

          <p className="mt-3 text-sm text-forest/70">
            <a
              href="mailto:Sunnyskitchen8@gmail.com"
              className="hover:text-forest"
            >
              Sunnyskitchen8@gmail.com
            </a>
            <br />
            <a href="tel:+919827050095" className="hover:text-forest">
              +91 98270 50095
            </a>
          </p>
        </div>

        {/* Social Media */}
        <div>
          <p className="font-display text-sm font-bold text-forest">
            Find us on
          </p>

          <p className="mt-3 text-sm text-forest/70">
          
          </p>

          <div className="mt-4 flex items-center gap-3">
            <a
              href="https://www.facebook.com/profile.php?id=61591766826033"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-cream transition hover:scale-105 hover:bg-forest/80"
            >
              <FaFacebookF size={18} />
            </a>

            <a
              href="https://www.instagram.com/sunnys_kitchenfood/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-cream transition hover:scale-105 hover:bg-forest/80"
            >
              <FaInstagram size={18} />
            </a>

            <a
              href="https://x.com/sunnyskitchen8"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-cream transition hover:scale-105 hover:bg-forest/80"
            >
              <FaXTwitter size={18} />
            </a>

            <a
              href="https://www.youtube.com/@SunnysKitchen-u2i"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-cream transition hover:scale-105 hover:bg-forest/80"
            >
              <FaYoutube size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t-2 border-forest/10 bg-forest px-5 py-3 text-center font-display text-xs font-semibold uppercase tracking-widest text-cream md:px-8">
        Good food · Good mood · Everytime
        <span className="mx-2 text-cream/30">·</span>
        <a
          href="/admin/login"
          className="text-cream/40 transition hover:text-cream/80"
        >
          Kitchen Admin
        </a>
      </div>
    </footer>
  );
}