import "./globals.css";
import Background from "../components/background";

export const metadata = {
  title: "OneMoreCode | Sites, sistemas e aplicativos em Erechim/RS",
  description: "Desenvolvimento de sites, sistemas, aplicativos e automações sob medida em Erechim/RS. Cuidamos de toda a parte técnica para que você possa se concentrar no seu negócio.",
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
