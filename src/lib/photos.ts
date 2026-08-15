import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import a1 from "@/assets/shot-13-16-40.jpg.asset.json";
import a2 from "@/assets/shot-13-16-41.jpg.asset.json";
import a3 from "@/assets/shot-13-17-17.jpg.asset.json";
import a4 from "@/assets/shot-13-17-22.jpg.asset.json";
import a5 from "@/assets/shot-13-17-22_1.jpg.asset.json";
import a6 from "@/assets/shot-13-17-23.jpg.asset.json";
import a7 from "@/assets/shot-13-17-23_1.jpg.asset.json";
import a8 from "@/assets/shot-13-17-30.jpg.asset.json";

export const CATEGORIES = [
  "Football",
  "Basketball",
  "Track",
  "Combat Sports",
  "Athletics",
] as const;

export type Photo = {
  id: string;
  title: string;
  category: string;
  tags: string[];
  image_url: string;
  storage_path: string | null;
  sort_order: number;
};

const seed = (
  id: string,
  url: string,
  title: string,
  tags: string[],
  order: number,
): Photo => ({
  id,
  title,
  category: "Football",
  tags,
  image_url: url,
  storage_path: null,
  sort_order: order,
});

export const DEFAULT_PHOTOS: Photo[] = [
  seed("d1", a3.url, "Breakaway", ["duel", "sprint"], 0),
  seed("d2", a2.url, "Counter Attack", ["team", "pace"], 1),
  seed("d3", a8.url, "Shoulder to Shoulder", ["duel"], 2),
  seed("d4", a6.url, "Eyes on the Ball", ["control"], 3),
  seed("d5", a1.url, "Number Seven", ["captain"], 4),
  seed("d6", a5.url, "Reset", ["midfield"], 5),
  seed("d7", a4.url, "The Walk Back", ["portrait"], 6),
  seed("d8", a7.url, "Alone in the Box", ["wide"], 7),
];

export const HERO_IMAGES = [a3.url, a2.url, a8.url, a6.url, a1.url];

export async function fetchPhotos(): Promise<Photo[]> {
  const { data, error } = await supabase
    .from("photos")
    .select("id, title, category, tags, image_url, storage_path, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  const rows = (data ?? []) as Photo[];
  if (rows.length === 0) return DEFAULT_PHOTOS;

  const paths = rows.map((r) => r.storage_path).filter(Boolean) as string[];
  if (paths.length === 0) return rows;

  const { data: signed } = await supabase.storage
    .from("photos")
    .createSignedUrls(paths, 60 * 60 * 24 * 7);
  const map = new Map((signed ?? []).map((s) => [s.path ?? "", s.signedUrl]));

  return rows.map((r) =>
    r.storage_path && map.get(r.storage_path)
      ? { ...r, image_url: map.get(r.storage_path)! }
      : r,
  );
}

export function usePhotos() {
  return useQuery({
    queryKey: ["photos"],
    queryFn: fetchPhotos,
    initialData: DEFAULT_PHOTOS,
  });
}