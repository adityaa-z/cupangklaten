import { Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "Cupang Klaten | Jual Ikan Cupang Klaten Berkualitas & Bergaransi",
  description: "Pusat Ikan Cupang Klaten terbaik. Jual Cupang HMPK, Giant, Plakat, dan Crowntail dengan genetik stabil dan warna tajam. Kirim ke seluruh Indonesia dengan garansi ikan hidup.",
  keywords: "cupang klaten, jual cupang klaten, ikan cupang klaten, cupang hmpk klaten, giant betta klaten, cupang hias klaten, cupang kontes klaten",
  verification: {
    google: "Cm3Ij7HVbOgV1-1DpBXwz4qqYm9Yjgftqt8HN5m0qsM",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Cupang Klaten | Koleksi Ikan Cupang Terbaik",
    description: "Jual Ikan Cupang Klaten berkualitas. Koleksi Cupang HMPK, Giant, Plakat, dan Crowntail terbaik dari Klaten.",
    url: "https://www.cupangklaten.my.id",
    siteName: "Cupang Klaten",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  alternates: {
    canonical: "https://www.cupangklaten.my.id",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        {/* Google Analytics */}
        <Script 
          src="https://www.googletagmanager.com/gtag/js?id=G-FK0V45L2R9" 
          strategy="afterInteractive" 
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-FK0V45L2R9');
          `}
        </Script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Cupang Klaten",
              "image": "https://www.cupangklaten.my.id/logo.png",
              "logo": "https://www.cupangklaten.my.id/logo.png",
              "@id": "https://www.cupangklaten.my.id",
              "url": "https://www.cupangklaten.my.id",
              "telephone": "+6281234567890",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Klaten",
                "addressLocality": "Klaten",
                "addressRegion": "Jawa Tengah",
                "postalCode": "57411",
                "addressCountry": "ID"
              },
              "sameAs": [
                "https://www.instagram.com/cupangklaten.id",
                "https://www.tiktok.com/@cupangklaten.id"
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Cupang Klaten",
              "url": "https://www.cupangklaten.my.id",
              "publisher": {
                "@type": "Organization",
                "name": "Cupang Klaten",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://www.cupangklaten.my.id/logo.png"
                }
              }
            })
          }}
        />
      </head>
      <body className={outfit.className}>
        {children}
      </body>
    </html>
  );
}
