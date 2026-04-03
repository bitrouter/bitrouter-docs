import { NextResponse } from "next/server";

const API_BASE = process.env.BITROUTER_API_BASE!;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);

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
    const tool = data.data.find((t: { id: string }) => t.id === decodedId);

    if (!tool) {
      return NextResponse.json(
        { error: "Tool not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: tool });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch tool" },
      { status: 502 },
    );
  }
}
