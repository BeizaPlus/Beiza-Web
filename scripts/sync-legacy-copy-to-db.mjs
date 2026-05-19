/**
 * One-off: align live site_settings, offerings, faqs with Creative Director PIVOT copy.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(root, ".env"), "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i), line.slice(i + 1)];
    }),
);

const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PRIVILEGED_KEY);

const faqUpdates = [
  ["af6a46ce-9778-4ae6-ba04-961da0297792", "What do I need to start preserving my family's legacy?"],
  ["c880783a-eb9a-47fe-971a-e00884deffe9", "When is the right time to start?"],
  ["4e884e7c-f81b-4607-b8d9-5a7804be1e43", "Can I use Beiza Legacy from outside Ghana?"],
  ["7e609db0-89a2-453d-b81f-8d60bd24da9b", "How long does the process take?"],
  ["7cf46945-4f90-4d38-919e-eaa3e40b6bde", "What kind of experiences do you create?"],
];

await sb
  .from("offerings")
  .update({
    title: "Legacy Galleries",
    description: "Curated imagery of the people you love",
  })
  .eq("id", "e5066a4d-dfbb-4be7-a8ca-7cdebd065bf6");

for (const [id, question] of faqUpdates) {
  const { error } = await sb.from("faqs").update({ question }).eq("id", id);
  console.log(error ? `FAIL ${id}: ${error.message}` : `OK faq: ${question}`);
}

console.log("Done.");
