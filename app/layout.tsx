import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getLocale } from "@/lib/i18n/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Premium Transfer & Taxi Service Switzerland | Luxury Chauffeur",
    template: "%s | Elite Chauffeur Switzerland",
  },
  description:
    "Luxury private chauffeur & transfer service in Switzerland. Airport transfers Zurich, Geneva, Basel. Business travel, VIP taxi, long-distance rides. Premium Mercedes fleet. Book your Swiss transfer today.",
  metadataBase: new URL("https://autogomobility.com"),
  keywords: [
    // EN — core
    "transfer Switzerland",
    "taxi Switzerland",
    "luxury chauffeur Switzerland",
    "private driver Switzerland",
    "airport transfer Zurich",
    "airport transfer Geneva",
    "airport transfer Basel",
    "airport transfer Bern",
    "airport shuttle Zurich",
    "airport taxi Zurich",
    "Zurich airport pickup",
    "Geneva airport transfer",
    "VIP taxi Switzerland",
    "VIP transfer Zurich",
    "VIP limousine Switzerland",
    "business transfer Switzerland",
    "corporate chauffeur Zurich",
    "executive car service",
    "limousine service Switzerland",
    "Mercedes chauffeur service",
    "luxury car service Zurich",
    "long distance transfer Switzerland",
    "intercity transfer Switzerland",
    "private car hire Switzerland",
    "premium taxi service",
    "door to door transfer",
    "Swiss Alps transfer",
    "ski resort transfer Switzerland",
    "hotel transfer Switzerland",
    "wedding car Switzerland",
    "event transportation Zurich",
    "night transfer Zurich",
    "hourly chauffeur Switzerland",
    "chauffeur on demand",
    "24/7 taxi service Switzerland",
    "safe ride Switzerland",
    "reliable transfer service",
    "professional driver Zurich",
    "luxury ride Zurich",
    "first class transfer",
    "premium transfer service",
    "book transfer online Switzerland",
    "instant booking taxi",
    // DE
    "Transfer Schweiz",
    "Taxi Schweiz",
    "Flughafentransfer Zürich",
    "Flughafentransfer Genf",
    "Flughafentransfer Basel",
    "Chauffeur Service Schweiz",
    "Luxus Transfer Schweiz",
    "Privater Fahrer Schweiz",
    "VIP Fahrdienst Schweiz",
    "Limousine Schweiz",
    "Business Transfer Zürich",
    "Taxi Zürich bestellen",
    "Flughafen Taxi Zürich",
    "Langstrecken Transfer",
    "Chauffeur mieten Schweiz",
    "Premium Taxi Zürich",
    "Mercedes Chauffeur Zürich",
    "Luxus Taxi Schweiz",
    "Privat Transfer Schweiz",
    "Shuttle Service Zürich",
    "Firmen Transfer Schweiz",
    "Hochzeitstransfer Schweiz",
    "Ski Transfer Schweiz",
    "Hotel Transfer Zürich",
    "24 Stunden Taxi Schweiz",
    // FR
    "transfert Suisse",
    "taxi Suisse",
    "transfert aéroport Zurich",
    "transfert aéroport Genève",
    "transfert aéroport Bâle",
    "chauffeur privé Suisse",
    "service de limousine Suisse",
    "VIP transfert Suisse",
    "taxi luxe Suisse",
    "voiture avec chauffeur",
    "transfert longue distance",
    "navette aéroport Zurich",
    "taxi premium Suisse",
    "chauffeur professionnel",
    "réservation taxi Suisse",
    "transport VIP Genève",
    "Mercedes avec chauffeur",
    "transfert privé Suisse",
    "service transfert 24h",
    "transfert mariage Suisse",
    "transfert ski Suisse",
    "transport événementiel",
    // IT
    "trasferimento Svizzera",
    "taxi Svizzera",
    "trasferimento aeroporto Zurigo",
    "trasferimento aeroporto Ginevra",
    "autista privato Svizzera",
    "servizio limousine Svizzera",
    "trasferimento lusso Svizzera",
    "taxi lusso Svizzera",
    "VIP transfer Svizzera",
    "noleggio con conducente",
    "NCC Svizzera",
    "transfer business Svizzera",
    "Mercedes con autista",
    "navetta aeroporto Zurigo",
    "trasferimento lungo raggio",
    "trasferimento hotel",
    "trasferimento sci Svizzera",
    "auto con autista Zurigo",
    // RU
    "трансфер Швейцария",
    "такси Швейцария",
    "такси Цюрих",
    "трансфер аэропорт Цюрих",
    "трансфер аэропорт Женева",
    "частный водитель Швейцария",
    "VIP трансфер Швейцария",
    "лимузин сервис Швейцария",
    "бизнес трансфер Цюрих",
    "люкс такси Швейцария",
    "трансфер Мерседес",
    "заказать трансфер Швейцария",
    "трансфер онлайн",
    "междугородний трансфер Швейцария",
    "трансфер горнолыжный курорт",
    "свадебный трансфер Швейцария",
    "персональный водитель Цюрих",
    "трансфер из аэропорта",
    "круглосуточное такси Швейцария",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Premium Transfer & Taxi Service Switzerland | Luxury Chauffeur",
    description:
      "Luxury private chauffeur & transfer service in Switzerland. Airport transfers, business travel, VIP transportation. Premium Mercedes fleet.",
    type: "website",
    locale: "en_CH",
    alternateLocale: ["de_CH", "fr_CH", "it_CH", "ru"],
    siteName: "Elite Chauffeur Switzerland",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Elite Chauffeur — Premium Transfer Service Switzerland",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Transfer & Taxi Service Switzerland",
    description:
      "Luxury chauffeur & transfer service in Switzerland. Airport transfers, VIP taxi, Mercedes fleet.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://autogomobility.com",
  },
  category: "transportation",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link
          rel="preconnect"
          href="https://images.unsplash.com"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Elite Chauffeur Switzerland",
              description:
                "Premium transfer & luxury chauffeur service in Switzerland. Airport transfers, business travel, VIP transportation.",
              url: "https://autogomobility.com",
              logo: "https://autogomobility.com/icon-512.png",
              image: "https://autogomobility.com/icon-512.png",
              "@id": "https://autogomobility.com",
              areaServed: { "@type": "Country", name: "Switzerland" },
              serviceType: [
                "Airport Transfer",
                "Business Chauffeur",
                "VIP Transportation",
                "Long Distance Transfer",
                "Limousine Service",
              ],
              priceRange: "CHF 50 - CHF 500",
              currenciesAccepted: "CHF",
              paymentAccepted: "Cash, Credit Card",
              address: { "@type": "PostalAddress", addressCountry: "CH" },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 47.3769,
                longitude: 8.5417,
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
                opens: "00:00",
                closes: "23:59",
              },
              sameAs: [],
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Transfer Services",
                itemListElement: [
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Airport Transfer",
                      description:
                        "Premium airport pickup and drop-off in Zurich, Geneva, Basel",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Business Chauffeur",
                      description:
                        "Professional chauffeur for business meetings and corporate events",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "VIP Transfer",
                      description:
                        "Luxury VIP transportation with premium Mercedes vehicles",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Long Distance Transfer",
                      description:
                        "Comfortable long-distance rides across Switzerland and Europe",
                    },
                  },
                ],
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
