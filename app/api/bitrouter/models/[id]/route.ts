import { NextResponse } from "next/server";

const API_BASE = process.env.BITROUTER_API_BASE!;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);

    const res = await fetch(`${API_BASE}/models`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch models" },
        { status: res.status },
      );
    }

    const data = await res.json();
    const model = data.data.find((m: { id: string }) => m.id === decodedId);

    if (!model) {
      return NextResponse.json(
        { error: "Model not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: model });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch model" },
      { status: 502 },
    );
  }
}
