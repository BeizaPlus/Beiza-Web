import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemoirsList, useEventsAdmin, useTestimonialsAdmin } from "../hooks/useAdminData";

const statCardClasses = "bg-white/5 border border-white/10 backdrop-blur text-white";

const Dashboard = () => {
  const {
    data: memoirs = [],
    isLoading: memoirsLoading,
    isError: memoirsErrorState,
    error: memoirsError,
  } = useMemoirsList();
  const {
    data: events = [],
    isLoading: eventsLoading,
    isError: eventsErrorState,
    error: eventsError,
  } = useEventsAdmin();
  const {
    data: testimonials = [],
    isLoading: testimonialsLoading,
    isError: testimonialsErrorState,
    error: testimonialsError,
  } = useTestimonialsAdmin();

  const publishedMemoirs = memoirs.filter((memoir) => memoir.status === "published").length;
  const draftMemoirs = memoirs.filter((memoir) => memoir.status === "draft").length;
  const scheduledEvents = events.filter((event) => event.occurs_on && new Date(event.occurs_on) >= new Date()).length;
  const publishedTestimonials = testimonials.filter((testimonial) => testimonial.is_published).length;

  const errors = [
    memoirsErrorState && memoirsError ? `Memoirs — ${memoirsError.message}` : null,
    eventsErrorState && eventsError ? `Events — ${eventsError.message}` : null,
    testimonialsErrorState && testimonialsError ? `Testimonials — ${testimonialsError.message}` : null,
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Manager Overview</h1>
        <p className="text-sm text-white/70">
          Track the health of memoir timelines, events, and testimonials scheduled across the public site.
        </p>
      </header>

      {errors.length > 0 ? (
        <Card className="border-rose-400/40 bg-rose-500/10 text-rose-100">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-200">Data issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {errors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className={statCardClasses}>
          <CardHeader>
            <CardTitle className="text-sm text-white/60">Published Memoirs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{memoirsLoading ? "…" : publishedMemoirs}</p>
            <p className="text-xs text-white/60">Memoirs visible on the public site</p>
          </CardContent>
        </Card>

        <Card className={statCardClasses}>
          <CardHeader>
            <CardTitle className="text-sm text-white/60">Draft Memoirs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{memoirsLoading ? "…" : draftMemoirs}</p>
            <p className="text-xs text-white/60">Stories awaiting review</p>
          </CardContent>
        </Card>

        <Card className={statCardClasses}>
          <CardHeader>
            <CardTitle className="text-sm text-white/60">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{eventsLoading ? "…" : scheduledEvents}</p>
            <p className="text-xs text-white/60">Events scheduled in the future</p>
          </CardContent>
        </Card>

        <Card className={statCardClasses}>
          <CardHeader>
            <CardTitle className="text-sm text-white/60">Published Testimonials</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{testimonialsLoading ? "…" : publishedTestimonials}</p>
            <p className="text-xs text-white/60">Voices live across the site</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

