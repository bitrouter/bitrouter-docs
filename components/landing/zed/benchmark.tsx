import { ZED_LINKS } from "./primitives";

const BENCHMARK_REPORT =
  "https://github.com/bitrouter/bitrouter/blob/main/benchmarks/001-2026-07-10-tbench-v2.1-codex-gpt55-kimi-k27.md";
const BENCHMARK_DATA = "https://huggingface.co/datasets/BitRouterAI/benchmarks";

/** Public evidence, with the experiment boundary shown beside the result. */
export function Benchmark() {
  return (
    <section className="zed-wrap zed-sec" id="benchmark">
      <div className="zed-evidence">
        <div>
          <div className="zed-eyebrow">Measured evidence</div>
          <h2 className="zed-display">See what routing saves.</h2>
          <p className="zed-lead">
            Compare inference cost and task success on the same workload, then inspect the policy,
            traces, and accounting behind the result.
          </p>
          <div className="zed-action-row">
            <a className="zed-btn zed-btn-ghost" href={BENCHMARK_REPORT}>
              Read the benchmark
            </a>
            <a className="zed-btn-underline" href={BENCHMARK_DATA}>
              Explore the data
            </a>
          </div>
        </div>

        <div className="zed-evidence-result">
          <div className="zed-evidence-number">−32.8%</div>
          <div className="zed-cardlabel">zero-cache imputed cost vs. control</div>
          <p className="zed-body">
            Terminal-Bench 2.1 mechanism study using GPT-5.5 as the strong route and Kimi K2.7 Code
            as the economy route. The audited range was 28.6–32.8% under equal cache-read shares,
            with one fewer task passed on the 88-task comparable set.
          </p>
          <div className="zed-evidence-note">
            One controlled study under a modified protocol — not a leaderboard submission or a
            universal savings guarantee.
          </div>
          <a className="zed-source-link" href={ZED_LINKS.github}>
            Source, reports, and limitations →
          </a>
        </div>
      </div>
    </section>
  );
}
