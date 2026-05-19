/** Circle tier: no max recording duration — vault storage is the only cap. */
export const FREE_VAULT_STORAGE_BYTES = 5 * 1024 * 1024 * 1024;

export function getAudioDurationFromBlob(blob: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const audio = document.createElement("audio");
    audio.preload = "metadata";

    const cleanup = () => {
      URL.revokeObjectURL(url);
      audio.removeAttribute("src");
      audio.load();
    };

    audio.addEventListener(
      "loadedmetadata",
      () => {
        const d = audio.duration;
        cleanup();
        if (!Number.isFinite(d) || d <= 0) {
          reject(new Error("Could not read recording duration."));
          return;
        }
        resolve(Math.max(1, Math.round(d)));
      },
      { once: true },
    );

    audio.addEventListener(
      "error",
      () => {
        cleanup();
        reject(new Error("Could not decode recording."));
      },
      { once: true },
    );

    audio.src = url;
  });
}

export function extensionForMime(mime: string): string {
  if (mime.includes("mp4") || mime.includes("m4a")) return "m4a";
  if (mime.includes("ogg")) return "ogg";
  return "webm";
}
