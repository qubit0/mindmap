import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const PALETTE = new Set([
  "#D9536F",
  "#17877B",
  "#DD7A2E",
  "#7C4DA4",
  "#4C8C4A",
  "#C13B3B",
]);

// GET — the fringe: latest visitor threads, oldest first (stable layout order)
export async function GET() {
  try {
    const threads = await db.visitorThread.findMany({
      orderBy: { createdAt: "asc" },
      take: 120,
    });
    return NextResponse.json({ threads });
  } catch (e) {
    console.error("GET /api/threads failed", e);
    return NextResponse.json({ threads: [] }, { status: 200 });
  }
}

// POST — tie a new thread into the fringe
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    const color = typeof body?.color === "string" ? body.color : "";

    if (text.length < 2 || text.length > 90) {
      return NextResponse.json(
        { error: "Your thread should be between 2 and 90 characters." },
        { status: 400 }
      );
    }
    if (!PALETTE.has(color)) {
      return NextResponse.json(
        { error: "Pick one of the six thread colours." },
        { status: 400 }
      );
    }

    const thread = await db.visitorThread.create({
      data: { text, color },
    });
    return NextResponse.json({ thread }, { status: 201 });
  } catch (e) {
    console.error("POST /api/threads failed", e);
    return NextResponse.json(
      { error: "The loom dropped a stitch — try again." },
      { status: 500 }
    );
  }
}
