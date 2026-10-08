import Navbar from "../navbar";
import Footer from "../footer";

export default function PortalShell({ children }) {
  return (
    <main className="text-white min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">{children}</div>
      </div>
      <Footer />
    </main>
  );
}
