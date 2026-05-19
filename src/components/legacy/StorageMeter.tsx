type StorageMeterProps = {
  usedSeconds: number;
  limitSeconds?: number;
};

export function StorageMeter({
  usedSeconds,
  limitSeconds = 3600,
}: StorageMeterProps) {
  const pct = Math.min(100, Math.round((usedSeconds / limitSeconds) * 100));
  const usedMin = Math.floor(usedSeconds / 60);
  const limitMin = Math.floor(limitSeconds / 60);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Legacy storage</span>
        <span className="font-medium text-foreground">
          {usedMin} / {limitMin} min
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Keep their voice forever — room for more memories.
      </p>
    </div>
  );
}
