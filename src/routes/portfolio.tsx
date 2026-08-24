import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Lightbox } from "@/components/Lightbox";
import { useAlbums, usePhotos } from "@/lib/photos";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Mvassallophotography" },
      {
        name: "description",
        content:
          "Sports photography galleries by category: football, basketball, track, combat sports and athletics.",
      },
      { property: "og:title", content: "Portfolio — Mvassallophotography" },
      {
        property: "og:description",
        content: "Browse action sports galleries by category.",
      },
    ],
  }),
  component: Portfolio,
});

function Portfolio() {
  const { data, isLoading } = usePhotos();
  const { data: albumData } = useAlbums();
  const photos = useMemo(() => data ?? [], [data]);
  const albums = useMemo(() => albumData ?? [], [albumData]);
  const [filter, setFilter] = useState("All");
  const [album, setAlbum] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(photos.map((p) => p.category)))],
    [photos],
  );
  const visible = useMemo(
    () =>
      photos
        .filter((p) => (filter === "All" ? true : p.category === filter))
        .filter((p) => (album === null || album === "all" ? true : p.album_id === album)),
    [photos, filter, album],
  );
  const activeAlbum = albums.find((a) => a.id === album);
  const showAlbumIndex = album === null && albums.length > 0;

  const albumCards = useMemo(
    () =>
      albums.map((a) => {
        const shots = photos.filter((p) => p.album_id === a.id);
        return { ...a, cover: shots[0]?.image_url ?? null, count: shots.length };
      }),
    [albums, photos],
  );

  return (
    <div className="min-h-screen">
      <SiteNav />

      <main className="mx-auto max-w-7xl px-5 pb-24 pt-32">
        <h1 className="text-4xl sm:text-6xl">
          {activeAlbum ? activeAlbum.name : "Portfolio"}
        </h1>
        <p className="mt-3 max-w-lg text-sm text-muted-foreground">
          {activeAlbum?.caption ||
            (showAlbumIndex
              ? "Pick an album to open the full set of frames from that game."
              : "Every frame shot on assignment. Click any image for the full-screen view — use the arrow keys to move through the set.")}
        </p>

        {albums.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            <button
              onClick={() => setAlbum(null)}
              className={`border px-4 py-2 text-[0.65rem] uppercase tracking-[0.25em] transition-colors ${
                album === null
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              Albums
            </button>
            <button
              onClick={() => setAlbum("all")}
              className={`border px-4 py-2 text-[0.65rem] uppercase tracking-[0.25em] transition-colors ${
                album === "all"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              All photos
            </button>
          </div>
        )}

        {showAlbumIndex ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {albumCards.map((a) => (
              <button
                key={a.id}
                onClick={() => setAlbum(a.id)}
                className="group block text-left frame-shadow"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-card">
                  {a.cover ? (
                    <img
                      src={a.cover}
                      alt={a.name}
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <span className="text-lg uppercase tracking-wide">{a.name}</span>
                  <span className="shrink-0 text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground">
                    {a.count} {a.count === 1 ? "photo" : "photos"}
                  </span>
                </div>
                {a.caption && (
                  <p className="mt-1 text-sm text-muted-foreground">{a.caption}</p>
                )}
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap gap-2">
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

            {isLoading ? (
              <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-64 w-full animate-pulse break-inside-avoid bg-card"
                  />
                ))}
              </div>
            ) : (
              <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
                {visible.map((photo, i) => (
                  <button
                    key={photo.id}
                    onClick={() => setOpen(i)}
                    className="group relative block w-full overflow-hidden break-inside-avoid frame-shadow"
                  >
                    <img
                      src={photo.image_url}
                      alt={`${photo.category} sports photograph`}
                      loading={i < 6 ? "eager" : "lazy"}
                      decoding="async"
                      {...(i < 3 ? { fetchPriority: "high" as const } : {})}
                      className="w-full transition-transform duration-700 group-hover:scale-105"
                    />
                  </button>
                ))}
              </div>
            )}

            {!isLoading && visible.length === 0 && (
              <p className="mt-16 text-sm text-muted-foreground">
                No images in this category yet.
              </p>
            )}
          </>
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