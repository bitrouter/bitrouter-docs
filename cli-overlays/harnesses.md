---
title: Coding agents
---

Choose the interaction model that matches the task:

- `bro launch`, `bro claude`, and `bro codex` preserve the harness's native interface.
- `bro code` opens BitRouter's coding conversation and connects to an ACP agent.
- `bro run` sends one ACP prompt headlessly and returns NDJSON, text, or only the final answer.

These commands do not imply the durable multi-attempt workflow described in BitRouter's architecture proposals. They run or connect to the selected harness using the released ACP and launch surfaces.

## @launch

```bash
bro launch claude
```

Routed harnesses point their model traffic at the local daemon. Own-auth harnesses launch directly. Use `--check` to verify the executable, endpoint, and route without starting the harness.

## @code

```bash
bro code
bro code codex-acp --model openai/gpt-5
```

Omit the agent id to choose inside the conversation, or pass an ACP agent id directly. `--load` replays a native session; `--resume` resumes it without replaying history.

## @run

```bash
bro run codex-acp "Review the current diff" --format quiet
```

The default permission policy denies requests. Choose an explicit approval mode or pass a per-tool policy when the task needs tools.
