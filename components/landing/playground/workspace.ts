import { Bash } from "just-bash/browser";
import type { FxHostTool } from "libfx/browser";
import { z } from "zod";
import { playgroundToolDefinitions } from "@/lib/playground-tools";

const root = "/workspace";
const initialFiles = {
  "/workspace/src/session.ts": "export async function getSession(session, refresh) {\n  if (!session) return refresh();\n  return session;\n}\n",
  "/workspace/test-output.txt": "FAIL refreshes an expired session\nExpected: refreshed token\nReceived: expired token\n",
};

export async function createPlaygroundWorkspace() {
  const bash = new Bash({
    cwd: root,
    files: initialFiles,
    commands: ["cat", "ls", "tree", "find", "grep", "sed", "awk", "jq", "diff", "head", "tail", "wc", "sort", "uniq", "cut",
      "pwd", "mkdir", "touch", "cp", "mv", "rm", "rmdir", "echo", "printf", "tee", "true", "false"],
    executionLimitProfile: "hardened",
    executionLimits: { maxExecutionTimeMs: 3000, maxCommandCount: 150, maxLoopIterations: 100,
      maxFileSystemBytes: 1024 * 1024, maxOutputSize: 12 * 1024, maxTraversalEntries: 300 },
  });

  const paths = () => bash.fs.getAllPaths().filter((path) => path.startsWith(`${root}/`));

  const tools: FxHostTool[] = [
    {
      name: "read_file",
      ...playgroundToolDefinitions.read_file,
      idempotent: true,
      async execute(input: unknown) {
        const { path } = z.object({ path: z.string().min(1).max(240) }).parse(input);
        const absolute = `${root}/${path}`;
        if (!paths().includes(absolute)) throw new Error("File not found in the browser workspace.");
        return (await bash.fs.readFile(absolute)).slice(0, 8000);
      },
    },
    {
      name: "search_files",
      ...playgroundToolDefinitions.search_files,
      idempotent: true,
      async execute(input: unknown) {
        const { query } = z.object({ query: z.string().min(1).max(120) }).parse(input);
        const needle = query.toLowerCase();
        const results: { path: string; line: number; text: string }[] = [];
        for (const path of paths()) {
          if (!(await bash.fs.lstat(path)).isFile) continue;
          const lines = (await bash.fs.readFile(path)).split("\n");
          for (const [index, line] of lines.entries()) {
            if (line.toLowerCase().includes(needle)) results.push({ path: path.slice(root.length + 1), line: index + 1, text: line.slice(0, 300) });
            if (results.length === 24) return results;
          }
        }
        return results;
      },
    },
    {
      name: "shell",
      ...playgroundToolDefinitions.shell,
      async execute(input: unknown, { signal }) {
        const { command } = z.object({ command: z.string().min(1).max(2000) }).parse(input);
        signal.throwIfAborted();
        const { stdout, stderr, exitCode } = await bash.exec(command, { signal, cwd: root });
        signal.throwIfAborted();
        return { stdout: stdout.slice(0, 8000), stderr: stderr.slice(0, 2000), exitCode };
      },
    },
  ];

  return { tools };
}
