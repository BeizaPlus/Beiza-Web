/** Copy studio JSON — clipboard API with textarea fallback (localhost / permissions). */
export async function copyStudioText(text: string): Promise<{ ok: boolean; method: "clipboard" | "fallback" | "none" }> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return { ok: true, method: "clipboard" };
    } catch {
      /* fall through */
    }
  }

  if (typeof document === "undefined") return { ok: false, method: "none" };

  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  ta.style.top = "0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  ta.setSelectionRange(0, text.length);

  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(ta);
  return { ok, method: ok ? "fallback" : "none" };
}
