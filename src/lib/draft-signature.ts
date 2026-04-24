import { createHmac, timingSafeEqual } from "node:crypto";

export type PreviewContinuationOptions = {
  previewDatabaseId?: string | null;
  previewExp?: string | null;
  previewSig?: string | null;
};

/**
 * WordPress `nextjs-draft-mode.php` の HMAC ペイロードと一致させる。
 * スラッグは含めない（日本語・エンコード差で署名が壊れるのを防ぐ）。
 */
export function buildCanonicalDraftPayload(
  id: string,
  type: string,
  exp: number
): string {
  const body: Record<string, string | number> = {
    exp,
    id: Number(id),
    type,
  };
  const ordered: Record<string, string | number> = {};
  for (const key of Object.keys(body).sort()) {
    ordered[key] = body[key]!;
  }
  return JSON.stringify(ordered);
}

export function isDraftSignatureValid(
  id: string,
  type: string,
  expStr: string | null | undefined,
  sigHex: string | null | undefined,
  secret: string
): boolean {
  if (!expStr || !sigHex) {
    return false;
  }
  const exp = Number(expStr);
  if (!Number.isFinite(exp)) {
    return false;
  }
  const nowSec = Math.floor(Date.now() / 1000);
  if (exp < nowSec - 60 || exp > nowSec + 10 * 60) {
    return false;
  }
  const canonical = buildCanonicalDraftPayload(id, type, exp);
  const expected = createHmac("sha256", secret).update(canonical).digest("hex");
  try {
    const a = Buffer.from(sigHex, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) {
      return false;
    }
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * プレビュー用 GraphQL は `preview_id` + 有効な `exp`/`sig` のときのみ（Next Draft Mode クッキーは使わない）。
 */
export function isPreviewFetchAllowed(
  wpGraphqlContentType: "post" | "works" | "page",
  options?: PreviewContinuationOptions
): boolean {
  const secret = process.env.NEXTJS_DRAFT_SECRET;
  if (!secret) {
    return false;
  }
  const id = options?.previewDatabaseId?.trim() ?? "";
  if (!/^\d+$/.test(id)) {
    return false;
  }
  return isDraftSignatureValid(
    id,
    wpGraphqlContentType,
    options?.previewExp ?? null,
    options?.previewSig ?? null,
    secret
  );
}

function pickSearchParam(
  sp: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const v = sp[key];
  if (v === undefined) {
    return undefined;
  }
  return Array.isArray(v) ? v[0] : v;
}

export function previewOptionsFromSearchParams(
  sp: Record<string, string | string[] | undefined>
): PreviewContinuationOptions {
  return {
    previewDatabaseId: pickSearchParam(sp, "preview_id"),
    previewExp: pickSearchParam(sp, "exp"),
    previewSig: pickSearchParam(sp, "sig"),
  };
}
