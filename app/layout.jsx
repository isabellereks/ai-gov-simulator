export const metadata = {
  title: "PolicySim",
  icons: { icon: "/favicon.jpeg" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
