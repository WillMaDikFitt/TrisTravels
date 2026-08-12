import { Montserrat, Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SiteChrome } from "@/components/layout/SiteChrome";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TRIS Travels | Meghalaya Experience Platform",
    template: "%s | TRIS Travels",
  },
  description:
    "Community-rooted authentic journeys in Meghalaya. Discover experiences and curated journeys with TRIS.",
  icons: {
    icon: [
      { url: "/favicon.ico?v=4" },
      { url: "/favicon-16x16.png?v=4", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png?v=4", sizes: "32x32", type: "image/png" },
      { url: "/icon.png?v=4", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png?v=4", sizes: "180x180", type: "image/png" }],
  },
  applicationName: "TRIS Travels",
};

export const viewport: Viewport = {
  themeColor: "#f7f4ee",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${jakarta.variable} ${instrument.variable} h-full`}
      data-scroll-behavior="smooth"
    >
      <body className="relative flex min-h-full flex-col antialiased">
        <div className="pointer-events-none fixed inset-0 z-[60] texture-noise" aria-hidden />
        <AuthProvider>
          <SiteChrome>{children}</SiteChrome>
        </AuthProvider>
      </body>
    </html>
  );
}
