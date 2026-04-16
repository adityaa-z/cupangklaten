import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "Cupang Klaten - Koleksi Ikan Cupang Terbaik untuk Anda",
  description: "Jual Ikan Cupang Klaten berkualitas. Koleksi Cupang HMPK, Giant, Plakat, dan Crowntail terbaik dari Klaten untuk kolektor di Indonesia dan Asia.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={outfit.className}>
        {children}
      </body>
    </html>
  );
}
