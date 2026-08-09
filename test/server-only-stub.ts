/**
 * Stands in for the `server-only` marker module under vitest.
 *
 * `server-only` is not an npm dependency here — Next resolves it at build time,
 * where it exists to make a client component that imports a server module fail
 * loudly. Vitest has no such resolution, so importing a `server-only` module in
 * a test throws before the test runs. Aliasing it to this empty file keeps the
 * marker meaningful in the build and inert in the test run.
 */
export {};
