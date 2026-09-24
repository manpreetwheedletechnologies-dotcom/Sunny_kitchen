/** Single source of truth for SEO copy — edit here, it updates everywhere. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://sunnyskitchen.kitchen"
).replace(/\/$/, "");

export const SITE_NAME = "Sunny's Kitchen";

export const SEO_TITLE =
  "Sunny's Kitchen | Homemade Sandwiches, Pasta & Tiffin - Indore";

export const SEO_DESCRIPTION =
  "Order fresh, hygienic homemade food online in Indore - sandwiches, pasta, omelettes & tiffin meals. 4.8 rated cloud kitchen. Order directly on our website!";

export const SEO_KEYWORDS = [
  "Sunny's Kitchen",
  "homemade food Indore",
  "cloud kitchen Indore",
  "tiffin service Indore",
  "tiffin Vijay Nagar",
  "sandwich delivery Indore",
  "pasta delivery Indore",
  "masala omelette",
  "order food online Indore",
  "home style food Vijay Nagar",
];

/** schema.org Restaurant data — helps Google show the business in Search/Maps. */
export const LOCAL_BUSINESS_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "@id": `${SITE_URL}/#restaurant`,
  name: SITE_NAME,
  url: SITE_URL,
  description: SEO_DESCRIPTION,
  image: `${SITE_URL}/hero_1.jpeg`,
  logo: `${SITE_URL}/logo.png`,
  email: "Sunnyskitchen8@gmail.com",
  telephone: "+919893955887",
  servesCuisine: ["Indian", "Homemade", "Sandwiches", "Pasta", "Tiffin"],
  areaServed: "Indore",
  address: {
    "@type": "PostalAddress",
    streetAddress: "H.NO.29 Scheme 114 Part-1 Vijay Nagar",
    addressLocality: "Indore",
    addressRegion: "Madhya Pradesh",
    postalCode: "452010",
    addressCountry: "IN",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "07:00",
    closes: "21:00",
  },
  sameAs: [
    "https://www.facebook.com/profile.php?id=61591766826033",
    "https://www.instagram.com/sunnys_kitchenfood/",
    "https://x.com/sunnyskitchen8",
    "https://www.youtube.com/@SunnysKitchen-u2i",
  ],
};
