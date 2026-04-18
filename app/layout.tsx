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
  metadataBase: new URL("https://auto-gomobility.vercel.app"),
  keywords: [
    "transfer Switzerland", "taxi Zurich", "luxury chauffeur Switzerland",
    "airport transfer Zurich", "private driver Switzerland", "VIP taxi",
    "business transfer", "limousine service Switzerland", "Mercedes chauffeur",
    "Flughafentransfer Zürich", "Taxi Schweiz", "Chauffeur Service Schweiz",
    "Luxus Transfer", "Privater Fahrer Schweiz", "VIP Fahrdienst",
    "transfert aéroport Zurich", "taxi Suisse", "chauffeur privé Suisse",
    "service de limousine", "transfert luxe Suisse",
    "trasferimento aeroporto Zurigo", "taxi Svizzera", "autista privato",
    "servizio limousine Svizzera", "trasferimento lusso",
    "трансфер Швейцария", "такси Цюрих", "частный водитель Швейцария",
    "VIP трансфер", "лимузин сервис",
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
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "Elite Chauffeur Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Transfer & Taxi Service Switzerland",
    description: "Luxury chauffeur & transfer service in Switzerland. Airport transfers, VIP taxi, Mercedes fleet.",
    images: ["/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: {
    canonical: "https://auto-gomobility.vercel.app",
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
              description: "Premium transfer & luxury chauffeur service in Switzerland. Airport transfers, business travel, VIP transportation.",
              url: "https://auto-gomobility.vercel.app",
              logo: "https://auto-gomobility.vercel.app/icon-512.png",
              image: "https://auto-gomobility.vercel.app/icon-512.png",
              "@id": "https://auto-gomobility.vercel.app",
              areaServed: { "@type": "Country", name: "Switzerland" },
              serviceType: ["Airport Transfer", "Business Chauffeur", "VIP Transportation", "Long Distance Transfer", "Limousine Service"],
              priceRange: "CHF 50 - CHF 500",
              currenciesAccepted: "CHF",
              paymentAccepted: "Cash, Credit Card",
              address: { "@type": "PostalAddress", addressCountry: "CH" },
              geo: { "@type": "GeoCoordinates", latitude: 47.3769, longitude: 8.5417 },
              openingHoursSpecification: { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], opens: "00:00", closes: "23:59" },
              sameAs: [],
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Transfer Services",
                itemListElement: [
                  { "@type": "Offer", itemOffered: { "@type": "Service", name: "Airport Transfer", description: "Premium airport pickup and drop-off in Zurich, Geneva, Basel" }},
                  { "@type": "Offer", itemOffered: { "@type": "Service", name: "Business Chauffeur", description: "Professional chauffeur for business meetings and corporate events" }},
                  { "@type": "Offer", itemOffered: { "@type": "Service", name: "VIP Transfer", description: "Luxury VIP transportation with premium Mercedes vehicles" }},
                  { "@type": "Offer", itemOffered: { "@type": "Service", name: "Long Distance Transfer", description: "Comfortable long-distance rides across Switzerland and Europe" }},
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
