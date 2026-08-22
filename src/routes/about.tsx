import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { HERO_IMAGES } from "@/lib/photos";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Mvassallophotography" },
      {
        name: "description",
        content:
          "Pitchside sports photographer covering football, athletics and combat sports across Malta and beyond.",
      },
      { property: "og:title", content: "About — Mvassallophotography" },
      {
        property: "og:description",
        content: "Pitchside sports photographer covering football, athletics and combat sports.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto grid max-w-7xl gap-12 px-5 pb-24 pt-32 lg:grid-cols-2 lg:items-center">
        <div>
          <h1 className="text-4xl sm:text-6xl">About</h1>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            I shoot sport the way it feels from the touchline: fast, loud and unforgiving.
            Long lenses, natural light and no staging — just the moment a match turns.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Clubs, academies, federations and families hire me for matchday coverage,
            player portraits and season-long archives. Every set is delivered edited and
            web-ready within 48 hours.
          </p>
          <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8">
            {[
              ["12+", "Seasons covered"],
              ["400k", "Frames shot"],
              ["48h", "Delivery"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="font-display text-3xl text-primary">{value}</dt>
                <dd className="mt-1 text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
          <Link
            to="/contact"
            className="mt-10 inline-block border border-primary px-7 py-3.5 text-[0.7rem] uppercase tracking-[0.3em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Book a shoot
          </Link>
        </div>
        <img
          src={HERO_IMAGES[2]}
          alt="Two players contesting a loose ball on a sunlit pitch"
          loading="lazy"
          className="frame-shadow w-full object-cover"
        />
      </main>
      <SiteFooter />
    </div>
  );
}