import "server-only";

/**
 * Where the playground's spend authority comes from.
 *
 * This is the only place the playground learns who is paying, and it is
 * deliberately the whole auth surface of this repo: everything else takes a
 * resolved credential as an argument. There are two implementations.
 *
 * - `byo-key` — a `BITROUTER_API_KEY` from the environment. No console, no
 *   sign-in, no attribution. This is what a fork, a local checkout, or a
 *   self-hoster gets, and it is the default so cloning this repo works
 *   unchanged.
 * - `session` — what bitrouter.ai runs. The visitor is signed in to the console
 *   on the sibling subdomain; this forwards their cookie to the console's token
 *   endpoint and receives a narrowly-scoped, short-lived credential minted for
 *   them. The console owns the minting policy (scope, TTL, free grant); this
 *   repo only knows the contract.
 *
 * The forward happens **server-side**. The alternative — the browser calling
 * the console directly over credentialed CORS and handing us the token — would
 * put a spendable bearer in page JavaScript. A minted `bra_` is a signed JWT
 * the router verifies with no round trip, so nothing can revoke it before it
 * expires; keeping it off the client is worth the extra hop.
 */

/** The credential source this deployment is configured for. */
export type CredentialMode = "session" | "byo-key";

/**
 * What the credential is for. The console mints a different kind per purpose:
 * a short-lived signed `bra_` for a stateless turn, and a revocable `brk_` for
 * a harness session that outlives it (the token is baked into a sandbox's
 * environment at spawn and has no refresh path).
 */
export type CredentialPurpose = "chat" | "harness";

export interface PlaygroundCredential {
  /** Bearer for the BitRouter router. */
  token: string;
  /** The router endpoint this token is good for. */
  baseUrl: string;
  expiresAt: Date;
  /** Null in `byo-key` mode — there is no user to attribute spend to. */
  attribution: { userId: string; namespaceId: string } | null;
  mode: CredentialMode;
  purpose: CredentialPurpose;
  /**
   * Present only when the credential is independently revocable (the `harness`
   * purpose in `session` mode). Passed back to {@link revokePlaygroundCredential}.
   */
  revocationId?: string;
}

/**
 * A credential could not be resolved. `status` is the response the caller
 * should send: 401 when the visitor is not signed in, 402 when their grant is
 * spent, 503 when the console is unreachable, 500 when this deployment is
 * misconfigured.
 */
export class CredentialError extends Error {
  constructor(
    message: string,
    readonly status: 401 | 402 | 500 | 503,
  ) {
    super(message);
    this.name = "CredentialError";
  }
}

/** `byo-key` tokens do not expire on their own. */
const NEVER = new Date("9999-12-31T23:59:59.000Z");

/** How long to wait on the console before giving up and reporting 503. */
const TOKEN_ENDPOINT_TIMEOUT_MS = 10_000;

/**
 * Which mode this deployment runs in.
 *
 * Defaults to `byo-key` so a clone with nothing but `BITROUTER_API_KEY` set
 * behaves exactly as it did before auth existed. Production sets
 * `PLAYGROUND_CREDENTIAL_MODE=session`.
 */
export function credentialMode(): CredentialMode {
  return process.env.PLAYGROUND_CREDENTIAL_MODE === "session"
    ? "session"
    : "byo-key";
}

function routerBaseUrl(): string {
  const baseUrl = process.env.BITROUTER_API_BASE;
  if (!baseUrl) {
    throw new CredentialError("BITROUTER_API_BASE is not set.", 500);
  }
  return baseUrl;
}

function consoleBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_CONSOLE_URL;
  if (!url) {
    throw new CredentialError(
      "NEXT_PUBLIC_CONSOLE_URL is not set; session mode needs a console to mint against.",
      500,
    );
  }
  return url.replace(/\/+$/, "");
}

/**
 * The origin we present to the console's CSRF gate.
 *
 * A server-to-server fetch carries no browser `Origin`, and the console's
 * `enforceCsrf` rejects a state-changing request without one. Ours must be on
 * the console's `BETTER_AUTH_TRUSTED_ORIGINS` — the same allowlist that already
 * lets this site read the shared session.
 */
function selfOrigin(): string {
  const url = process.env.NEXT_PUBLIC_WEB_URL;
  if (!url) {
    throw new CredentialError(
      "NEXT_PUBLIC_WEB_URL is not set; session mode needs it for the console's CSRF check.",
      500,
    );
  }
  return new URL(url).origin;
}

/** The console's token-endpoint response. */
type TokenResponse = {
  token?: unknown;
  expiresAt?: unknown;
  namespaceId?: unknown;
  userId?: unknown;
  revocationId?: unknown;
};

function parseTokenResponse(
  body: TokenResponse,
  purpose: CredentialPurpose,
): PlaygroundCredential {
  const { token, expiresAt, namespaceId, userId, revocationId } = body;
  if (
    typeof token !== "string" ||
    typeof expiresAt !== "string" ||
    typeof namespaceId !== "string" ||
    typeof userId !== "string"
  ) {
    throw new CredentialError(
      "The console returned a malformed playground token.",
      503,
    );
  }
  const expiry = new Date(expiresAt);
  if (Number.isNaN(expiry.getTime())) {
    throw new CredentialError(
      "The console returned an unparseable token expiry.",
      503,
    );
  }
  return {
    token,
    baseUrl: routerBaseUrl(),
    expiresAt: expiry,
    attribution: { userId, namespaceId },
    mode: "session",
    purpose,
    revocationId: typeof revocationId === "string" ? revocationId : undefined,
  };
}

/**
 * Mint against the console on behalf of whoever owns the request's cookie.
 *
 * The cookie is parent-domain scoped (`bitrouter.ai`), so a request to this
 * site already carries the console's session cookie — forwarding the header
 * verbatim is enough to authenticate as that visitor.
 */
async function mintFromConsole(
  req: Request,
  purpose: CredentialPurpose,
): Promise<PlaygroundCredential> {
  const cookie = req.headers.get("cookie");
  if (!cookie) {
    throw new CredentialError("Sign in to use the playground.", 401);
  }

  // Resolve config before the fetch so a misconfigured deployment reports 500
  // rather than a confusing 503 from a request that was never going to work.
  const endpoint = `${consoleBaseUrl()}/api/playground/token`;
  const origin = selfOrigin();

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie,
        origin,
      },
      body: JSON.stringify({ purpose }),
      signal: AbortSignal.timeout(TOKEN_ENDPOINT_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (err) {
    throw new CredentialError(
      `Could not reach the console to mint a playground token: ${
        err instanceof Error ? err.message : String(err)
      }`,
      503,
    );
  }

  if (response.status === 401) {
    throw new CredentialError("Sign in to use the playground.", 401);
  }
  if (response.status === 402) {
    // The console's own words — it knows what the grant was and whether the
    // account has a balance to fall through to.
    const detail = await response.text().catch(() => "");
    throw new CredentialError(
      detail.slice(0, 200) || "Your playground credit is used up.",
      402,
    );
  }
  if (!response.ok) {
    throw new CredentialError(
      `The console refused to mint a playground token (${response.status}).`,
      503,
    );
  }

  return parseTokenResponse((await response.json()) as TokenResponse, purpose);
}

/** The environment key, for deployments that run without a console. */
function fromEnvironment(purpose: CredentialPurpose): PlaygroundCredential {
  const token = process.env.BITROUTER_API_KEY;
  if (!token) {
    throw new CredentialError("BITROUTER_API_KEY is not set.", 500);
  }
  return {
    token,
    baseUrl: routerBaseUrl(),
    expiresAt: NEVER,
    attribution: null,
    mode: "byo-key",
    purpose,
  };
}

/**
 * Resolve the credential this request should spend on.
 *
 * Throws {@link CredentialError} rather than returning null so the caller can
 * distinguish "not signed in" from "out of credit" from "console down" — three
 * cases the playground must report differently.
 */
export async function resolveCredential(
  req: Request,
  purpose: CredentialPurpose,
): Promise<PlaygroundCredential> {
  return credentialMode() === "session"
    ? mintFromConsole(req, purpose)
    : fromEnvironment(purpose);
}

/**
 * Hand a harness credential back when its session ends.
 *
 * Only the revocable kind has anything to return; everything else is a no-op.
 * Best-effort by construction — a credential that outlives its session until
 * `expiresAt` is a bounded cost, but a failed teardown must never fail the
 * sweep that triggered it.
 */
export async function revokePlaygroundCredential(
  credential: PlaygroundCredential,
): Promise<void> {
  if (credential.mode !== "session" || !credential.revocationId) return;

  try {
    await fetch(`${consoleBaseUrl()}/api/playground/token`, {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        origin: selfOrigin(),
        // No cookie: the session that minted this may be long gone. The
        // revocation id is the capability, and it only ever revokes itself.
        authorization: `Bearer ${credential.token}`,
      },
      body: JSON.stringify({ revocationId: credential.revocationId }),
      signal: AbortSignal.timeout(TOKEN_ENDPOINT_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch {
    // Swallowed deliberately — see the doc comment.
  }
}
