import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Lightbox } from "@/components/Lightbox";
import { usePhotos } from "@/lib/photos";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — VersaSport Photography" },
      {
        name: "description",
        content:
          "Sports photography galleries by category: football, basketball, track, combat sports and athletics.",
      },
      { property: "og:title", content: "Portfolio — VersaSport Photography" },
      {
        property: "og:description",
        content: "Browse action sports galleries by category.",
      },
    ],
  }),
  component: Portfolio,
});

function Portfolio() {
  const { data: photos } = usePhotos();
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState<number | null>(null);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(photos.map((p) => p.category)))],
    [photos],
  );
  const visible = useMemo(
    () => (filter === "All" ? photos : photos.filter((p) => p.category === filter)),
    [photos, filter],
  );

  return (
    <div className="min-h-screen">
      <SiteNav />

      <main className="mx-auto max-w-7xl px-5 pb-24 pt-32">
        <h1 className="text-4xl sm:text-6xl">Portfolio</h1>
        <p className="mt-3 max-w-lg text-sm text-muted-foreground">
          Every frame shot on assignment. Click any image for the full-screen view — use
          the arrow keys to move through the set.
        </p>

        <div className="mt-10 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`border px-4 py-2 text-[0.65rem] uppercase tracking-[0.25em] transition-colors ${
                filter === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {visible.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => setOpen(i)}
              className="group relative block w-full overflow-hidden break-inside-avoid frame-shadow"
            >
              <img
                src={photo.image_url}
                alt={photo.title || `${photo.category} sports photograph`}
                loading="lazy"
                decoding="async"
                className="w-full transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-background/90 to-transparent p-4 text-left opacity-0 transition-opacity group-hover:opacity-100">
                <span className="min-w-0 truncate text-sm">{photo.title || "Untitled"}</span>
                <span className="shrink-0 text-[0.6rem] uppercase tracking-[0.25em] text-primary">
                  {photo.category}
                </span>
              </span>
            </button>
          ))}
        </div>

        {visible.length === 0 && (
          <p className="mt-16 text-sm text-muted-foreground">No images in this category yet.</p>
        )}
      </main>

      {open !== null && (
        <Lightbox
          photos={visible}
          index={open}
          onClose={() => setOpen(null)}
          onIndexChange={setOpen}
        />
      )}

      <SiteFooter />
    </div>
  );
}