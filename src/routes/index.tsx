import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { preloadImages, useHeroImages } from "@/lib/photos";
import banner from "@/assets/mvassallo-banner.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mvassallophotography — Action Sports Photographer" },
      {
        name: "description",
        content:
          "High-energy sports photography: football, athletics, combat sports and more. Explore the galleries.",
      },
      { property: "og:title", content: "Mvassallophotography" },
      {
        property: "og:description",
        content: "High-energy action sports photography galleries.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { images } = useHeroImages();
  const [slide, setSlide] = useState(0);
  const imagesKey = images.join("|");

  useEffect(() => {
    setSlide(0);
    preloadImages(imagesKey.split("|"));
  }, [imagesKey]);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % images.length), 5200);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <div className="min-h-screen">
      <SiteNav />

      <section className="relative h-[100svh] w-full overflow-hidden">
        {images.map((src, i) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-[1400ms] ${
              i === slide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={src}
              alt=""
              aria-hidden="true"
              loading={i === 0 ? "eager" : "lazy"}
              className={`h-full w-full object-cover ${i === slide ? "animate-kenburns" : ""}`}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-24">
          <p className="animate-rise text-[0.65rem] uppercase tracking-[0.45em] text-primary">
            Action · Emotion · Motion
          </p>
          <h1 className="animate-rise mt-5 max-w-4xl text-5xl leading-[0.92] sm:text-7xl lg:text-8xl">
            Mvassallo
            <br />
            Photography
          </h1>
          <p className="animate-rise mt-6 max-w-md text-sm text-muted-foreground sm:text-base">
            Split-second frames from the pitch, the track and the ring — shot in full
            sun, full speed, full contact.
          </p>
          <div className="animate-rise mt-9">
            <Link
              to="/portfolio"
              className="group inline-flex items-center gap-3 border border-primary bg-primary px-7 py-3.5 text-[0.7rem] uppercase tracking-[0.3em] text-primary-foreground transition-colors hover:bg-transparent hover:text-primary"
            >
              View Galleries
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-12 flex gap-2">
            {images.map((src, i) => (
              <button
                key={src}
                aria-label={`Show slide ${i + 1}`}
                onClick={() => setSlide(i)}
                className={`h-[2px] w-10 transition-colors ${
                  i === slide ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border/40">
        <img
          src={banner}
          alt="Mvassallophotography — collage of matchday football photographs"
          loading="lazy"
          className="w-full object-cover"
        />
      </section>

      <SiteFooter />
    </div>
  );
}
