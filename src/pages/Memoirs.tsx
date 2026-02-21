import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";

import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { CTAButton } from "@/components/framer/CTAButton";
import { SectionHeader } from "@/components/framer/SectionHeader";
import { TributeStack } from "@/components/framer/TributeStack";
import { UnifiedTimeline } from "@/components/memoir/UnifiedTimeline";
import { SingleImageDialog } from "@/components/SingleImageDialog";
import { TributeFormDialog } from "@/components/tribute/TributeFormDialog";
import {
  useMemoirDetail,
  useMemoirHighlightPages,
  useMemoirSummaries,
  useMemoirTributePages,
} from "@/hooks/useMemoirs";
import { useMemoirTimeline } from "@/hooks/useMemoirTimeline";
import type { MemoirSummary, MemoirHighlight } from "@/types/memoir";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ProductsPanel } from "@/components/shopify/ProductsPanel";

const CTA_LABEL = "Commission a memoir";
const CTA_HREF = "/contact";

const formatDisplayDate = (value?: string) => {
  if (!value) return undefined;
  try
  {
    return format(new Date(value), "dd MMM yyyy");
  } catch (error)
  {
    return undefined;
  }
};

const MemoirCard = ({ memoir }: { memoir: MemoirSummary }) => {
  const publishedOn = formatDisplayDate(memoir.lastPublishedAt);
  const showLiveBadge = memoir.liveStreamActive;

  return (
    <Link to={`/memoirs/${memoir.slug}`} className="group block" aria-label={`Open memoir: ${memoir.title}`}>
      <article className="glass-panel flex h-full flex-col overflow-hidden rounded-lg border border-white/10 transition-transform duration-300 group-hover:-translate-y-1">
        {memoir.heroMedia?.src ? (
          <div className="relative h-64 overflow-hidden">
            <img
              src={memoir.heroMedia.src}
              alt={memoir.heroMedia.alt ?? memoir.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {showLiveBadge ? (
              <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-[#ff3b30] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg">
                Live
              </span>
            ) : null}
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center bg-muted text-muted-foreground">
            <span className="text-sm uppercase tracking-[0.3em]">Memoir</span>
          </div>
        )}
        <div className="flex flex-1 flex-col gap-4 p-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-subtle">Tribute Memoir</p>
            <h3 className="text-xl font-semibold leading-tight text-white">{memoir.title}</h3>
            {memoir.subtitle ? (
              <p className="text-sm text-subtle leading-relaxed">{memoir.subtitle}</p>
            ) : null}
          </div>
          {memoir.summary ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{memoir.summary}</p>
          ) : null}
          <div className="mt-auto flex items-center justify-between text-sm text-subtle">
            <span className="inline-flex items-center gap-2 font-medium text-primary transition-colors group-hover:text-primary/80">
              View memoir
              <span aria-hidden>→</span>
            </span>
            {publishedOn ? (
              <span className="text-xs uppercase tracking-[0.3em]">Published {publishedOn}</span>
            ) : null}
          </div>
        </div>
      </article>
    </Link>
  );
};

const MemoirListView = ({
  memoirs,
  isLoading,
}: {
  memoirs: MemoirSummary[];
  isLoading: boolean;
}) => (
  <div className="min-h-screen bg-background text-foreground">
    <Navigation />
    <main className="flex flex-col pb-24 pt-4 lg:pb-32">
      <section className="mx-auto max-w-4xl px-6 py-8 lg:py-12">
        <SectionHeader
          eyebrow="Memoirs Library"
          title="Celebrating legacies in living colour"
          description="Explore immersive memoir experiences produced by our studio. Each story blends design, multimedia, and family collaboration."
          align="center"
        />
      </section>
      <section className="mx-auto w-full max-w-6xl px-6 py-8 lg:py-12">
        {isLoading && memoirs.length === 0 ? (
          <div className="glass-panel flex flex-col items-center justify-center gap-4 rounded-lg border border-white/10 p-16 text-center">
            <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
            <p className="max-w-md text-sm text-subtle">
              Fetching published memoirs. Please hold on as we load the stories.
            </p>
          </div>
        ) : null}
        {!isLoading && memoirs.length === 0 ? (
          <div className="glass-panel flex flex-col items-center justify-center gap-4 rounded-lg border border-white/10 p-16 text-center">
            <p className="text-lg font-semibold text-white">Memoirs are on the way</p>
            <p className="max-w-md text-sm text-subtle">
              We’re crafting tribute memoirs for our families. Check back soon or start a conversation with us.
            </p>
            <CTAButton to={CTA_HREF} label={CTA_LABEL} />
          </div>
        ) : null}
        {memoirs.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {memoirs.map((memoir) => (
              <MemoirCard key={memoir.id} memoir={memoir} />
            ))}
          </div>
        ) : null}
      </section>
    </main>
    <Footer />
  </div>
);

const ensureEmbedUrl = (url?: string, provided?: string) => {
  if (provided) return provided;
  if (!url) return undefined;

  const ytRegex =
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/))([A-Za-z0-9_-]{11})/;
  const match = url.match(ytRegex);
  if (match && match[1])
  {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return undefined;
};

const MemoirDetailView = ({ slug, memoirs }: { slug: string; memoirs: MemoirSummary[] }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const desiredTab = searchParams.get("tab") === "live" ? "live" : "story";
  const [activeTab, setActiveTab] = useState<"story" | "live">(desiredTab as "story" | "live");
  const desiredSubTab = searchParams.get("subtab") === "tributes" ? "tributes" : "gallery";
  const [activeSubTab, setActiveSubTab] = useState<"gallery" | "tributes">(desiredSubTab as "gallery" | "tributes");
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    alt: string;
    caption?: string;
  } | null>(null);

  // Content warning consent state - stored per memoir slug
  const [hasConsented, setHasConsented] = useState<boolean>(() => {
    if (typeof window !== "undefined" && slug)
    {
      return localStorage.getItem(`memoir-gallery-consent-${slug}`) === "true";
    }
    return false;
  });

  const {
    data: detail,
    isLoading: detailLoading,
    isError,
  } = useMemoirDetail(slug);
  const { entries, isLoading: timelineLoading } = useMemoirTimeline(slug);
  const summary = detail?.summary;
  const memoirId = summary?.id;

  // Only fetch highlights when gallery tab is active
  const shouldLoadHighlights = activeTab === "story" && activeSubTab === "gallery";
  const {
    data: highlightPages,
    isLoading: highlightsLoading,
    fetchNextPage: fetchNextHighlights,
    hasNextPage: hasMoreHighlights,
    isFetchingNextPage: fetchingMoreHighlights,
  } = useMemoirHighlightPages(memoirId, slug, 6, shouldLoadHighlights);

  // Only fetch tributes when tributes tab is active
  const shouldLoadTributes = activeTab === "story" && activeSubTab === "tributes";
  const {
    data: tributePages,
    isLoading: tributesLoading,
    fetchNextPage: fetchNextTributes,
    hasNextPage: hasMoreTributes,
    isFetchingNextPage: fetchingMoreTributes,
  } = useMemoirTributePages(memoirId, slug, 6, shouldLoadTributes);

  useEffect(() => {
    setActiveTab(desiredTab as "story" | "live");
  }, [desiredTab, slug]);

  useEffect(() => {
    setActiveSubTab(desiredSubTab as "gallery" | "tributes");
  }, [desiredSubTab, slug]);

  // Reset consent when switching to a different memoir
  useEffect(() => {
    if (slug && typeof window !== "undefined")
    {
      const consented = localStorage.getItem(`memoir-gallery-consent-${slug}`) === "true";
      setHasConsented(consented);
    }
  }, [slug]);

  const handleContentWarningConsent = () => {
    if (slug && typeof window !== "undefined")
    {
      localStorage.setItem(`memoir-gallery-consent-${slug}`, "true");
      setHasConsented(true);
    }
  };

  const handleTabChange = (value: string) => {
    if (value !== "story" && value !== "live") return;
    setActiveTab(value);
    const next = new URLSearchParams(searchParams);
    if (value === "story")
    {
      next.delete("tab");
      // Keep subtab when switching back to story
      if (activeSubTab === "tributes")
      {
        next.set("subtab", "tributes");
      } else
      {
        next.delete("subtab");
      }
    } else
    {
      next.set("tab", value);
      next.delete("subtab");
    }
    setSearchParams(next, { replace: true });
  };

  const handleSubTabChange = (value: string) => {
    if (value !== "gallery" && value !== "tributes") return;
    setActiveSubTab(value);
    const next = new URLSearchParams(searchParams);
    if (value === "gallery")
    {
      next.delete("subtab");
    } else
    {
      next.set("subtab", value);
    }
    setSearchParams(next, { replace: true });
  };

  const handleImageClick = (highlight: MemoirHighlight) => {
    setSelectedImage({
      src: highlight.media.src,
      alt: highlight.media.alt,
      caption: highlight.caption ?? undefined,
    });
  };

  const handleCloseImageDialog = () => {
    setSelectedImage(null);
  };

  const sections = detail?.sections ?? [];
  const pagedHighlights =
    highlightPages?.pages.flatMap((page: any) => (page?.items ?? [])) ?? [];
  // Only use fallback highlights if we haven't loaded paginated data yet and tab is active
  const highlights =
    pagedHighlights.length > 0
      ? pagedHighlights
      : shouldLoadHighlights
        ? detail?.highlights ?? []
        : [];
  const pagedTributes =
    tributePages?.pages.flatMap((page: any) => (page?.items ?? [])) ?? [];
  const tributes = pagedTributes;

  const tributeCards = useMemo(
    () =>
      tributes.map((tribute) => ({
        name: tribute.name,
        relationship: tribute.relationship ?? "Loved one",
        message: tribute.message,
      })),
    [tributes],
  );
  const publishedOn = formatDisplayDate(summary?.lastPublishedAt);
  const liveStream = detail?.liveStream;
  const embedUrl = useMemo(
    () => ensureEmbedUrl(liveStream?.url, liveStream?.embedUrl),
    [liveStream?.embedUrl, liveStream?.url]
  );

  if (!detail && !detailLoading)
  {
    if (isError)
    {
      return <Navigate to="/memoirs" replace />;
    }
    if (!detailLoading)
    {
      return <Navigate to="/memoirs" replace />;
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="flex flex-col pb-24 pt-4 lg:pb-32">
        <section className="mx-auto w-full max-w-6xl px-6">
          <SectionHeader
            eyebrow="Tribute Memoir"
            title={summary?.title ?? "Memoir"}
            description={summary?.subtitle ?? summary?.summary ?? undefined}
            align="center"
          />
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-12">
          <Tabs value={activeTab} onValueChange={handleTabChange} defaultValue={desiredTab}>
            <div className="flex justify-center">
              <TabsList className="glass-panel inline-flex gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs uppercase tracking-[0.3em] text-subtle">
                <TabsTrigger value="story" className="rounded-full px-5 py-2">
                  Story
                </TabsTrigger>
                <TabsTrigger value="live" className="rounded-full px-5 py-2">
                  Live
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="story">
              <div className="space-y-24">
                <section className="mx-auto max-w-5xl pt-12">
                  <div className="glass-panel rounded-[32px] border border-white/10 p-8 md:p-12">
                    {detailLoading && !summary ? (
                      <div className="space-y-6">
                        <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
                        <div className="h-4 w-full animate-pulse rounded-full bg-white/10" />
                        <div className="h-4 w-5/6 animate-pulse rounded-full bg-white/10" />
                        <div className="h-4 w-11/12 animate-pulse rounded-full bg-white/10" />
                      </div>
                    ) : (
                      <>
                        <div className="space-y-6 text-subtle">
                          {sections.map((section) => (
                            <div key={section.id} className="space-y-2">
                              {section.heading ? (
                                <h3 className="text-lg font-medium text-white">{section.heading}</h3>
                              ) : null}
                              <div
                                className="memoir-content prose prose-invert max-w-none text-base leading-relaxed md:text-lg"
                                dangerouslySetInnerHTML={{ __html: section.body }}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
                          <p className="text-xs uppercase tracking-[0.3em] text-subtle">
                            {publishedOn ? `Last updated ${publishedOn}` : "Continuously updated"}
                          </p>
                          {memoirId ? (
                            <TributeFormDialog memoirId={memoirId} memoirTitle={summary?.title} />
                          ) : null}
                        </div>
                      </>
                    )}
                  </div>
                </section>

                <section className="pt-12">
                  <SectionHeader
                    eyebrow="Timeline"
                    title={summary ? `Chapters of ${summary.title}` : "Memoir timeline"}
                    description={
                      summary?.summary ??
                      "Scroll through defining seasons — curated memories, voices, and locations that shaped this legacy."
                    }
                    align="center"
                  />
                  <div className="mt-12">
                    <UnifiedTimeline entries={entries} isLoading={timelineLoading} />
                  </div>
                </section>

                {/* Gallery and Tributes in nested tabs */}
                <section className="pt-12">
                  <Tabs value={activeSubTab} onValueChange={handleSubTabChange} defaultValue={desiredSubTab}>
                    <div className="flex justify-center mb-12">
                      <TabsList className="glass-panel inline-flex gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs uppercase tracking-[0.3em] text-subtle">
                        <TabsTrigger value="gallery" className="rounded-full px-5 py-2">
                          Gallery
                        </TabsTrigger>
                        <TabsTrigger value="tributes" className="rounded-full px-5 py-2">
                          Tributes
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="gallery">
                      <SectionHeader
                        eyebrow="Gallery"
                        title="Scenes from the celebration"
                        description="A glimpse into the performances, colours, and togetherness that honored this life."
                        align="center"
                      />
                      <div className="relative mt-12">
                        {/* Gallery Content */}
                        <div
                          className={
                            !hasConsented && shouldLoadHighlights && (highlightsLoading || highlights.length > 0)
                              ? "blur-md pointer-events-none select-none"
                              : ""
                          }
                        >
                          {shouldLoadHighlights && highlightsLoading && highlights.length === 0 ? (
                            <div className="grid gap-6 lg:grid-cols-3">
                              {Array.from({ length: 3 }).map((_, index) => (
                                <div
                                  key={index}
                                  className="glass-panel h-80 animate-pulse rounded-lg border border-white/10 bg-white/5"
                                />
                              ))}
                            </div>
                          ) : null}
                          {shouldLoadHighlights && highlights.length > 0 ? (
                            <>
                              <div className="grid gap-6 lg:grid-cols-3">
                                {highlights.map((highlight) => (
                                  <figure
                                    key={highlight.id}
                                    className="glass-panel overflow-hidden rounded-lg border border-white/10 cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                                    onClick={() => handleImageClick(highlight)}
                                  >
                                    <img
                                      src={highlight.media.src}
                                      alt={highlight.media.alt || summary?.title || "Memoir highlight"}
                                      className="h-80 w-full object-cover"
                                      loading="lazy"
                                    />
                                    {highlight.caption ? (
                                      <figcaption className="p-4 text-sm text-subtle">{highlight.caption}</figcaption>
                                    ) : null}
                                  </figure>
                                ))}
                              </div>
                              {hasMoreHighlights ? (
                                <div className="mt-8 flex justify-center">
                                  <Button
                                    variant="outline"
                                    className="rounded-full border-white/20 text-white hover:bg-white/10"
                                    onClick={() => fetchNextHighlights()}
                                    disabled={fetchingMoreHighlights}
                                  >
                                    {fetchingMoreHighlights ? "Loading images…" : "Load more images"}
                                  </Button>
                                </div>
                              ) : null}
                            </>
                          ) : !shouldLoadHighlights ? (
                            <div className="text-center text-subtle">
                              <p className="text-sm">Switch to the Gallery tab to view images.</p>
                            </div>
                          ) : highlights.length === 0 && !highlightsLoading ? (
                            <div className="text-center text-subtle">
                              <p className="text-sm">No gallery images available yet.</p>
                            </div>
                          ) : null}
                        </div>

                        {/* Content Warning Overlay */}
                        {!hasConsented && shouldLoadHighlights && (highlightsLoading || highlights.length > 0) ? (
                          <div className="absolute inset-0 z-10 flex items-center justify-center min-h-[400px]">
                            <div className="glass-panel mx-4 max-w-lg rounded-lg border border-white/20 bg-black/60 p-8 text-center backdrop-blur-md">
                              <div className="space-y-6">
                                <div className="space-y-2">
                                  <h3 className="text-2xl font-semibold text-white">Content Warning</h3>
                                  <p className="text-sm text-subtle leading-relaxed">
                                    This gallery may contain sensitive visual or emotional content related to memorial
                                    celebrations. Please be aware that some images may be emotionally impactful.
                                  </p>
                                </div>
                                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                                  <Button
                                    onClick={handleContentWarningConsent}
                                    className="rounded-full bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90"
                                  >
                                    I understand, show content
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => handleSubTabChange("tributes")}
                                    className="rounded-full border-white/20 px-6 py-2 text-white hover:bg-white/10"
                                  >
                                    View tributes instead
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </TabsContent>

                    <TabsContent value="tributes">
                      <SectionHeader
                        eyebrow="Tributes"
                        title="Messages from those they loved"
                        description="Voices of gratitude and remembrance shared during the celebration."
                        align="center"
                      />
                      {memoirId ? (
                        <div className="mt-8 flex justify-center">
                          <TributeFormDialog
                            memoirId={memoirId}
                            memoirTitle={summary?.title}
                          />
                        </div>
                      ) : null}
                      {shouldLoadTributes && tributesLoading && tributeCards.length === 0 ? (
                        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {Array.from({ length: 3 }).map((_, index) => (
                            <div
                              key={index}
                              className="glass-panel h-48 animate-pulse rounded-lg border border-white/10 bg-white/5"
                            />
                          ))}
                        </div>
                      ) : null}
                      {shouldLoadTributes && tributeCards.length > 0 ? (
                        <>
                          <TributeStack tributes={tributeCards} className="mt-12" />
                          {hasMoreTributes ? (
                            <div className="mt-8 flex justify-center">
                              <Button
                                variant="outline"
                                className="rounded-full border-white/20 text-white hover:bg-white/10"
                                onClick={() => fetchNextTributes()}
                                disabled={fetchingMoreTributes}
                              >
                                {fetchingMoreTributes ? "Loading tributes…" : "Load more tributes"}
                              </Button>
                            </div>
                          ) : null}
                        </>
                      ) : !shouldLoadTributes ? (
                        <div className="mt-12 text-center text-subtle">
                          <p className="text-sm">Switch to the Tributes tab to view messages.</p>
                        </div>
                      ) : tributeCards.length === 0 && !tributesLoading ? (
                        <div className="mt-12 text-center text-subtle">
                          <p className="text-sm">No tributes have been recorded yet.</p>
                        </div>
                      ) : null}
                    </TabsContent>
                  </Tabs>
                </section>
              </div>
            </TabsContent>

            <TabsContent value="live">
              <section className="pt-12">
                <div className="glass-panel rounded-[32px] border border-white/10 p-6 md:p-12">
                  {detailLoading && !liveStream ? (
                    <div className="space-y-6">
                      <div className="h-4 w-1/3 animate-pulse rounded-full bg-white/10" />
                      <div className="aspect-video w-full animate-pulse rounded-lg bg-white/5" />
                      <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/10" />
                    </div>
                  ) : liveStream && (embedUrl || liveStream.url) ? (
                    <div className="space-y-8">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-[#ff9f0a]">
                            {liveStream.isActive ? "Live now" : "Live stream"}
                          </p>
                          <h3 className="text-2xl font-semibold text-white">
                            {liveStream.title ?? summary?.title ?? "Celebration livestream"}
                          </h3>
                        </div>
                        {memoirId ? (
                          <TributeFormDialog memoirId={memoirId} memoirTitle={summary?.title} />
                        ) : null}
                      </div>
                      <div className="relative w-full overflow-hidden rounded-lg border border-white/10 bg-black">
                        {embedUrl ? (
                          <iframe
                            src={`${embedUrl}?rel=0&modestbranding=1`}
                            title={liveStream.title ?? summary?.title ?? "Memoir livestream"}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="aspect-video w-full"
                          />
                        ) : (
                          <a
                            href={liveStream.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex aspect-video w-full items-center justify-center text-sm text-primary underline"
                          >
                            Open live stream
                          </a>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed text-subtle">
                        Join the {summary?.title ?? "family"} broadcast to experience readings, performances, and
                        tributes as they unfold in real time.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 text-center">
                      <h3 className="text-xl font-semibold text-white">Live stream coming soon</h3>
                      <p className="text-sm text-subtle">
                        The production team will share a live stream link once the broadcast is confirmed. Check back
                        later or reach out to request an access notification.
                      </p>
                      <div className="flex justify-center">
                        <CTAButton to={CTA_HREF} label="Notify me" />
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </TabsContent>
          </Tabs>
        </section>

        {/* Products Panel for memoir-related products */}
        {memoirId && <ProductsPanel memoirId={memoirId} />}

        <div className="flex items-center justify-center gap-4 py-8">
          <Link
            to="/memoirs"
            className="button-pill text-black inline-flex items-center gap-2 text-sm font-medium text-subtle transition-colors hover:text-white outline outline-1 outline-white/10"
          >
            Back to memoirs
          </Link>
        </div>
      </main>
      <Footer />

      {/* Image Dialog */}
      {selectedImage && (
        <SingleImageDialog
          isOpen={!!selectedImage}
          onClose={handleCloseImageDialog}
          image={selectedImage}
        />
      )}
    </div>
  );
};

const Memoirs = () => {
  const { slug } = useParams<{ slug?: string }>();
  const {
    data: memoirs = [],
    isLoading: memoirsLoading,
  } = useMemoirSummaries();

  if (!slug)
  {
    return <MemoirListView memoirs={memoirs} isLoading={memoirsLoading} />;
  }

  return <MemoirDetailView slug={slug} memoirs={memoirs} />;
};

export default Memoirs;


