import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "PolicySim",
  icons: { icon: "/favicon.jpeg" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
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
