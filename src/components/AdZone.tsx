import { useEffect, useState } from "react";
import { useAds, type Ad } from "@/hooks/usePublicContent";
import { cn } from "@/lib/utils";

type AdZoneProps = {
  placement: string;
  className?: string;
};

export const AdZone = ({ placement, className }: AdZoneProps) => {
  const { data: ads = [] } = useAds(placement);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

  useEffect(() => {
    if (ads.length > 0)
    {
      // Randomly select an ad from the active ones
      const randomIndex = Math.floor(Math.random() * ads.length);
      setSelectedAd(ads[randomIndex]);
    }
  }, [ads]);

  if (!selectedAd)
  {
    return null;
  }

  return (
    <div className={cn("w-full overflow-hidden rounded-sm border border-border bg-card", className)}>
      <a
        href={selectedAd.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group block relative"
      >
        <div className="relative aspect-[4/1] w-full overflow-hidden sm:aspect-[5/1] md:aspect-[6/1] lg:aspect-[8/1]">
          <img
            src={selectedAd.imageUrl}
            alt={selectedAd.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
          <div className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-sm">
            Ad
          </div>
        </div>
      </a>
    </div>
  );
};
