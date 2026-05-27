/** Split hero title into two balanced lines for cinematic stacked headline. */
export function splitHeroHeadline(title: string): [string, string] {
  const trimmed = title.trim();
  if (!trimmed) return ["", ""];

  const normalized = trimmed.replace(/\s+/g, " ");
  if (/^build intentional legacy$/i.test(normalized)) {
    return ["Build Intentional", "Legacy"];
  }
  if (/^this is where you come from\.?$/i.test(normalized)) {
    return ["This is where", "you come from."];
  }

  const words = normalized.split(" ");
  if (words.length <= 2) return [normalized, ""];

  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}
