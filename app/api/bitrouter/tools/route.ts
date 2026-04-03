import { NextResponse } from "next/server";

const API_BASE = process.env.BITROUTER_API_BASE!;

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/tools`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch tools" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch tools" },
      { status: 502 },
    );
  }
}
