import reels from "../src/data/chloe-vs-history-reels.json" with { type: "json" };

const results = [];
for (const reel of reels) {
  const row = { shortCode: reel.shortCode, poster: null, video: null };
  for (const [kind, url] of [
    ["poster", reel.poster],
    ["video", reel.videoSrc],
  ]) {
    if (!url) {
      row[kind] = "missing";
      continue;
    }
    try {
      const res = await fetch(url, { method: "HEAD", redirect: "follow" });
      row[kind] = res.ok ? res.status : `HTTP ${res.status}`;
    } catch (e) {
      row[kind] = `ERR ${e.message}`;
    }
  }
  results.push(row);
}
console.log(JSON.stringify(results, null, 2));
const posterOk = results.filter((r) => r.poster === 200).length;
const videoOk = results.filter((r) => r.video === 200).length;
console.log(`\nSummary: posters ${posterOk}/${results.length}, videos ${videoOk}/${results.length}`);
