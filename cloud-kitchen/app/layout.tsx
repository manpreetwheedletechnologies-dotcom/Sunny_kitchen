import type { Metadata } from "next";
import Script from "next/script";
import "@fontsource/caveat/600.css";
import "@fontsource/caveat/700.css";
import "@fontsource/baloo-2/500.css";
import "@fontsource/baloo-2/600.css";
import "@fontsource/baloo-2/700.css";
import "@fontsource/baloo-2/800.css";
import "@fontsource/quicksand/400.css";
import "@fontsource/quicksand/500.css";
import "@fontsource/quicksand/600.css";
import "@fontsource/quicksand/700.css";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import { CartProvider } from "@/lib/cart-context";
import {
  LOCAL_BUSINESS_JSON_LD,
  SEO_DESCRIPTION,
  SEO_KEYWORDS,
  SEO_TITLE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SEO_TITLE, template: `%s | ${SITE_NAME}` },
  description: SEO_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    url: "/",
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    images: [{ url: `${SITE_URL}/hero_1.jpeg`, alt: "Fresh homemade food from Sunny's Kitchen, Indore" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    images: [`${SITE_URL}/hero_1.jpeg`],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Structured data: local business (Google Search / Maps) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_JSON_LD) }}
        />
        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-PRD9DSV4');`}
        </Script>
        {/* End Google Tag Manager */}

        {/* Google tag (gtag.js) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-P0T7TWX6DZ"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-P0T7TWX6DZ');`}
        </Script>
        {/* End Google tag (gtag.js) */}


        {/* <!-- Meta Pixel Code (two pixels: 1076290661990053 and 1586290979445564) --> */}
        <script>
          {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod ?
            n.callMethod.apply(n, arguments) : n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '1076290661990053');
          fbq('init', '1586290979445564');
          fbq('track', 'PageView');
         `}
        </script>

        {/* <!-- End Meta Pixel Code --> */}
      </head>
      <body className="font-body bg-cream text-ink antialiased">
        <noscript><img height="1" width="1" style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=1076290661990053&ev=PageView&noscript=1"
        /></noscript>
        <noscript><img height="1" width="1" style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=1586290979445564&ev=PageView&noscript=1"
        /></noscript>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PRD9DSV4"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        <CartProvider>
          <SiteChrome>{children}</SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}