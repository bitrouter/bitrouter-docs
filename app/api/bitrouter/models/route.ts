import { NextResponse } from "next/server";

const API_BASE = "https://api.bitrouter.ai";

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/models`, {
      next: { revalidate: 300 }, // cache 5 minutes
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch models" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 502 },
    );
  }
}
