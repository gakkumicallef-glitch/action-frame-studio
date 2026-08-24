import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { preloadImages, type Photo } from "@/lib/photos";

type Props = {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
};

export function Lightbox({ photos, index, onClose, onIndexChange }: Props) {
  const photo = photos[index];
  const [zoomed, setZoomed] = useState(false);

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

  useEffect(() => {
    const n = photos.length;
    if (n < 2) return;
    preloadImages([
      photos[(index + 1) % n]?.image_url ?? "",
      photos[(index - 1 + n) % n]?.image_url ?? "",
    ]);
  }, [index, photos]);

  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/97 backdrop-blur-sm">
      <TransformWrapper
        key={photo.id}
        minScale={1}
        maxScale={6}
        centerOnInit
        doubleClick={{ mode: "toggle", step: 1.6 }}
        wheel={{ step: 0.12 }}
        pinch={{ step: 5 }}
        limitToBounds
        onTransform={(ref) => setZoomed(ref.state.scale > 1.01)}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4">
              <p className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
                {index + 1}/{photos.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  aria-label="Zoom out"
                  onClick={() => zoomOut()}
                  className="p-2 text-muted-foreground hover:text-primary"
                >
                  <ZoomOut className="h-5 w-5" />
                </button>
                <button
                  aria-label="Zoom in"
                  onClick={() => zoomIn()}
                  className="p-2 text-muted-foreground hover:text-primary"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
                <button
                  aria-label="Fit to screen"
                  onClick={() => resetTransform()}
                  className="p-2 text-muted-foreground hover:text-primary"
                >
                  <Maximize2 className="h-5 w-5" />
                </button>
                <button
                  aria-label="Close"
                  onClick={onClose}
                  className="p-2 hover:text-primary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-6 sm:px-3 sm:pb-10">
              {photos.length > 1 && (
                <button
                  aria-label="Previous image"
                  onClick={() => onIndexChange((index - 1 + photos.length) % photos.length)}
                  className="absolute left-2 z-10 rounded-full bg-card/70 p-2.5 hover:text-primary sm:p-3"
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              )}

              <TransformComponent
                wrapperClass="!h-full !w-full"
                contentClass="!h-full !w-full flex items-center justify-center"
              >
                <img
                  src={photo.image_url}
                  alt={`${photo.category} sports photograph`}
                  decoding="async"
                  fetchPriority="high"
                  draggable={false}
                  className={`max-h-[80svh] max-w-full object-contain sm:max-h-[85svh] ${
                    zoomed ? "cursor-grab" : "cursor-zoom-in"
                  }`}
                />
              </TransformComponent>

              {photos.length > 1 && (
                <button
                  aria-label="Next image"
                  onClick={() => onIndexChange((index + 1) % photos.length)}
                  className="absolute right-2 z-10 rounded-full bg-card/70 p-2.5 hover:text-primary sm:p-3"
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              )}
            </div>

            <p className="pb-4 text-center text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground">
              Scroll or pinch to zoom · double-tap to fit
            </p>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
