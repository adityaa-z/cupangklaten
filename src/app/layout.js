import { Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "@/components/Providers";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "Cupang Klaten | Soliter Virtual, Informasi Stok & Edukasi Ikan Cupang",
  description: "Media promosi, etalase informasi stok & kisaran harga ikan cupang Klaten, serta simulasi edukatif Soliter Virtual Cupang Klaten.",
  keywords: "cupang klaten, info stok cupang klaten, ikan cupang klaten, soliter virtual cupang, cupang hmpk klaten, giant betta klaten, edukasi cupang",
  verification: {
    google: "Cm3Ij7HVbOgV1-1DpBXwz4qqYm9Yjgftqt8HN5m0qsM",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Cupang Klaten | Soliter Virtual & Informasi Koleksi Ikan Cupang",
    description: "Mainkan Soliter Virtual Cupang Klaten sambil melihat etalase stok, kisaran harga, dan edukasi perawatan ikan cupang terbaik dari Klaten.",
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
    <html lang="id" data-theme="dark">
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
              "telephone": "+628992020444",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Klaten",
                "addressLocality": "Klaten",
                "addressRegion": "Jawa Tengah",
                "postalCode": "57411",
                "addressCountry": "ID"
              },
              "sameAs": [
                "https://www.instagram.com/cupangklaten",
                "https://www.tiktok.com/@cupangklaten"
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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
