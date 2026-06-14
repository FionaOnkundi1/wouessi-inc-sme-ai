import "./globals.css";

const publicBaseUrl = process.env.PUBLIC_SITE_BASE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(publicBaseUrl),
  title: "Wouessi Published Website",
  description: "A website published with Wouessi.",
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
