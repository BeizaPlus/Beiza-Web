# Beiza-Web — fixes log

Running list of bugs found, symptoms, root cause, and fix. **Check here before re-debugging the same issue.**

Related: `docs/SITE-SUMMARY.md`, `docs/LINK-MASTERSHEET.md`, `npm run smoke:site`

---

## How to use

| If you see… | Search this doc for… |
|-------------|----------------------|
| Blank `/legacy/*` page | `useLegacySession`, `signedInProp`, `hasSession` |
| Record station wrong after sign-in | `signedIn`, `hasSession`, `recordSignInShell` |
| Welcome studio sliders do nothing | `nudge`, `locale rail` |
| Mobile welcome won’t scroll naturally | `snap`, `scroll` |
| Smoke test false failures | `smoke` |

**Re-run checks:** `npm run smoke:site` · `npm run smoke:record` · `npm run links:check`

---

## 2026-05-22 — Legacy tab bar crash (blank legacy pages)

| | |
|--|--|
| **Symptom** | `/legacy`, `/legacy/vault`, `/legacy/family`, `/vault` → empty `#root`, console: `useLegacySession is not defined` |
| **Cause** | `LegacyTabBar.tsx` called `useLegacySession()` without importing it |
| **Fix** | `import { useLegacySession } from "@/hooks/useLegacy"` in `LegacyTabBar.tsx` |
| **Commit** | `7bdbfed` |

---

## 2026-05-22 — Record viewport crash (blank `/legacy/record`)

| | |
|--|--|
| **Symptom** | Entire record page white/empty; Playwright: `signedInProp is not defined` |
| **Cause** | `RecordStationViewport` used `signedInProp` in body but omitted from function destructuring |
| **Fix** | Add `signedIn: signedInProp = false` to props destructuring; pass `signedIn={signedIn}` from `LegacyLayout` |
| **Commit** | `0c2a7f2` (prop wiring); destructuring fix same session before `7bdbfed` |

---

## 2026-05-22 — Signed-in record station never mounted

| | |
|--|--|
| **Symptom** | After sign-in: hero + “Record a memory” still shown, mic not centered, station panel missing |
| **Cause** | `LegacyLayout` used undefined variable `hasSession` instead of `signedIn` for `station` prop |
| **Fix** | `station={signedIn ? <Outlet /> : null}` |
| **Commit** | `0c2a7f2` |

---

## 2026-05-22 — Welcome locale rail studio sliders inert

| | |
|--|--|
| **Symptom** | Language rail sliders (labels nudge, dot axis, sun axis ←/→) change numbers but UI does not move |
| **Cause** | Static rail rewrite (`71c759c`) saved values to store but dropped `nudgeStyle()` on label/dot/sun nodes |
| **Fix** | Re-wire `labelNudgeXRem`, `axisNudgeXRem`, `sunAxisNudgeXRem`, `sunAxisNudgeYRem`, `railNudgeXRem` in `WelcomeLocaleRail.tsx` |
| **Commit** | `0c2a7f2` |

**Note:** Rail nudge only obvious on **desktop (≥810px)**. Mobile bottom bar uses subset of nudges.

---

## 2026-05-22 — Welcome mobile scroll + card sizing

| | |
|--|--|
| **Symptom** | User wanted normal touch scroll, no scroll buttons; tune card size vs viewport |
| **Cause** | `snap-mandatory` felt like stepped navigation; no phone layout studio keys |
| **Fix** | Remove snap on phone; scroll on card column; studio section **Mobile cards (≤809px)** in `WelcomeGate.tsx`; disable locale wheel on phone |
| **Commit** | `0c2a7f2` |

---

## 2026-05-21 — Legacy tabs broken after sign-in

| | |
|--|--|
| **Symptom** | Tabs did not navigate to real legacy pages after session |
| **Cause** | Typo: `recordSignInShell` checked but variable defined as `recordStationShell` (always undefined → wrong branch) |
| **Fix** | Use consistent `recordSignInShell` |
| **Commit** | `c72954b` |

---

## 2026-05-21 — Record sign-in row under nav rail

| | |
|--|--|
| **Symptom** | Email field overlapped vertical legacy tab rail on desktop |
| **Cause** | `emailMaxWidthRem` too wide; insufficient right padding |
| **Fix** | Canonical `emailMaxWidthRem: 17.5`; desktop `pr` for rail; form stacks until 1280px |
| **Commit** | `245b7e7` |

---

## 2026-05-21 — Welcome locale labels clipped (CN / GH)

| | |
|--|--|
| **Symptom** | Flag + code clipped on vertical rail |
| **Cause** | Rail cluster width equaled sun button only (~62px) |
| **Fix** | `railClusterWidthPx` from flag + label + gap + dot; widen label column |
| **Commit** | `daa52a7` / rail work in `WelcomeLocaleRail.tsx` |

---

## Smoke test gotchas (not app bugs)

| Issue | Detail |
|-------|--------|
| Record hero selector | `capture-record-area-smoke.mjs` looks for `beiza-legacy-record*`; default locale **GH** uses `beiza-storyworth-record-hero-ghana-marmah.png` — update selector or pin locale |
| Site nav “Legacy” link | Header uses Vault · Circle · Blog — smoke expecting “Legacy” link fails on record overlay nav |
| Supabase in browser | Console warning: privileged key refused in browser — expected in dev |

---

## Commits on `main` (layout + fixes pass)

| Commit | Summary |
|--------|---------|
| `7bdbfed` | Site link smoke + `LegacyTabBar` import fix |
| `0c2a7f2` | Record `signedIn` / viewport / welcome mobile + rail nudges |
| `71c759c` | Welcome static locale rail (regression: nudges — fixed in `0c2a7f2`) |
| `c72954b` | Legacy tab routing after sign-in |
| `245b7e7` | Record CTA vs rail overlap |
| `669a6cc` | Deferred volume-slider design reference |

---

## Add new entries

When fixing a recurring issue, append:

```markdown
## YYYY-MM-DD — Short title

| | |
|--|--|
| **Symptom** | What the user saw |
| **Cause** | Root cause in one line |
| **Fix** | File(s) + what changed |
| **Commit** | `hash` |
```
