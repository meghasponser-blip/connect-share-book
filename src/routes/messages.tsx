import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/lib/auth";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages · SAC Community" }, { name: "description", content: "Your private messages." }, { property: "og:title", content: "Messages" }, { property: "og:description", content: "Your private messages." }] }),
  component: () => <RequireAuth><div className="mx-auto max-w-xl px-4 py-10 text-center"><h1 className="text-2xl font-black">Messages</h1><p className="mt-2 text-muted-foreground">Conversations are coming soon.</p></div></RequireAuth>,
});
