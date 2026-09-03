"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

export default function OrderPage() {
  return <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-[#f3f0e8] font-sans text-[#607166]">Preparing your rug match...</main>}><OrderDetails /></Suspense>;
}

function OrderDetails() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "Selected rug";
  const image = searchParams.get("image");
  const price = Number(searchParams.get("price") || 0);
  const size = searchParams.get("size") || "To be confirmed";
  const room = searchParams.get("room") || "Not provided";
  const mood = searchParams.get("mood") || "Your green match";
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  function sendToWhatsApp(event: FormEvent) {
    event.preventDefault();
    if (!whatsappNumber) return;
    setBusy(true);
    const message = [
      "Hello Okoligan team, I would like to order a rug.",
      `Rug: ${name}`,
      `Size: ${size}`,
      `Price: ${price ? `₦${price.toLocaleString()}` : "Please confirm price"}`,
      `Room: ${room}`,
      `Green personality: ${mood}`,
      `Customer: ${customerName}`,
      `Phone: ${phone}`,
    ].join("\n");
    window.open(`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setSent(true);
    setBusy(false);
  }

  return <main className="min-h-screen bg-[#f3f0e8] text-[#183126]"><nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-6 lg:px-10"><Link href="/" className="font-sans text-xl font-semibold tracking-tighter">OKO<span className="text-[#0d8a63]">LIGAN</span></Link><Link href="/" className="font-sans text-sm text-[#0d8a63]">Back to matches</Link></nav><section className="mx-auto max-w-5xl px-5 pb-16 pt-8 sm:px-6 sm:pt-16 lg:px-10"><div className="max-w-2xl"><p className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-[#0d8a63]">Order assistant</p><h1 className="mt-5 font-serif text-5xl leading-none tracking-tighter sm:text-7xl">Let&apos;s make it yours.</h1><p className="mt-5 font-sans text-base leading-7 text-[#607166]">Our AI has prepared your rug match. Confirm your details and the Okoligan sales team will take it from here on WhatsApp.</p></div><div className="mt-12 grid gap-6 lg:grid-cols-[.9fr_1.1fr]"><div className="overflow-hidden bg-[#d8e1d5]"><div className="relative aspect-4/3">{image ? <img src={image} alt={name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center font-sans text-sm text-[#718077]">Rug image unavailable</div>}</div><div className="bg-[#183126] p-6 text-[#eff4e8]"><p className="font-sans text-xs uppercase tracking-[0.2em] text-[#a7d6ab]">Your selected match</p><h2 className="mt-2 font-serif text-3xl">{name}</h2><p className="mt-2 font-sans text-sm text-[#c8ded0]">{size} · {price ? `₦${price.toLocaleString()}` : "Price to confirm"}</p></div></div><form onSubmit={sendToWhatsApp} className="bg-[#e8eee4] p-6 sm:p-8"><p className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-[#0d8a63]">AI order summary</p><div className="mt-6 space-y-4 border-y border-[#cbd8cb] py-5 font-sans text-sm"><div className="flex justify-between gap-5"><span className="text-[#718077]">Recommended size</span><strong>{size}</strong></div><div className="flex justify-between gap-5"><span className="text-[#718077]">Your room</span><strong>{room}</strong></div><div className="flex justify-between gap-5"><span className="text-[#718077]">Ideal green</span><strong>{mood}</strong></div></div><h2 className="mt-8 font-serif text-3xl">Where can the team reach you?</h2><div className="mt-5 space-y-4"><label className="block font-sans text-sm font-semibold">Your name<input required value={customerName} onChange={event => setCustomerName(event.target.value)} className="mt-2 block w-full border border-[#cbd8cb] bg-[#f5f6ef] px-4 py-3 outline-none focus:border-[#0d8a63]" /></label><label className="block font-sans text-sm font-semibold">Phone / WhatsApp number<input required type="tel" value={phone} onChange={event => setPhone(event.target.value)} className="mt-2 block w-full border border-[#cbd8cb] bg-[#f5f6ef] px-4 py-3 outline-none focus:border-[#0d8a63]" /></label></div>{whatsappNumber ? <button disabled={busy} className="mt-7 w-full bg-[#0d8a63] px-6 py-4 font-sans font-semibold text-white transition hover:bg-[#086b4d] disabled:bg-[#9caf9f]">{sent ? "Message opened in WhatsApp" : "Send order to Okoligan sales ↗"}</button> : <p className="mt-7 bg-[#fff5df] p-4 font-sans text-sm text-[#795a20]">WhatsApp ordering is being connected. Add NEXT_PUBLIC_WHATSAPP_NUMBER in Vercel to enable this handoff.</p>}</form></div></section></main>;
}
