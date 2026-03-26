import { NextResponse } from "next/server";

// TODO: switch back to https://api.bitrouter.ai once custom domain SSL is resolved
const API_BASE = "https://bitrouter-node-production.up.railway.app";

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/v1/models`, {
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
