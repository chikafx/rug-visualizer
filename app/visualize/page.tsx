"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Rug } from "@/types/rug";

const fallbackRugs = [
  { id: "demo-1", name: "Emerald Luxe", price: 350000, sizes: ["6 × 9 ft", "8 × 10 ft", "10 × 12 ft"], colour: "Green", imageUrl: "", available: true, sku: "DEMO-001" },
  { id: "demo-2", name: "Forest Weave", price: 285000, sizes: ["6 × 9 ft", "8 × 10 ft"], colour: "Green", imageUrl: "", available: true, sku: "DEMO-002" },
  { id: "demo-3", name: "Sage Royale", price: 420000, sizes: ["8 × 10 ft", "10 × 12 ft"], colour: "Sage", imageUrl: "", available: true, sku: "DEMO-003" },
];

export default function VisualizePage() {
  const [fileName, setFileName] = useState("");
  const [rugs, setRugs] = useState<Rug[]>(fallbackRugs);
  const [selected, setSelected] = useState<Rug>(fallbackRugs[0]);
  const [size, setSize] = useState(fallbackRugs[0].sizes[1]);

  useEffect(() => {
    const q = query(collection(db, "rugs"), orderBy("createdAt", "desc"));
    return onSnapshot(q, snapshot => {
      const live = snapshot.docs.map(item => ({ id: item.id, ...item.data() } as Rug)).filter(r => r.available);
      if (live.length) { setRugs(live); setSelected(live[0]); setSize(live[0].sizes[0]); }
    });
  }, []);

  function handleFile(e: ChangeEvent<HTMLInputElement>) { if (e.target.files?.[0]) setFileName(e.target.files[0].name); }

  return <main className="min-h-screen bg-[#f7f5ef] text-[#172019]">
    <header className="border-b border-stone-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10"><Link href="/" className="text-xl font-semibold">RUG<span className="text-emerald-700">ROOM</span></Link><span className="text-sm text-stone-500">Rug Visualizer</span></div></header>
    <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-800">Step 1 of 3</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Show us your space.</h1><p className="mt-3 leading-7 text-stone-600">Upload a clear photo of the room where you want to see your rug.</p></div>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
        <label className="flex min-h-[430px] cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-stone-300 bg-white p-8 text-center transition hover:border-emerald-600 hover:bg-emerald-50/30"><input type="file" accept="image/*" className="hidden" onChange={handleFile}/><div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-2xl">↑</div><h2 className="text-xl font-semibold">{fileName ? fileName : "Upload your room photo"}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-stone-500">JPG or PNG. Use a well-lit photo where the floor is clearly visible.</p><span className="mt-6 rounded-full bg-[#172019] px-6 py-3 text-sm font-medium text-white">Choose photo</span></label>
        <div className="rounded-[2rem] bg-white p-7 shadow-sm"><p className="text-sm font-semibold">Choose a rug</p><div className="mt-5 space-y-3">{rugs.map(rug => <button key={rug.id} onClick={() => {setSelected(rug); setSize(rug.sizes[0]);}} className={`flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition ${selected.id === rug.id ? "border-emerald-700 bg-emerald-50" : "border-stone-200 hover:border-stone-400"}`}><span className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-emerald-950">{rug.imageUrl ? <img src={rug.imageUrl} alt="" className="h-full w-full object-cover" /> : <span className="block h-full w-full bg-gradient-to-br from-emerald-950 via-emerald-700 to-lime-700" />}</span><span className="flex-1"><span className="block font-semibold">{rug.name}</span><span className="mt-1 block text-sm text-stone-500">{`₦${rug.price.toLocaleString()}`}</span></span><span className="text-emerald-700">{selected.id === rug.id ? "✓" : ""}</span></button>)}</div>
          <div className="mt-7"><label className="text-sm font-semibold">Choose size</label><div className="mt-3 grid grid-cols-3 gap-2">{selected.sizes.map(s => <button key={s} onClick={() => setSize(s)} className={`rounded-xl border px-3 py-3 text-xs font-medium ${size === s ? "border-emerald-700 bg-emerald-800 text-white" : "border-stone-200 bg-white"}`}>{s}</button>)}</div></div>
          <button disabled={!fileName} className="mt-8 w-full rounded-full bg-emerald-800 px-6 py-4 font-medium text-white transition enabled:hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-stone-300">Generate my room preview →</button><p className="mt-3 text-center text-xs text-stone-400">AI generation will be connected in the next stage.</p>
        </div>
      </div>
    </section>
  </main>;
}
