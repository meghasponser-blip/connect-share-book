import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RequireAuth } from "@/lib/auth";
import { fetchContent, TYPE_LABEL } from "@/lib/content";
import { AccountBadge, UserAvatar } from "@/components/UserAvatar";
import { ConnectButton } from "@/components/ConnectButton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/u/$username")({
  head: () => ({ meta: [{ title: "Profile · SAC Community" }, { name: "description", content: "A profile on SAC Community." }, { property: "og:title", content: "SAC Community profile" }, { property: "og:description", content: "A profile on SAC Community." }] }),
  component: () => <RequireAuth><Profile /></RequireAuth>,
});

function Profile() {
  const { username } = Route.useParams();
  const [tab, setTab] = useState("all");
  const { data: p } = useQuery({ queryKey: ["profile", username], queryFn: async () => (await supabase.from("profiles").select("*").eq("username", username).maybeSingle()).data });
  const { data: items = [] } = useQuery({ queryKey: ["profile-content", p?.id], enabled: !!p, queryFn: () => fetchContent({ authorId: p!.id, limit: 100 }) });
  const { data: count = 0 } = useQuery({ queryKey: ["connections-count", p?.id], enabled: !!p, queryFn: async () => (await supabase.from("connections").select("id", { count: "exact", head: true }).eq("status", "accepted").or(`requester_id.eq.${p!.id},addressee_id.eq.${p!.id}`)).count ?? 0 });
  if (!p) return <p className="p-10 text-center text-muted-foreground">Loading…</p>;
  const tabs = p.account_type === "business" ? ["all", "post", "reel", "tweet", "story", "event", "ticket", "news"] : ["all", "post", "reel", "tweet", "story"];
  const shown = tab === "all" ? items : items.filter((i) => i.type === tab);
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex flex-col items-center text-center">
        <UserAvatar src={p.avatar_url} name={p.display_name} size={96} />
        <h1 className="mt-3 text-2xl font-black">{p.display_name}</h1>
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">@{p.username}<AccountBadge type={p.account_type} /></div>
        <div className="mt-3 flex gap-6 text-sm"><span><b>{count}</b> Connections</span><span><b>{items.length}</b> Posts</span></div>
        {p.bio && <p className="mt-3 max-w-md text-sm">{p.bio}</p>}
        {p.website && <a href={p.website} target="_blank" rel="noreferrer" className="mt-1 text-sm text-primary">{p.website}</a>}
        <div className="mt-4"><ConnectButton otherId={p.id} size="default" /></div>
      </div>
      <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto border-b border-border">
        {tabs.map((t) => <button key={t} onClick={() => setTab(t)} className={cn("shrink-0 border-b-2 px-3 py-2 text-sm capitalize", tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground")}>{t === "all" ? "All" : TYPE_LABEL[t] + "s"}</button>)}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1">
        {shown.map((c) => (
          <Link key={c.id} to="/c/$id" params={{ id: c.id }} className="relative aspect-[3/4] overflow-hidden rounded bg-card">
            {c.media_kind === "video" ? <video src={c.media_url!} muted className="h-full w-full object-cover" /> : (c.media_url || c.cover_url) ? <img src={(c.media_url || c.cover_url)!} alt="" className="h-full w-full object-cover" /> : <p className="p-2 text-xs">{c.title}</p>}
            <span className="absolute left-1 top-1 rounded bg-background/80 px-1.5 text-[10px] text-primary">{TYPE_LABEL[c.type]}</span>
          </Link>
        ))}
      </div>
      {shown.length === 0 && <p className="py-10 text-center text-muted-foreground">Nothing here yet.</p>}
    </div>
  );
}
