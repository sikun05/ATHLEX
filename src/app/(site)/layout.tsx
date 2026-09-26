import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Preloader } from "@/components/layout/preloader";
import { Cursor } from "@/components/layout/cursor";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { JsonLd, gymJsonLd } from "@/lib/seo";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a href="#main" className="sr-only z-[200] rounded bg-volt px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <Preloader />
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <Cursor />
      <JsonLd data={gymJsonLd()} />
    </>
  );
}
