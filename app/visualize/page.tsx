"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Rug } from "@/types/rug";

export default function VisualizePage() {
  const [roomImage, setRoomImage] = useState("");
  const [roomFile, setRoomFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [rugs, setRugs] = useState<Rug[]>([]);
  const [selected, setSelected] = useState<Rug | null>(null);
  const [size, setSize] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [resultImage, setResultImage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const q = query(collection(db, "rugs"), orderBy("createdAt", "desc"));
    return onSnapshot(q, snapshot => {
      const live = snapshot.docs.map(item => ({ id: item.id, ...item.data() } as Rug)).filter(r => r.available);
      setRugs(live);
      setSelected(live[0] ?? null);
      setSize(live[0]?.sizes[0] ?? "");
      setLoading(false);
    }, snapshotError => {
      setError(`Unable to load rugs: ${snapshotError.message}`);
      setLoading(false);
    });
  }, []);

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setRoomFile(file);
    setError("");
    const reader = new FileReader();
    reader.onload = () => setRoomImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function generateVisualization() {
    if (!roomFile || !selected) return;
    setGenerating(true); setError(""); setResultImage("");
    try {
      const formData = new FormData();
      formData.append("roomImage", roomFile);
      formData.append("rugImageUrl", selected.imageUrl);
      formData.append("rugName", selected.name);
      formData.append("rugSize", size);

      const response = await fetch("/api/visualize", {
        method: "POST",
        body: formData,
      });

      const result = await response.json() as { image?: string; error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to generate the visualization.");
      setResultImage(result.image || "");
    } catch (generationError) { setError(generationError instanceof Error ? generationError.message : "Unable to generate the visualization."); }
    finally { setGenerating(false); }
  }

  return <main className="min-h-screen bg-[#f7f5ef] text-[#172019]">
    <header className="border-b border-stone-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10"><Link href="/" className="text-xl font-semibold">RUG<span className="text-emerald-700">ROOM</span></Link><span className="text-sm text-stone-500">Rug Visualizer</span></div></header>
    <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-800">Step 1 of 3</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Show us your space.</h1><p className="mt-3 leading-7 text-stone-600">Upload a clear photo of the room where you want to see your rug.</p></div>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
        <label className="flex min-h-107.5 cursor-pointer flex-col items-center justify-center rounded-4xl border-2 border-dashed border-stone-300 bg-white p-8 text-center transition hover:border-emerald-600 hover:bg-emerald-50/30"><input type="file" accept="image/*" className="hidden" onChange={handleFile}/><div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-2xl">↑</div><h2 className="text-xl font-semibold">{fileName ? fileName : "Upload your room photo"}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-stone-500">JPG or PNG. Use a well-lit photo where the floor is clearly visible.</p><span className="mt-6 rounded-full bg-[#172019] px-6 py-3 text-sm font-medium text-white">Choose photo</span></label>
        <div className="rounded-4xl bg-white p-7 shadow-sm"><p className="text-sm font-semibold">Choose a rug</p>{loading ? <p className="mt-5 text-sm text-stone-500">Loading rugs from the catalogue...</p> : error ? <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : rugs.length === 0 ? <p className="mt-5 rounded-xl bg-stone-100 p-4 text-sm text-stone-500">No available rugs in the catalogue yet.</p> : <><div className="mt-5 space-y-3">{rugs.map(rug => <button key={rug.id} onClick={() => {setSelected(rug); setSize(rug.sizes[0]);}} className={`flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition ${selected?.id === rug.id ? "border-emerald-700 bg-emerald-50" : "border-stone-200 hover:border-stone-400"}`}><span className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-emerald-950"><img src={rug.imageUrl} alt={rug.name} className="h-full w-full object-cover" /></span><span className="flex-1"><span className="block font-semibold">{rug.name}</span><span className="mt-1 block text-sm text-stone-500">{`₦${rug.price.toLocaleString()}`}</span></span><span className="text-emerald-700">{selected?.id === rug.id ? "✓" : ""}</span></button>)}</div>
          {selected && <div className="mt-7"><label className="text-sm font-semibold">Choose size</label><div className="mt-3 grid grid-cols-3 gap-2">{selected.sizes.map(s => <button key={s} onClick={() => setSize(s)} className={`rounded-xl border px-3 py-3 text-xs font-medium ${size === s ? "border-emerald-700 bg-emerald-800 text-white" : "border-stone-200 bg-white"}`}>{s}</button>)}</div></div>}
          <button onClick={generateVisualization} disabled={!fileName || !selected || generating} className="mt-8 w-full rounded-full bg-emerald-800 px-6 py-4 font-medium text-white transition enabled:hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-stone-300">{generating ? "Creating your visualization..." : "Generate my room preview →"}</button>{error && !loading && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}</>}
        </div>
      </div>
      {resultImage && selected && <section className="mt-12 max-w-4xl rounded-4xl bg-white p-7 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-800">Your visualization</p><h2 className="mt-3 text-3xl font-semibold">{selected.name} in your space</h2><img src={resultImage} alt={`${selected.name} visualization`} className="mt-6 w-full rounded-3xl object-cover" /><p className="mt-4 text-sm text-stone-500">{size} · ₦{selected.price.toLocaleString()}</p></section>}
    </section>
  </main>;
}
