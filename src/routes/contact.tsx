import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — VersaSport Photography" },
      {
        name: "description",
        content: "Book matchday coverage, player portraits or a season archive.",
      },
      { property: "og:title", content: "Contact — VersaSport Photography" },
      {
        property: "og:description",
        content: "Book matchday sports photography coverage.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-32">
        <h1 className="text-4xl sm:text-6xl">Contact</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Matchday coverage, portraits, tournaments. Tell me the fixture and the date.
        </p>

        <form
          className="mt-10 grid gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
            toast.success("Message ready — I'll be in touch shortly.");
          }}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <input
              required
              placeholder="Name"
              className="border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <input
              required
              type="email"
              placeholder="Email"
              className="border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <input
            placeholder="Sport / event"
            className="border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <textarea
            required
            rows={5}
            placeholder="Details"
            className="border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="justify-self-start border border-primary bg-primary px-7 py-3.5 text-[0.7rem] uppercase tracking-[0.3em] text-primary-foreground transition-colors hover:bg-transparent hover:text-primary"
          >
            {sent ? "Sent" : "Send enquiry"}
          </button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}