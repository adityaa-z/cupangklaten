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
  title: "cans.betta x cupangklaten | Soliter Virtual, Informasi Stok & Edukasi Ikan Cupang",
  description: "Galeri ikan cupang hias Kelas Kompetisi di Klaten sejak Desember 2022. Informasi stok, kisaran harga mulai Rp 50rb, dan simulasi edukatif Soliter Virtual.",
  keywords: "cans.betta, cupang klaten, info stok cupang klaten, ikan cupang klaten, soliter virtual cupang, cupang kelas kompetisi klaten",
  verification: {
    google: "Cm3Ij7HVbOgV1-1DpBXwz4qqYm9Yjgftqt8HN5m0qsM",
  },
  icons: {
    icon: "/logo-cansbetta.jpg",
    apple: "/logo-cansbetta.jpg",
  },
  openGraph: {
    title: "cans.betta x cupangklaten | Soliter Virtual & Informasi Koleksi Ikan Cupang",
    description: "Galeri ikan cupang Kelas Kompetisi Klaten sejak Desember 2022. Harga mulai Rp 50rb & mainkan Soliter Virtual.",
    url: "https://www.cupangklaten.my.id",
    siteName: "cans.betta x cupangklaten",
    images: [
      {
        url: "/logo-cansbetta.jpg",
        width: 800,
        height: 800,
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
