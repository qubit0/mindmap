import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, GitBranch, ListChecks, MapPin, ArrowLeft, Sparkles } from "lucide-react";
import { ClothBackdrop } from "@/components/tanabana/ClothBackdrop";
import {
  CATEGORIES,
  CARD,
  CATEGORY_NODES,
  NODES,
  getNode,
} from "@/data/mindmap";

// ─────────────────────────────────────────────────────────────────────────────
// /card/[id] — the takeaway a visitor carries out of the room.
// One knot, one page: the definition, how it works, its further types, a
// super interesting use case and where it shows up — readable on a phone,
// framed by the same woven cotton as the map itself.
// ─────────────────────────────────────────────────────────────────────────────

export function generateStaticParams() {
  const ids = [
    "root",
    ...CATEGORY_NODES.map((c) => c.id),
    ...NODES.filter((n) => n.kind === "leaf").map((n) => n.id),
  ];
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const node = getNode(id);
  if (!node) return { title: "Thread not found · TanaBana" };
  return {
    title: `${node.title} · TanaBana`,
    description: node.tagline,
    openGraph: {
      title: `${node.title} · TanaBana`,
      description: node.tagline,
      type: "website",
    },
  };
}

export default async function CardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const node = getNode(id);
  if (!node) notFound();

  const cat = CATEGORIES[node.category];
  const kicker =
    node.kind === "root"
      ? "The Map"
      : node.kind === "category"
        ? "A Main Thread"
        : "A Knot on the Thread";

  return (
    <div className="weave-bg relative min-h-dvh w-full">
      <ClothBackdrop />

      {/* thread band — the colour of this knot's branch */}
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 z-20 h-2.5"
        style={{
          background: `repeating-linear-gradient(-45deg, ${cat.color} 0 10px, ${cat.colorDark} 10px 14px, ${CARD} 14px 18px, ${cat.color} 18px 22px)`,
        }}
      />

      <main className="relative z-10 mx-auto flex w-full max-w-xl flex-col px-5 pb-12 pt-9">
        {/* kicker */}
        <div className="flex items-center gap-2.5">
          <span
            className="inline-flex h-2 w-8 rounded-full"
            style={{ background: cat.color }}
            aria-hidden
          />
          <p className="font-body text-[12px] font-semibold uppercase tracking-[0.25em] text-[#8A7F72]">
            {kicker}
          </p>
        </div>

        <h1 className="mt-2 font-display text-[34px] font-semibold leading-tight text-[#1C1610]">
          {node.title}
        </h1>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {node.deva && (
            <p className="font-deva text-lg text-[#3E3529]">{node.deva}</p>
          )}
          <p className="font-body text-[15.5px] italic leading-snug text-[#4A4238]">
            {node.tagline}
          </p>
        </div>

        {/* the definition */}
        <div className="mt-6 space-y-4">
          {node.description.map((p, i) => (
            <p
              key={i}
              className="text-pretty font-body text-[16px] leading-[1.7] text-[#1F1811]"
            >
              {p}
            </p>
          ))}
        </div>

        {/* how it works */}
        {node.howItWorks && node.howItWorks.length > 0 && (
          <div className="mt-7">
            <p className="flex items-center gap-1.5 font-body text-[11.5px] font-bold uppercase tracking-[0.22em] text-[#8A7F72]">
              <ListChecks className="h-3.5 w-3.5" aria-hidden /> How it works
            </p>
            <ul className="mt-3 space-y-2.5">
              {node.howItWorks.map((h, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span
                    className="mt-[10px] h-[3px] w-3 shrink-0 rounded-full"
                    style={{ background: cat.color }}
                    aria-hidden
                  />
                  <span className="text-pretty font-body text-[15px] leading-relaxed text-[#1F1811]">
                    {h}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* further types */}
        {node.subtypes && node.subtypes.length > 0 && (
          <div className="mt-7">
            <p className="flex items-center gap-1.5 font-body text-[11.5px] font-bold uppercase tracking-[0.22em] text-[#8A7F72]">
              <GitBranch className="h-3.5 w-3.5" aria-hidden /> Further types
            </p>
            <ul
              className="mt-3 space-y-3 border-l-2 pl-4"
              style={{ borderColor: `${cat.color}55` }}
            >
              {node.subtypes.map((st) => (
                <li key={st.name}>
                  <p className="font-body text-[15px] font-semibold leading-snug text-[#1C1610]">
                    {st.name}
                  </p>
                  <p className="mt-0.5 text-pretty font-body text-[14px] leading-snug text-[#4A4238]">
                    {st.line}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* a super interesting practical use case */}
        {node.useCase && (
          <div
            className="cloth-card mt-7 rounded-2xl border p-4"
            style={{
              borderColor: `${cat.color}55`,
              background: `linear-gradient(135deg, ${cat.color}14, ${cat.color}05)`,
            }}
          >
            <p className="flex items-center gap-1.5 font-body text-[11.5px] font-bold uppercase tracking-[0.22em]" style={{ color: cat.colorDark }}>
              <Sparkles className="h-3.5 w-3.5" aria-hidden /> A super interesting use case
            </p>
            <p className="mt-2 text-pretty font-body text-[15.5px] leading-relaxed text-[#1F1811]">
              {node.useCase}
            </p>
          </div>
        )}

        {/* where it shows up */}
        {node.applications.length > 0 && (
          <div className="mt-7">
            <p className="flex items-center gap-1.5 font-body text-[11.5px] font-bold uppercase tracking-[0.22em] text-[#8A7F72]">
              <MapPin className="h-3.5 w-3.5" aria-hidden /> Where it shows up
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {node.applications.map((app, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-[#FFFDF7] px-3.5 py-2 font-body text-[13.5px] font-medium text-[#1F1811]"
                  style={{ borderColor: `${cat.color}66` }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: cat.color }}
                    aria-hidden
                  />
                  {app}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* event footer */}
        <div className="mt-9 rounded-2xl border border-dashed border-[#B9AC97] bg-[#FFFDF7] p-4">
          <p className="font-display text-[17px] font-bold text-[#1C1610]">
            TanaBana · ताना-बाना
          </p>
          <p className="mt-0.5 font-body text-[12.5px] italic text-[#4A4238]">
            Weaving through technology, power &amp; justice
          </p>
          <div className="mt-3 space-y-1.5">
            <p className="flex items-center gap-2 font-body text-[13.5px] text-[#1F1811]">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-[#D9536F]" aria-hidden />
              October 8 (Thu) &amp; 9 (Fri), 2026 · 10 AM – 7 PM
            </p>
            <p className="flex items-center gap-2 font-body text-[13.5px] text-[#1F1811]">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#17877B]" aria-hidden />
              Yalamaya Kendra, Patan Dhoka, Lalitpur, Nepal
            </p>
          </div>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 font-body text-[13.5px] font-semibold transition-all hover:shadow-[0_3px_10px_-4px_rgba(46,38,32,0.3)]"
            style={{ borderColor: `${cat.color}88`, color: cat.colorDark }}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Open the full map
          </Link>
        </div>

        <p className="mt-6 text-center font-body text-[11.5px] tracking-wide text-[#A79A87]">
          TanaBana · weaving through technology, power &amp; justice
        </p>
      </main>
    </div>
  );
}
