import { Outfit } from "next/font/google";
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
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Cupang Klaten",
              "image": "https://www.cupangklaten.my.id/logo.png",
              "@id": "https://www.cupangklaten.my.id",
              "url": "https://www.cupangklaten.my.id",
              "telephone": "+6281234567890", // Ganti dengan nomor asli jika ada
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Klaten",
                "addressLocality": "Klaten",
                "addressRegion": "Jawa Tengah",
                "postalCode": "57411",
                "addressCountry": "ID"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": -7.7028,
                "longitude": 110.6031
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday"
                ],
                "opens": "00:00",
                "closes": "23:59"
              },
              "sameAs": [
                "https://shopee.co.id/cupangklaten" // Ganti dengan link sosmed asli
              ]
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
