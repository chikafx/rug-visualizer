"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Rug } from "@/types/rug";

type Choice = { label: string; detail: string; icon: string; value: string };
type Answers = { space: Choice | null; atmosphere: Choice | null };
type Size = { label: string; width: number; length: number };

const choices: { key: keyof Answers; eyebrow: string; title: string; description: string; options: Choice[] }[] = [
  { key: "space", eyebrow: "01 / Your space", title: "Where will your green live?", description: "The room sets the rhythm. Pick the space you are making feel more like you.", options: [
    { icon: "⌂", label: "Living room", detail: "For gathering and lingering", value: "living" },
    { icon: "☾", label: "Bedroom", detail: "For softer, slower mornings", value: "bedroom" },
    { icon: "▦", label: "Office", detail: "For focus with character", value: "office" },
    { icon: "♧", label: "Dining area", detail: "For meals worth staying for", value: "dining" },
    { icon: "✦", label: "Hotel / short-let", detail: "For an unforgettable welcome", value: "hotel" },
  ] },
  { key: "atmosphere", eyebrow: "02 / Your atmosphere", title: "What should the room feel like?", description: "Your mood helps us find a green with the right point of view.", options: [
    { icon: "❧", label: "Calm & natural", detail: "Grounded, airy, at ease", value: "calm" },
    { icon: "♛", label: "Luxury & elegant", detail: "Polished, warm, considered", value: "luxury" },
    { icon: "✹", label: "Bold & dramatic", detail: "Confident, expressive, alive", value: "bold" },
    { icon: "○", label: "Soft & minimal", detail: "Quiet, clean, uncluttered", value: "minimal" },
    { icon: "▥", label: "Classic & traditional", detail: "Timeless, layered, collected", value: "classic" },
  ] },
];

const shadeCopy: Record<string, { name: string; color: string; description: string }> = {
  luxury: { name: "Deep Emerald", color: "#087a5b", description: "Your selections suggest you prefer luxurious, warm and sophisticated spaces." },
  bold: { name: "Jade Green", color: "#237c68", description: "Your selections suggest you like confident spaces with a story to tell." },
  minimal: { name: "Soft Sage", color: "#799b7b", description: "Your selections suggest you value quiet details, balance and ease." },
  classic: { name: "Forest Green", color: "#285b43", description: "Your selections suggest you love depth, heritage and timeless pieces." },
  calm: { name: "Moss Green", color: "#658368", description: "Your selections suggest you want your home to feel grounded and restorative." },
};

const fallbackSizes: Size[] = [{ label: "6 x 9 ft", width: 6, length: 9 }, { label: "8 x 10 ft", width: 8, length: 10 }, { label: "9 x 12 ft", width: 9, length: 12 }];

function parseSize(value: string): Size | null {
  const match = value.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
  return match ? { label: `${match[1]} x ${match[2]} ft`, width: Number(match[1]), length: Number(match[2]) } : null;
}

function fitFor(roomArea: number, rugArea: number) {
  const coverage = Math.round((rugArea / roomArea) * 100);
  if (coverage > 100) return { label: "Too large for this room", tone: "red", message: "This rug is larger than your selected room dimensions." };
  if (coverage < 16) return { label: "Consider going larger", tone: "amber", message: "This size may appear too small for your room." };
  return { label: "Great fit", tone: "green", message: `This rug will cover approximately ${coverage}% of your floor space.` };
}

export default function Home() {
  const [rugs, setRugs] = useState<Rug[]>([]);
  const [answers, setAnswers] = useState<Answers>({ space: null, atmosphere: null });
  const [step, setStep] = useState(0);
  const [roomLength, setRoomLength] = useState("20");
  const [roomWidth, setRoomWidth] = useState("15");
  const [budget, setBudget] = useState("500000");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRugId, setSelectedRugId] = useState("");
  const [selectedSizeLabel, setSelectedSizeLabel] = useState("");

  useEffect(() => {
    const rugsQuery = query(collection(db, "rugs"), orderBy("createdAt", "desc"));
    return onSnapshot(rugsQuery, snapshot => {
      const live = snapshot.docs.map(item => ({ id: item.id, ...item.data() } as Rug)).filter(rug => rug.available && rug.imageUrl);
      setRugs(live);
      setSelectedRugId(current => current || live[0]?.id || "");
      setLoading(false);
    }, snapshotError => { setError(`Unable to load rugs: ${snapshotError.message}`); setLoading(false); });
  }, []);

  const result = step === 4;
  const shade = shadeCopy[answers.atmosphere?.value ?? "calm"] ?? shadeCopy.calm;
  const roomArea = Number(roomLength) * Number(roomWidth);
  const selectedRug = rugs.find(rug => rug.id === selectedRugId) ?? rugs[0];
  const sizes = useMemo(() => {
    const parsed = selectedRug?.sizes.map(parseSize).filter((size): size is Size => Boolean(size)) ?? [];
    return parsed.length ? parsed : fallbackSizes;
  }, [selectedRug]);
  const selectedSize = sizes.find(size => size.label === selectedSizeLabel) ?? sizes[1] ?? sizes[0];
  const fit = selectedSize && roomArea > 0 ? fitFor(roomArea, selectedSize.width * selectedSize.length) : null;
  const matches = useMemo(() => rugs.map((rug, index) => ({ rug, style: Math.max(88, 98 - index * 4) })).slice(0, 3), [rugs]);

  function choose(choice: Choice) {
    setAnswers(current => ({ ...current, [choices[step].key]: choice }));
    setStep(current => current + 1);
  }

  function showResults(event: React.FormEvent) {
    event.preventDefault();
    if (Number(roomLength) > 0 && Number(roomWidth) > 0) setStep(4);
  }

  function restart() {
    setAnswers({ space: null, atmosphere: null });
    setStep(0);
    setRoomLength("20");
    setRoomWidth("15");
    setBudget("500000");
  }

  return <main className="min-h-screen overflow-hidden bg-[#f3f0e8] text-[#183126]">
    {/* OKOLIGAN BRAND HERO */}
    <section className="relative flex min-h-[min(100svh,760px)] w-full items-center justify-center overflow-hidden bg-[#f7f5ef] px-5 py-20 sm:min-h-screen sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(22,101,52,0.08),transparent_60%)]" />
      <div className="relative z-10 flex w-full max-w-7xl flex-col items-center justify-center">
        <div className="relative w-full max-w-5xl">
          <Image
            src="/okoligan-logo.png"
            alt="Okoligan"
            width={1600}
            height={1000}
            priority
            className="h-auto w-full object-contain"
          />
        </div>
        <p className="mt-6 max-w-full text-center text-xs font-medium uppercase tracking-[0.25em] text-[#172019]/60 sm:text-sm sm:tracking-[0.4em]">Timeless Rugs. Beautiful Spaces.</p>
        <a href="#collection" className="mt-10 rounded-full bg-[#172019] px-6 py-4 text-center text-sm font-medium text-white transition hover:scale-105 hover:bg-emerald-800 sm:px-8">Explore Collection</a>
      </div>
      <div className="absolute bottom-8 flex flex-col items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#172019]/40"><span>Explore</span><span className="text-lg">↓</span></div>
    </section>
    <RugDeck rugs={rugs} loading={loading} error={error} />
    <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-6 sm:py-6 lg:px-10"><Link href="/" className="shrink-0 font-sans text-xl font-semibold tracking-tighter">OKO<span className="text-[#0d8a63]">LIGAN</span></Link><div className="hidden items-center gap-8 font-sans text-sm md:flex"><a href="#collection" className="hover:text-[#0d8a63]">RugRoom Match</a><Link href="/visualize" className="hover:text-[#0d8a63]">Visualize a rug</Link><Link href="/admin" className="hover:text-[#0d8a63]">Admin</Link></div><span className="hidden text-right font-sans text-[10px] uppercase tracking-[0.15em] text-[#6c7d70] sm:inline sm:max-w-44">Rug discovery, measured</span></nav>
    <section className="mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-6 sm:pt-12 lg:px-10 lg:pb-24 lg:pt-20"><div className="grid items-end gap-10 lg:grid-cols-[1.1fr_.9fr] lg:gap-12"><div><p className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-[#0d8a63] sm:tracking-[0.3em]">RugRoom Match™</p><h1 className="mt-5 max-w-3xl font-serif text-5xl leading-[.95] tracking-tighter sm:mt-6 sm:text-7xl lg:text-[7.5rem]">The right rug is a <em className="font-normal text-[#0d8a63]">feeling</em> that fits.</h1><p className="mt-6 max-w-lg font-sans text-base leading-7 text-[#607166] sm:mt-8 sm:text-lg sm:leading-8">Tell us about your room, your mood and your budget. We will show you what actually works, down to the square foot.</p></div><div className="relative min-h-64 overflow-hidden rounded-4xl bg-[#0b513f] p-6 text-[#eff4e8] sm:min-h-88 sm:p-8"><div className="leaf-pattern absolute inset-0 opacity-30" /><div className="relative flex h-full min-h-52 flex-col justify-between"><span className="font-sans text-xs uppercase tracking-[0.2em] text-[#b8d6b6]">No guesswork required</span><div><p className="font-serif text-4xl leading-none sm:text-5xl">Good design<br /><em className="font-normal text-[#a7d6ab]">has dimensions.</em></p><p className="mt-4 max-w-xs font-sans text-sm leading-6 text-[#c8ded0] sm:mt-5">A quick reality check for the rug you are about to fall for.</p></div></div></div></div></section>
    <section id="collection" className="border-y border-[#d9ded3] bg-[#e8eee4] px-5 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-24"><div className="mx-auto min-w-0 max-w-6xl">
      {!result ? <Journey step={step} roomLength={roomLength} roomWidth={roomWidth} budget={budget} setRoomLength={setRoomLength} setRoomWidth={setRoomWidth} setBudget={setBudget} choose={choose} showResults={showResults} /> : <Results shade={shade} roomLength={roomLength} roomWidth={roomWidth} roomArea={roomArea} budget={budget} selectedRug={selectedRug} selectedRugId={selectedRugId} setSelectedRugId={setSelectedRugId} sizes={sizes} selectedSize={selectedSize} setSelectedSizeLabel={setSelectedSizeLabel} fit={fit} matches={matches} loading={loading} error={error} restart={restart} />}
    </div></section>
    <footer className="bg-[#183126] px-6 py-10 text-[#eff4e8] lg:px-10"><div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><p className="font-sans font-semibold">OKO<span className="text-[#a7d6ab]">LIGAN</span></p><p className="font-sans text-sm text-[#a7b9ac]">Measure twice. Love your rug once.</p></div></footer>
  </main>;
}

function RugDeck({ rugs, loading, error }: { rugs: Rug[]; loading: boolean; error: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [pointerStart, setPointerStart] = useState<number | null>(null);

  const currentRug = rugs[currentIndex];
  const liked = currentRug ? likedIds.has(currentRug.id) : false;

  function move(direction: number) {
    if (!rugs.length) return;
    const updateRug = () => setCurrentIndex(index => (index + direction + rugs.length) % rugs.length);
    const viewTransitionDocument = document as Document & { startViewTransition?: (callback: () => void) => void };
    if (viewTransitionDocument.startViewTransition) viewTransitionDocument.startViewTransition(updateRug);
    else updateRug();
  }

  function toggleLike() {
    if (!currentRug) return;
    setLikedIds(previous => {
      const next = new Set(previous);
      if (next.has(currentRug.id)) next.delete(currentRug.id);
      else next.add(currentRug.id);
      return next;
    });
  }

  function finishSwipe(clientX: number) {
    if (pointerStart === null) return;
    const distance = clientX - pointerStart;
    if (Math.abs(distance) > 50) move(distance < 0 ? 1 : -1);
    setPointerStart(null);
  }

  return <section id="available-rugs" className="border-y border-[#d9ded3] bg-[#f3f0e8] px-5 py-14 sm:px-6 sm:py-20 lg:px-10"><div className="mx-auto max-w-5xl"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-[#0d8a63]">Available rugs</p><h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">Find one worth falling for.</h2></div><p className="max-w-xs font-sans text-sm leading-6 text-[#718077]">Swipe through the collection. Tap the heart when a rug feels like yours.</p></div>{loading ? <p className="mt-10 font-sans text-sm text-[#718077]">Loading available rugs...</p> : error ? <p className="mt-10 bg-red-50 p-4 font-sans text-sm text-red-700">{error}</p> : !currentRug ? <p className="mt-10 border border-dashed border-[#b9cbbb] bg-white p-8 font-sans text-sm text-[#718077]">Available rugs will appear here as the collection is added.</p> : <div className="mx-auto mt-10 max-w-xl"><div className="relative touch-pan-y select-none overflow-hidden bg-[#d8e1d5] shadow-[0_20px_45px_rgba(24,49,38,.14)]" onPointerDown={event => setPointerStart(event.clientX)} onPointerUp={event => finishSwipe(event.clientX)} onPointerCancel={() => setPointerStart(null)}><div className="aspect-4/5 sm:aspect-5/6"><img src={currentRug.imageUrl} alt={currentRug.name} draggable="false" className="h-full w-full object-cover" /></div><div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-[#0c241b]/90 via-[#0c241b]/50 to-transparent px-6 pb-6 pt-24 text-white sm:px-8"><div className="flex items-end justify-between gap-4"><div><p className="font-sans text-xs uppercase tracking-[0.2em] text-[#b8d6b6]">{currentIndex + 1} / {rugs.length}</p><h3 className="mt-2 font-serif text-4xl">{currentRug.name}</h3><p className="mt-1 font-sans text-sm text-white/75">{currentRug.colour} · {currentRug.sizes[0] ?? "Available sizes"}</p></div><button type="button" aria-label={liked ? `Remove ${currentRug.name} from loved rugs` : `Love ${currentRug.name}`} onClick={toggleLike} className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-2xl transition ${liked ? "border-[#ffb7aa] bg-[#f66f5e] text-white" : "border-white/50 bg-black/20 text-white hover:bg-white/20"}`}>{liked ? "♥" : "♡"}</button></div></div></div><div className="mt-5 flex items-center justify-between gap-4"><button type="button" aria-label="Previous rug" onClick={() => move(-1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-[#b9cbbb] bg-[#f5f6ef] text-xl transition hover:border-[#0d8a63] hover:text-[#0d8a63]">←</button><p className="text-center font-sans text-xs uppercase tracking-[0.18em] text-[#718077]">Swipe to explore <span className="mx-1 text-[#0d8a63]">·</span> {likedIds.size} loved</p><button type="button" aria-label="Next rug" onClick={() => move(1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-[#b9cbbb] bg-[#f5f6ef] text-xl transition hover:border-[#0d8a63] hover:text-[#0d8a63]">→</button></div><Link href="/visualize" className="mt-5 block text-center font-sans text-sm font-semibold text-[#0d8a63] underline underline-offset-4">Visualize this rug in your space ↗</Link></div>}</div></section>;
}

function Journey({ step, roomLength, roomWidth, budget, setRoomLength, setRoomWidth, setBudget, choose, showResults }: { step: number; roomLength: string; roomWidth: string; budget: string; setRoomLength: (value: string) => void; setRoomWidth: (value: string) => void; setBudget: (value: string) => void; choose: (choice: Choice) => void; showResults: (event: React.FormEvent) => void }) {
  if (step < 2) {
    const question = choices[step];
    return <><div className="flex items-center justify-between font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#678072]"><span>{question.eyebrow}</span><span>{step + 1} of 4</span></div><div className="mt-5 h-1 bg-[#d0dbd0]"><div className="h-full bg-[#0d8a63] transition-all" style={{ width: `${((step + 1) / 4) * 100}%` }} /></div><div className="mt-14 max-w-2xl"><h2 className="font-serif text-5xl leading-none tracking-tight sm:text-6xl">{question.title}</h2><p className="mt-5 font-sans text-base leading-7 text-[#607166]">{question.description}</p></div><div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{question.options.map(option => <button key={option.value} onClick={() => choose(option)} className="group flex min-h-37 flex-col justify-between border border-[#cbd8cb] bg-[#f5f6ef] p-5 text-left transition hover:-translate-y-1 hover:border-[#0d8a63] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d8a63] focus:ring-offset-2"><span className="text-2xl text-[#0d8a63]">{option.icon}</span><span><span className="block font-sans font-semibold">{option.label}</span><span className="mt-1 block font-sans text-sm text-[#718077]">{option.detail}</span></span><span className="self-end font-sans text-lg text-[#0d8a63] opacity-0 transition group-hover:opacity-100">↗</span></button>)}</div></>;
  }
  return <form onSubmit={showResults}><div className="flex items-center justify-between font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#678072]"><span>{step === 2 ? "03 / Your dimensions" : "04 / Your budget"}</span><span>{step + 1} of 4</span></div><div className="mt-5 h-1 bg-[#d0dbd0]"><div className="h-full bg-[#0d8a63]" style={{ width: `${((step + 1) / 4) * 100}%` }} /></div><div className="mt-14 max-w-2xl"><h2 className="font-serif text-5xl leading-none tracking-tight sm:text-6xl">{step === 2 ? "Will your rug actually fit?" : "What would you like to spend?"}</h2><p className="mt-5 font-sans text-base leading-7 text-[#607166]">{step === 2 ? "Enter the usable floor area in feet. We will draw the rug to scale and tell you how much floor it covers." : "A useful range helps us surface options that feel right and stay realistic."}</p></div>{step === 2 ? <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-2"><label className="font-sans text-sm font-semibold">Room length (ft)<input required min="1" step="0.5" type="number" value={roomLength} onChange={event => setRoomLength(event.target.value)} className="mt-2 block w-full border border-[#cbd8cb] bg-[#f5f6ef] px-4 py-4 text-2xl outline-none focus:border-[#0d8a63]" /></label><label className="font-sans text-sm font-semibold">Room width (ft)<input required min="1" step="0.5" type="number" value={roomWidth} onChange={event => setRoomWidth(event.target.value)} className="mt-2 block w-full border border-[#cbd8cb] bg-[#f5f6ef] px-4 py-4 text-2xl outline-none focus:border-[#0d8a63]" /></label></div> : <label className="mt-10 block max-w-xl font-sans text-sm font-semibold">Your budget<select value={budget} onChange={event => setBudget(event.target.value)} className="mt-2 block w-full border border-[#cbd8cb] bg-[#f5f6ef] px-4 py-4 text-lg outline-none focus:border-[#0d8a63]"><option value="250000">Up to ₦250,000</option><option value="500000">₦250,000 - ₦500,000</option><option value="1000000">₦500,000 - ₦1,000,000</option><option value="999999999">I am flexible</option></select></label>}<button type="submit" className="mt-10 bg-[#183126] px-7 py-4 font-sans font-semibold text-white transition hover:bg-[#0d8a63]">{step === 2 ? "Continue to budget" : "Show my RugRoom Match"} <span className="ml-3 text-[#a7d6ab]">↗</span></button></form>;
}

function Results({ shade, roomLength, roomWidth, roomArea, budget, selectedRug, selectedRugId, setSelectedRugId, sizes, selectedSize, setSelectedSizeLabel, fit, matches, loading, error, restart }: { shade: { name: string; color: string; description: string }; roomLength: string; roomWidth: string; roomArea: number; budget: string; selectedRug?: Rug; selectedRugId: string; setSelectedRugId: (value: string) => void; sizes: Size[]; selectedSize?: Size; setSelectedSizeLabel: (value: string) => void; fit: { label: string; tone: string; message: string } | null; matches: { rug: Rug; style: number }[]; loading: boolean; error: string; restart: () => void }) {
  const rugArea = selectedSize ? selectedSize.width * selectedSize.length : 0;
  const coverage = roomArea ? Math.round((rugArea / roomArea) * 100) : 0;
  const fitColor = fit?.tone === "green" ? "#16845b" : fit?.tone === "amber" ? "#b27a18" : "#b44b3b";
  return <div><div className="flex flex-wrap items-start justify-between gap-6 sm:gap-8"><div><p className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-[#0d8a63] sm:tracking-[0.3em]">Your RugRoom Match™</p><h2 className="mt-5 font-serif text-5xl leading-none tracking-tighter sm:text-8xl">We found your<br /><em className="font-normal text-[#0d8a63]">perfect rugs.</em></h2><p className="mt-5 max-w-xl font-sans text-base leading-7 text-[#607166] sm:mt-6 sm:text-lg sm:leading-8">Your ideal green tone is <strong className="text-[#183126]">{shade.name}</strong>. {shade.description}</p></div><div className="h-20 w-20 shrink-0 rounded-full border-8 border-[#f5f6ef] shadow-[0_0_0_1px_#cbd8cb] sm:h-28 sm:w-28 sm:border-12" style={{ backgroundColor: shade.color }} /></div>
    <div className="mt-12 grid gap-4 sm:mt-14 sm:gap-5 lg:grid-cols-[1.1fr_.9fr]"><div className="min-w-0 border border-[#cbd8cb] bg-[#f5f6ef] p-5 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-[#0d8a63]">Size reality checker</p><h3 className="mt-3 font-serif text-3xl sm:text-4xl">Your room, to scale</h3><p className="mt-2 font-sans text-sm text-[#718077]">{roomLength} x {roomWidth} ft room · {coverage}% floor coverage</p></div><div className="flex w-full flex-wrap gap-2 font-sans text-xs sm:w-auto"><select value={selectedRugId} onChange={event => setSelectedRugId(event.target.value)} className="min-w-0 flex-1 border border-[#cbd8cb] bg-white px-2 py-2 outline-none sm:max-w-36">{matches.map(({ rug }) => <option key={rug.id} value={rug.id}>{rug.name}</option>)}</select><select value={selectedSize?.label} onChange={event => setSelectedSizeLabel(event.target.value)} className="min-w-0 flex-1 border border-[#cbd8cb] bg-white px-2 py-2 outline-none sm:flex-none">{sizes.map(size => <option key={size.label}>{size.label}</option>)}</select></div></div><div className="mt-6 flex min-h-60 items-center justify-center overflow-hidden bg-[#dce6d7] p-4 sm:mt-8 sm:min-h-72 sm:p-7"><div className="relative flex max-h-56 w-full max-w-lg items-center justify-center border-2 border-[#8da992] bg-[#edf1e8]" style={{ aspectRatio: `${Number(roomLength) / Number(roomWidth)}` }}><span className="absolute left-2 top-2 font-sans text-xs text-[#718077]">{roomLength} ft</span><div className="flex items-center justify-center border-2 border-[#0d8a63] bg-[#5e916f] text-center font-sans text-xs font-semibold text-white shadow-lg" style={{ width: `${Math.min(88, (selectedSize?.width ?? 0) / Number(roomWidth) * 100)}%`, height: `${Math.min(88, (selectedSize?.length ?? 0) / Number(roomLength) * 100)}%` }}>{selectedSize?.label}<br />YOUR RUG</div><span className="absolute bottom-2 left-1/2 -translate-x-1/2 font-sans text-xs text-[#718077]">{roomWidth} ft</span></div></div><div className="mt-5 flex items-start gap-3 font-sans"><span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: fitColor }} /><div><strong style={{ color: fitColor }}>{fit?.label}</strong><p className="mt-1 text-sm text-[#607166]">{fit?.message}</p></div></div></div>
      <div className="bg-[#183126] p-6 text-[#eff4e8] sm:p-8"><p className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-[#a7d6ab]">Best overall match</p><h3 className="mt-3 font-serif text-4xl">{selectedRug?.name ?? "Your next favourite"}</h3><div className="mt-8 space-y-4 border-t border-white/20 pt-6 font-sans text-sm"><Score label="Style match" value={matches[0]?.style ?? 92} /><Score label="Size match" value={fit?.tone === "green" ? 95 : fit?.tone === "amber" ? 72 : 38} /><Score label="Budget match" value={selectedRug && Number(budget) >= selectedRug.price ? 90 : 62} /></div><div className="mt-8 border-t border-white/20 pt-5"><p className="font-sans text-xs uppercase tracking-[0.2em] text-[#a7d6ab]">Overall match</p><p className="mt-1 font-serif text-5xl">{Math.round(((matches[0]?.style ?? 92) + (fit?.tone === "green" ? 95 : 72) + (selectedRug && Number(budget) >= selectedRug.price ? 90 : 62)) / 3)}%</p></div>{selectedRug && <p className="mt-6 font-sans text-sm text-[#c8ded0]">₦{selectedRug.price.toLocaleString()} · {selectedRug.sizes.join(" · ")}</p>}</div></div>
    <div className="mt-14 border-t border-[#cbd8cb] pt-8"><div className="flex items-end justify-between gap-5"><div><p className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-[#0d8a63]">Top matches</p><h3 className="mt-3 font-serif text-4xl">Made for your room</h3></div><button onClick={restart} className="font-sans text-sm font-semibold text-[#0d8a63] underline underline-offset-4">Start again</button></div>{loading ? <p className="mt-8 font-sans text-sm text-[#718077]">Finding your best matches...</p> : error ? <p className="mt-8 bg-red-50 p-4 font-sans text-sm text-red-700">{error}</p> : matches.length === 0 ? <p className="mt-8 border border-dashed border-[#b9cbbb] bg-[#f5f6ef] p-8 font-sans text-sm text-[#718077]">Your matches will appear as the collection is added.</p> : <div className="mt-8 grid gap-4 md:grid-cols-3">{matches.map(({ rug, style }) => <button key={rug.id} onClick={() => setSelectedRugId(rug.id)} className="group bg-[#f5f6ef] text-left"><div className="relative aspect-4/3 overflow-hidden bg-[#d8e1d5]"><img src={rug.imageUrl} alt={rug.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><span className="absolute left-3 top-3 bg-[#f5f6ef] px-3 py-1 font-sans text-xs font-semibold">{style}% match</span></div><div className="p-5"><h4 className="font-serif text-2xl">{rug.name}</h4><p className="mt-1 font-sans text-sm text-[#718077]">{rug.colour} · ₦{rug.price.toLocaleString()}</p></div></button>)}</div>}</div>
  </div>;
}

function Score({ label, value }: { label: string; value: number }) { return <div><div className="flex justify-between"><span>{label}</span><strong>{value}%</strong></div><div className="mt-2 h-1 bg-white/20"><div className="h-full bg-[#a7d6ab]" style={{ width: `${value}%` }} /></div></div>; }
