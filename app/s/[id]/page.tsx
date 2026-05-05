import type { Metadata } from "next";
import SecretViewer from "@/components/SecretViewer";
import { BRAND, fontDisplay } from "@/lib/brand";

export function generateMetadata(): Metadata {
  return {
    title: "Open link",
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
  };
}

export default function SecretPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16" style={{ backgroundColor: BRAND.background }}>
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ fontFamily: fontDisplay(), color: BRAND.accent }}>
            hedwig
          </h1>
          <p className="text-sm" style={{ color: BRAND.text, opacity: 0.5 }}>open a shared link</p>
        </div>
        <SecretViewer id={params.id} />
      </div>
    </main>
  );
}
