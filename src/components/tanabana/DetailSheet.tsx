"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { GitBranch, ListChecks, MapPin, Sparkles } from "lucide-react";
import {
  CATEGORIES,
  CARD,
  CATEGORY_NODES,
  NODES,
  getNode,
  type ThreadNode,
} from "@/data/mindmap";
import { useIsMobile } from "@/hooks/use-mobile";

interface DetailSheetProps {
  selectedId: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
}

export function DetailSheet({ selectedId, onClose, onSelect }: DetailSheetProps) {
  const isMobile = useIsMobile();
  const node: ThreadNode | null = selectedId ? getNode(selectedId) ?? null : null;
  const cat = node ? CATEGORIES[node.category] : null;

  const children =
    node && node.kind !== "leaf"
      ? node.kind === "root"
        ? CATEGORY_NODES
        : NODES.filter((n) => n.parentId === node.id)
      : [];

  return (
    <Sheet open={!!node} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={
          isMobile
            ? "cloth-card h-[86dvh] max-h-[86dvh] w-full rounded-t-3xl border-t overflow-hidden p-0 sm:max-w-none"
            : "cloth-card w-full overflow-hidden p-0 sm:max-w-md border-l"
        }
        style={{ borderColor: cat ? `${cat.color}55` : undefined, background: "#FDFBF5" }}
      >
        {node && cat && (
          <div className="flex h-full flex-col">
            {/* thread band */}
            <div
              aria-hidden
              className="h-2.5 w-full shrink-0"
              style={{
                background: `repeating-linear-gradient(-45deg, ${cat.color} 0 10px, ${cat.colorDark} 10px 14px, ${CARD} 14px 18px, ${cat.color} 18px 22px)`,
              }}
            />
            <div className="flex-1 overflow-y-auto px-6 pb-8 pt-5 tanabana-scroll">
              <SheetHeader className="space-y-2 p-0 text-left">
                <div className="flex items-center gap-2.5">
                  <span
                    className="inline-flex h-2 w-8 rounded-full"
                    style={{ background: cat.color }}
                    aria-hidden
                  />
                  <p className="font-body text-[12px] font-semibold uppercase tracking-[0.25em] text-[#8A7F72]">
                    {node.kind === "root"
                      ? "The Map"
                      : node.kind === "category"
                        ? "A Main Thread"
                        : "A Knot on the Thread"}
                  </p>
                </div>
                <SheetTitle
                  className="font-display text-[30px] font-semibold leading-tight text-[#1C1610]"
                  style={{ textDecorationColor: cat.color }}
                >
                  {node.title}
                </SheetTitle>
                <div className="flex items-center gap-2">
                  {node.deva && (
                    <SheetDescription
                      asChild
                      className="font-deva text-base text-[#8A7F72]"
                    >
                      <span>{node.deva}</span>
                    </SheetDescription>
                  )}
                  <SheetDescription className="font-body text-[15px] italic leading-snug text-[#4A4238]">
                    {node.tagline}
                  </SheetDescription>
                </div>
              </SheetHeader>

              {/* the definition */}
              <div className="mt-4 space-y-3.5">
                {node.description.map((p, i) => (
                  <p key={i} className="text-pretty font-body text-[15.5px] leading-[1.65] text-[#1F1811]">
                    {p}
                  </p>
                ))}
              </div>

              {/* how it works — short bullets */}
              {node.howItWorks && node.howItWorks.length > 0 && (
                <div className="mt-6">
                  <p className="flex items-center gap-1.5 font-body text-[11.5px] font-bold uppercase tracking-[0.22em] text-[#8A7F72]">
                    <ListChecks className="h-3.5 w-3.5" aria-hidden /> How it works
                  </p>
                  <ul className="mt-2.5 space-y-2">
                    {node.howItWorks.map((h, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span
                          className="mt-[9px] h-[3px] w-3 shrink-0 rounded-full"
                          style={{ background: cat.color }}
                          aria-hidden
                        />
                        <span className="text-pretty font-body text-[14.5px] leading-relaxed text-[#1F1811]">
                          {h}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* further types — the sub-branches of this family */}
              {node.subtypes && node.subtypes.length > 0 && (
                <div className="mt-6">
                  <p className="flex items-center gap-1.5 font-body text-[11.5px] font-bold uppercase tracking-[0.22em] text-[#8A7F72]">
                    <GitBranch className="h-3.5 w-3.5" aria-hidden /> Further types
                  </p>
                  <ul
                    className="mt-2.5 space-y-2.5 border-l-2 pl-3.5"
                    style={{ borderColor: `${cat.color}55` }}
                  >
                    {node.subtypes.map((st) => (
                      <li key={st.name}>
                        <p className="font-body text-[14.5px] font-semibold leading-snug text-[#1C1610]">
                          {st.name}
                        </p>
                        <p className="mt-0.5 text-pretty font-body text-[13.5px] leading-snug text-[#4A4238]">
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
                  className="cloth-card mt-6 rounded-2xl border p-4"
                  style={{
                    borderColor: `${cat.color}55`,
                    background: `linear-gradient(135deg, ${cat.color}14, ${cat.color}05)`,
                  }}
                >
                  <p className="flex items-center gap-1.5 font-body text-[11.5px] font-bold uppercase tracking-[0.22em]" style={{ color: cat.colorDark }}>
                    <Sparkles className="h-3.5 w-3.5" aria-hidden /> A super interesting use case
                  </p>
                  <p className="mt-2 text-pretty font-body text-[15px] leading-relaxed text-[#1F1811]">
                    {node.useCase}
                  </p>
                </div>
              )}

              {/* where it shows up — concrete examples */}
              {node.applications.length > 0 && (
                <div className="mt-6">
                  <p className="flex items-center gap-1.5 font-body text-[11.5px] font-bold uppercase tracking-[0.22em] text-[#8A7F72]">
                    <MapPin className="h-3.5 w-3.5" aria-hidden /> Where it shows up
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
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

              {children.length > 0 && (
                <div className="mt-6">
                  <p className="font-body text-[11.5px] font-bold uppercase tracking-[0.22em] text-[#8A7F72]">
                    {node.kind === "root" ? "The main threads" : "Knots on this thread"}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {children.map((ch) => {
                      const chCat = CATEGORIES[ch.category];
                      return (
                        <button
                          key={ch.id}
                          onClick={() => onSelect(ch.id)}
                          className="group inline-flex items-center gap-1.5 rounded-full border bg-[#FFFDF7] px-3.5 py-2 font-body text-[13.5px] font-medium text-[#1F1811] transition-all hover:shadow-[0_3px_10px_-4px_rgba(46,38,32,0.3)]"
                          style={{ borderColor: `${chCat.color}66` }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: chCat.color }}
                            aria-hidden
                          />
                          {ch.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <p className="mt-8 border-t border-dashed border-[#D8CDB9] pt-3 text-center font-body text-[11.5px] tracking-wide text-[#A79A87]">
                TanaBana · weaving through technology, power &amp; justice
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
