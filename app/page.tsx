import SecretForm from "@/components/SecretForm";
import { BRAND, fontDisplay } from "@/lib/brand";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16" style={{ backgroundColor: BRAND.background }}>
      <div className="w-full max-w-lg">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-3" style={{ fontFamily: fontDisplay(), color: BRAND.accent }}>
            hedwig
          </h1>
          <p className="text-base leading-relaxed" style={{ color: BRAND.text, opacity: 0.6 }}>
            {BRAND.taglineFirst}
            <br />
            {BRAND.taglineSecond}
            <br />
            Encrypted in your browser. The server never sees your plaintext.
          </p>
        </div>
        <SecretForm />
      </div>
    </main>
  );
}
