import Link from "next/link";

export default function VisualizePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f0e8] px-6 text-[#183126]">
      <section className="w-full max-w-2xl text-center">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-[#0d8a63]">Okoligan</p>
        <h1 className="mt-6 font-serif text-6xl leading-none tracking-tighter sm:text-8xl">Coming soon.</h1>
        <p className="mx-auto mt-6 max-w-lg font-sans text-lg leading-8 text-[#607166]">Visualize your chosen rug in your own space. We are putting the finishing touches on this experience.</p>
        <Link href="/" className="mt-10 inline-block bg-[#183126] px-7 py-4 font-sans text-sm font-semibold text-white transition hover:bg-[#0d8a63]">Back to rugs <span className="ml-2 text-[#a7d6ab]">↗</span></Link>
      </section>
    </main>
  );
}
