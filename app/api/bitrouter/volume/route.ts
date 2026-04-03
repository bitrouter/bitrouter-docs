import { NextResponse } from "next/server";

const API_BASE = process.env.BITROUTER_API_BASE!;

export async function GET() {
  const apiKey = process.env.BITROUTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "BITROUTER_API_KEY not configured" },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(`${API_BASE}/network/volume`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch volume data" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch volume data" },
      { status: 502 },
    );
  }
}
