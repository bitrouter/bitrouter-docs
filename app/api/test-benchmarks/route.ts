import { NextResponse } from "next/server";
import { fetchModels } from "@/lib/models-server";

export async function GET() {
  try {
    const models = await fetchModels();
    
    // Count models with benchmarks
    const withBenchmarks = models.filter(m => m.benchmarks).length;
    
    // Get a sample of models with benchmarks
    const samples = models
      .filter(m => m.benchmarks)
      .slice(0, 5)
      .map(m => ({
        id: m.id,
        benchmarks: m.benchmarks
      }));
    
    return NextResponse.json({
      total: models.length,
      withBenchmarks,
      samples,
      aaApiKeySet: !!process.env.AA_API_KEY
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}