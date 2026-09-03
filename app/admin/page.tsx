"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Rug } from "@/types/rug";

const emptyForm = { name: "", sku: "", price: "", colour: "Green", sizes: "6 × 9 ft, 8 × 10 ft", available: true, featured: false };

export default function AdminPage() {
  const [rugs, setRugs] = useState<Rug[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const q = query(collection(db, "rugs"), orderBy("createdAt", "desc"));
    return onSnapshot(q, snapshot => {
      setRugs(snapshot.docs.map(item => ({ id: item.id, ...item.data() } as Rug)));
    }, error => setMessage(`Firebase error: ${error.message}`));
  }, []);

  function handleImage(e: ChangeEvent<HTMLInputElement>) {
    setImage(e.target.files?.[0] ?? null);
  }

  async function uploadToCloudinary(file: File) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !preset) throw new Error("Cloudinary is not configured yet. Add the Cloudinary values to .env.local.");
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", preset);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: data });
    if (!response.ok) throw new Error("Cloudinary upload failed.");
    const result = await response.json();
    return result.secure_url as string;
  }

  async function addRug(e: FormEvent) {
    e.preventDefault();
    if (!image) return setMessage("Please select a rug image.");
    setBusy(true); setMessage("");
    try {
      const imageUrl = await uploadToCloudinary(image);
      await addDoc(collection(db, "rugs"), {
        name: form.name.trim(), sku: form.sku.trim(), price: Number(form.price), currency: "NGN",
        colour: form.colour.trim(), sizes: form.sizes.split(",").map(s => s.trim()).filter(Boolean),
        imageUrl, available: form.available, featured: form.featured, createdAt: serverTimestamp(),
      });
      setForm(emptyForm); setImage(null); setMessage("Rug added successfully.");
      const input = document.getElementById("rug-image") as HTMLInputElement | null; if (input) input.value = "";
    } catch (error) { setMessage(error instanceof Error ? error.message : "Something went wrong."); }
    finally { setBusy(false); }
  }

  async function removeRug(id: string) {
    if (!confirm("Remove this rug from the catalogue?")) return;
    await deleteDoc(doc(db, "rugs", id));
  }

  return <main className="min-h-screen bg-[#f7f5ef] text-[#172019]">
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><Link href="/" className="text-sm text-emerald-800">← Back to site</Link><p className="mt-7 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-800">Stage 2 · Inventory</p><h1 className="mt-2 text-4xl font-semibold">Rug catalogue</h1></div><div className="rounded-full bg-emerald-900 px-4 py-2 text-sm text-white">{rugs.length} rug{rugs.length === 1 ? "" : "s"}</div></div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
        <form onSubmit={addRug} className="rounded-4xl bg-white p-7 shadow-sm">
          <h2 className="text-xl font-semibold">Add a rug</h2><p className="mt-1 text-sm text-stone-500">Upload the actual product image and details.</p>
          <div className="mt-6 space-y-4">
            <input required placeholder="Rug name" value={form.name} onChange={e => setForm({...form,name:e.target.value})} className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-emerald-700" />
            <div className="grid grid-cols-2 gap-3"><input required placeholder="SKU" value={form.sku} onChange={e => setForm({...form,sku:e.target.value})} className="rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-emerald-700" /><input required type="number" min="0" placeholder="Price (NGN)" value={form.price} onChange={e => setForm({...form,price:e.target.value})} className="rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-emerald-700" /></div>
            <input placeholder="Colour" value={form.colour} onChange={e => setForm({...form,colour:e.target.value})} className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-emerald-700" />
            <input placeholder="Sizes, separated by commas" value={form.sizes} onChange={e => setForm({...form,sizes:e.target.value})} className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-emerald-700" />
            <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-stone-300 p-5 text-center hover:border-emerald-700"><input id="rug-image" required type="file" accept="image/*" onChange={handleImage} className="hidden"/><span className="text-sm font-medium">{image ? image.name : "Choose rug image"}</span><span className="mt-1 block text-xs text-stone-400">JPG, PNG or WEBP</span></label>
            <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={form.available} onChange={e => setForm({...form,available:e.target.checked})} className="h-4 w-4"/> Available for customers</label>
            <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={form.featured} onChange={e => setForm({...form,featured:e.target.checked})} className="h-4 w-4"/> Show on homepage</label>
            <button disabled={busy} className="w-full rounded-full bg-emerald-900 px-5 py-3.5 font-medium text-white disabled:bg-stone-300">{busy ? "Uploading…" : "Add rug to catalogue"}</button>
            {message && <p className="rounded-xl bg-stone-100 p-3 text-sm text-stone-600">{message}</p>}
          </div>
        </form>

        <section><div className="mb-4 flex items-end justify-between"><div><h2 className="text-xl font-semibold">Inventory</h2><p className="text-sm text-stone-500">Live from Firestore.</p></div></div>
          {rugs.length === 0 ? <div className="rounded-4xl border border-dashed border-stone-300 bg-white p-12 text-center"><p className="font-medium">No rugs yet.</p><p className="mt-2 text-sm text-stone-500">Add the first product using the form.</p></div> : <div className="grid gap-4 sm:grid-cols-2">{rugs.map(rug => <article key={rug.id} className="overflow-hidden rounded-3xl bg-white shadow-sm"><img src={rug.imageUrl} alt={rug.name} className="h-52 w-full object-cover"/><div className="p-5"><div className="flex justify-between gap-4"><div><h3 className="font-semibold">{rug.name}</h3><p className="mt-1 text-xs text-stone-500">{rug.sku} · {rug.colour}</p></div><button onClick={() => removeRug(rug.id)} className="text-xs text-red-700">Remove</button></div><p className="mt-4 font-semibold">₦{rug.price.toLocaleString()}</p><p className="mt-1 text-xs text-stone-500">{rug.sizes.join(" · ")}</p></div></article>)}</div>}
        </section>
      </div>
    </div>
  </main>;
}
