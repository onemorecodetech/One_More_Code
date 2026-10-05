import "./globals.css";

export const metadata = {
  title: "OneMoreCode",
  description: "Ideias transformadas em tecnologia para impulsionar negócios",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b0f1a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}