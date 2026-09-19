const BENCHMARK_REPORT =
  "https://huggingface.co/datasets/BitRouterAI/benchmarks/blob/main/terminal-bench-2.1/router-random-study/README.md";

/** One landing-page finding; the linked report owns the full comparison. */
export function Benchmark() {
  return (
    <section className="zed-wrap zed-sec" id="benchmark">
      <div className="zed-benchmark">
        <div className="zed-benchmark-meta">
          <span>Terminal-Bench 2.1</span>
          <span>80 common-valid tasks</span>
        </div>

        <h2 className="zed-benchmark-claim">
          <span>40.93% lower</span>
          nominal API cost
        </h2>

        <p className="zed-benchmark-quality">
          BitRouter achieved <strong>81.25%</strong> task success, compared with{" "}
          <strong>81.56%</strong> for the fixed strong-model baseline.
        </p>
        <p className="zed-benchmark-control">
          Same-pool random routing reached <strong>76.50%</strong>.
        </p>

        <a className="zed-btn-underline zed-benchmark-link" href={BENCHMARK_REPORT}>
          View methodology &amp; data
        </a>

        <p className="zed-benchmark-note">
          Frozen-price nominal API cost on accepted valid-path requests. Not provider billing.
          Research artifact; not an official Terminal-Bench submission.
        </p>
      </div>
    </section>
  );
}
