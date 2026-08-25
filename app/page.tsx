import Link from "next/link";

const rugs = [
  { name: "Emerald Luxe", size: "8 × 10 ft", price: "₦350,000", tone: "from-emerald-950 via-emerald-700 to-lime-700" },
  { name: "Forest Weave", size: "6 × 9 ft", price: "₦285,000", tone: "from-green-950 via-green-800 to-stone-700" },
  { name: "Sage Royale", size: "8 × 10 ft", price: "₦420,000", tone: "from-stone-700 via-emerald-800 to-green-950" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#172019]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="text-xl font-semibold tracking-tight">RUG<span className="text-emerald-700">ROOM</span></Link>
        <div className="hidden items-center gap-8 text-sm md:flex">
          <a href="#collection" className="hover:text-emerald-700">Collection</a>
          <a href="#how" className="hover:text-emerald-700">How it works</a>
          <Link href="/admin" className="hover:text-emerald-700">Admin</Link>
        </div>
        <Link href="/visualize" className="rounded-full bg-[#172019] px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-800">Visualize a Rug</Link>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-12 lg:grid-cols-2 lg:px-10 lg:pb-28 lg:pt-20">
        <div className="flex flex-col justify-center">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-800">The smarter way to choose a rug</p>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-7xl">See your perfect rug <span className="text-emerald-700">before you buy it.</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-stone-600">Upload a photo of your room, choose from our collection, and preview how your favourite rug could transform your space.</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="/visualize" className="rounded-full bg-emerald-800 px-7 py-4 font-medium text-white transition hover:bg-emerald-900">Start Visualizing →</Link>
            <a href="#collection" className="rounded-full border border-stone-300 px-7 py-4 font-medium transition hover:bg-white">Browse collection</a>
          </div>
          <div className="mt-10 flex gap-8 text-sm text-stone-500"><span><strong className="text-stone-900">100%</strong> visual</span><span><strong className="text-stone-900">Real</strong> rug catalogue</span><span><strong className="text-stone-900">Local</strong> ordering</span></div>
        </div>
        <div className="relative min-h-[520px] overflow-hidden rounded-[2rem] bg-stone-900 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(52,211,153,.35),transparent_35%),linear-gradient(135deg,#172019,#334b3d_55%,#171d18)]" />
          <div className="absolute inset-x-10 bottom-10 top-20 rotate-[-7deg] rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-950 via-emerald-800 to-stone-800 shadow-2xl" />
          <div className="absolute left-12 top-12 rounded-full bg-white/10 px-4 py-2 text-xs text-white backdrop-blur">AI-powered room preview</div>
          <div className="absolute bottom-12 left-12 right-12 text-white"><p className="text-sm text-white/60">Featured</p><h2 className="mt-1 text-3xl font-medium">Emerald Luxe</h2><p className="mt-2 text-white/70">A statement piece for modern interiors.</p></div>
        </div>
      </section>

      <section id="how" className="border-y border-stone-200 bg-white px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl"><div className="max-w-xl"><p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-800">How it works</p><h2 className="mt-4 text-4xl font-semibold tracking-tight">Three simple steps.</h2></div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[['01','Upload your room','Take or upload a clear photo of your living room, bedroom, office or other space.'],['02','Choose a rug','Browse the available collection and select the rug and size you love.'],['03','See it in your space','Our visualizer creates a realistic preview so you can decide with confidence.']].map(([n,t,d]) => <div key={n} className="rounded-3xl border border-stone-200 bg-[#f7f5ef] p-7"><span className="text-sm font-semibold text-emerald-800">{n}</span><h3 className="mt-10 text-2xl font-semibold">{t}</h3><p className="mt-3 leading-7 text-stone-600">{d}</p></div>)}
          </div>
        </div>
      </section>

      <section id="collection" className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="flex items-end justify-between gap-6"><div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-800">Featured collection</p><h2 className="mt-4 text-4xl font-semibold tracking-tight">Start with a favourite.</h2></div><Link href="/visualize" className="hidden text-sm font-medium text-emerald-800 md:block">View all →</Link></div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">{rugs.map(rug => <article key={rug.name} className="group"><div className={`relative aspect-[4/3] overflow-hidden rounded-3xl bg-gradient-to-br ${rug.tone}`}><div className="absolute inset-8 rounded-2xl border border-white/10 opacity-70" /><div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,.08),transparent)] opacity-0 transition group-hover:opacity-100" /></div><div className="flex items-start justify-between pt-5"><div><h3 className="text-lg font-semibold">{rug.name}</h3><p className="mt-1 text-sm text-stone-500">{rug.size}</p></div><p className="font-medium">{rug.price}</p></div></article>)}</div>
      </section>

      <footer className="bg-[#172019] px-6 py-10 text-white lg:px-10"><div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><p className="font-semibold">RUG<span className="text-emerald-400">ROOM</span></p><p className="text-sm text-white/50">AI rug visualization — MVP</p></div></footer>
    </main>
  );
}
