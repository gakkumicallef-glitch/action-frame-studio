import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MessageCircle } from "lucide-react";

import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { CONTACT, whatsappLink } from "@/lib/contact";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Booking — Mvassallophotography" },
      {
        name: "description",
        content:
          "Book matchday coverage, player portraits or a season archive with Mvassallophotography. Send your fixture details straight to WhatsApp.",
      },
      { property: "og:title", content: "Contact & Booking — Mvassallophotography" },
      {
        property: "og:description",
        content: "Book matchday sports photography coverage via WhatsApp or email.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [name, setName] = useState("");
  const [sport, setSport] = useState("");
  const [date, setDate] = useState("");
  const [details, setDetails] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const message = [
      `Hi Mvassallophotography, I'd like to book a shoot.`,
      ``,
      `Name: ${name}`,
      sport ? `Sport / event: ${sport}` : null,
      date ? `Date: ${date}` : null,
      ``,
      details,
    ]
      .filter((l) => l !== null)
      .join("\n");

    window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-32">
        <h1 className="text-4xl sm:text-6xl">Book a shoot</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Matchday coverage, portraits, tournaments. Fill this in and it sends straight
          to my WhatsApp.
        </p>

        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-y border-border py-5 text-sm">
          <a
            href={`mailto:${CONTACT.email}`}
            className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
          >
            <Mail className="h-4 w-4" />
            {CONTACT.email}
          </a>
          <a
            href={`tel:${CONTACT.phoneIntl}`}
            className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
          >
            <Phone className="h-4 w-4" />
            {CONTACT.phoneDisplay}
          </a>
        </div>

        <form className="mt-10 grid gap-5" onSubmit={submit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="Date (e.g. 14 Sept)"
              className="border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <input
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            placeholder="Sport / event"
            className="border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <textarea
            required
            rows={5}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Details — venue, kick-off time, what you need"
            className="border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-3 justify-self-start border border-primary bg-primary px-7 py-3.5 text-[0.7rem] uppercase tracking-[0.3em] text-primary-foreground transition-colors hover:bg-transparent hover:text-primary"
          >
            <MessageCircle className="h-4 w-4" />
            Send on WhatsApp
          </button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
