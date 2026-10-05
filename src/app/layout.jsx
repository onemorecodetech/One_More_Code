import "./globals.css";
import Background from "../components/background";

export const metadata = {
  title: "OneMoreCode",
  description: "Ideias transformadas em tecnologia para impulsionar negócios",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Background />
        {children}
      </body>
    </html>
  );
}
