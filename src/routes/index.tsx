import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { RequireAuth, useAuth } from "@/lib/auth";
import { fetchContent, fetchMyReactions } from "@/lib/content";
import { ContentCard } from "@/components/ContentCard";
import { StoriesRail } from "@/components/Stories";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home · SAC Community" },
      { name: "description", content: "Your SAC Community feed: posts, reels, tweets, business events, tickets and news." },
      { property: "og:title", content: "SAC Community" },
      { property: "og:description", content: "Share, connect and discover local businesses on SAC Community." },
    ],
  }),
  component: () => <RequireAuth><Feed /></RequireAuth>,
});

const FEED_TYPES = ["post", "reel", "tweet", "event", "ticket", "news"];

export function useReactions() {
  const { userId } = useAuth();
  return useQuery({ queryKey: ["reactions", userId], queryFn: () => fetchMyReactions(userId) });
}

function Feed() {
  const { data, isLoading, error } = useQuery({ queryKey: ["feed"], queryFn: () => fetchContent({ types: FEED_TYPES }) });
  const { data: r } = useReactions();
  return (
    <div className="relative mx-auto max-w-2xl px-2 pt-4 sm:px-5">
      <aside className="pointer-events-none fixed left-1 top-32 z-30 w-[68px] sm:left-3 sm:top-24 sm:w-20">
        <div className="pointer-events-auto rounded-full bg-background/40 py-2 backdrop-blur-md">
          <StoriesRail />
        </div>
      </aside>
      <section className="min-w-0 space-y-5 pb-16">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-72 animate-pulse rounded-2xl bg-card" />)}
        {error && <p className="rounded-xl bg-destructive/15 p-4 text-sm">Couldn't load the feed. {(error as Error).message}</p>}
        {data && data.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <h2 className="text-2xl font-black">Your feed is empty</h2>
            <p className="mt-2 text-muted-foreground">Share your first post or explore the community.</p>
            <div className="mt-5 flex justify-center gap-2">
              <Link to="/create" search={{ type: "post" }} className="rounded-full bg-gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground">Create post</Link>
              <Link to="/explore" className="rounded-full border border-border px-5 py-2 text-sm">Explore</Link>
            </div>
          </div>
        )}
        {r && data?.map((c) => <ContentCard key={c.id} c={c} liked={r.liked.has(c.id)} saved={r.saved.has(c.id)} />)}
      </section>
    </div>
  );
}
