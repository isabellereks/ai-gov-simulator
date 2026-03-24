import "./globals.css";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { Press_Start_2P } from "next/font/google";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

export const metadata = {
  title: "PolicySim",
  icons: { icon: "/favicon.jpeg" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={pressStart2P.variable}>
      <body>
        {children}
        <Analytics />
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </body>
    </html>
  );
}
