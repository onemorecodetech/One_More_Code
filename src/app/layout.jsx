import "./globals.css";

export const metadata = {
  title: "OneMoreCode",
  description: "Ideias transformadas em tecnologia para impulsionar negócios",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}