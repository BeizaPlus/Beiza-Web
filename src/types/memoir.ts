export type MemoirTimelineMedia = {
  src: string;
  alt: string;
  placeholder?: string;
};

export type MemoirTimelineEntry = {
  id: string;
  memoirId: string;
  eraLabel?: string;
  title: string;
  excerpt: string;
  storyUrl?: string;
  timestamp: string;
  endTimestamp?: string;
  location?: string;
  tags?: string[];
  participants?: string[];
  image: MemoirTimelineMedia;
  audioClipUrl?: string;
  isPublished: boolean;
  displayOrder: number;
};

export type MemoirSummary = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  summary?: string;
  heroMedia?: MemoirTimelineMedia | null;
  lastPublishedAt?: string;
  liveStreamActive?: boolean;
  liveStreamUrl?: string;
};

export type MemoirSection = {
  id: string;
  sectionType: string;
  heading?: string | null;
  body: string;
  displayOrder: number;
};

export type MemoirHighlight = {
  id: string;
  media: MemoirTimelineMedia;
  caption?: string | null;
  displayOrder: number;
  updatedAt?: string | null;
};

export type MemoirTimelineEra = {
  label: string;
  startDate: string;
  endDate?: string;
};

export type MemoirLiveStream = {
  platform?: string;
  title?: string;
  url?: string;
  embedUrl?: string;
  isActive?: boolean;
};

export type MemoirDetail = {
  summary: MemoirSummary;
  sections: MemoirSection[];
  highlights: MemoirHighlight[];
  liveStream?: MemoirLiveStream;
};

export type MemoirTribute = {
  id: string;
  name: string;
  relationship?: string | null;
  message: string;
  displayOrder: number;
};


