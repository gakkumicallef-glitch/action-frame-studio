import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Photo } from "@/lib/photos";

type Props = {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
};

export function Lightbox({ photos, index, onClose, onIndexChange }: Props) {
  const photo = photos[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndexChange((index + 1) % photos.length);
      if (e.key === "ArrowLeft") onIndexChange((index - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, photos.length, onClose, onIndexChange]);

  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/97 backdrop-blur-sm">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="min-w-0">
          <p className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
            {index + 1}/{photos.length}
          </p>
        </div>
        <button aria-label="Close" onClick={onClose} className="shrink-0 p-2 hover:text-primary">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-3 pb-10">
        <button
          aria-label="Previous image"
          onClick={() => onIndexChange((index - 1 + photos.length) % photos.length)}
          className="absolute left-2 z-10 rounded-full bg-card/70 p-3 hover:text-primary"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <img
          src={photo.image_url}
          alt={`${photo.category} sports photograph`}
          className="max-h-full max-w-full object-contain"
        />
        <button
          aria-label="Next image"
          onClick={() => onIndexChange((index + 1) % photos.length)}
          className="absolute right-2 z-10 rounded-full bg-card/70 p-3 hover:text-primary"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}