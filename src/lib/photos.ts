import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { signPhotoUrls } from "@/lib/r2.functions";

import a1 from "@/assets/shot-13-16-40.jpg";
import a2 from "@/assets/shot-13-16-41.jpg";
import a3 from "@/assets/shot-13-17-17.jpg";
import a4 from "@/assets/shot-13-17-22.jpg";
import a5 from "@/assets/shot-13-17-22_1.jpg";
import a6 from "@/assets/shot-13-17-23.jpg";
import a7 from "@/assets/shot-13-17-23_1.jpg";
import a8 from "@/assets/shot-13-17-30.jpg";

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
  album_id: string | null;
  is_hero: boolean;
};

export type Album = {
  id: string;
  name: string;
  caption: string;
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
  album_id: null,
  is_hero: true,
});

export const DEFAULT_PHOTOS: Photo[] = [
  seed("d1", a3, "Breakaway", ["duel", "sprint"], 0),
  seed("d2", a2, "Counter Attack", ["team", "pace"], 1),
  seed("d3", a8, "Shoulder to Shoulder", ["duel"], 2),
  seed("d4", a6, "Eyes on the Ball", ["control"], 3),
  seed("d5", a1, "Number Seven", ["captain"], 4),
  seed("d6", a5, "Reset", ["midfield"], 5),
  seed("d7", a4, "The Walk Back", ["portrait"], 6),
  seed("d8", a7, "Alone in the Box", ["wide"], 7),
];

export const HERO_IMAGES = [a3, a2, a8, a6, a1];

const SELECT =
  "id, title, category, tags, image_url, storage_path, sort_order, album_id, is_hero";

export async function fetchPhotos(): Promise<Photo[]> {
  const { data, error } = await supabase
    .from("photos")
    .select(SELECT)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  const rows = (data ?? []) as Photo[];
  if (rows.length === 0) return DEFAULT_PHOTOS;

  const paths = rows.map((r) => r.storage_path).filter(Boolean) as string[];
  if (paths.length === 0) return rows;

  let map = new Map<string, string>();
  try {
    const signed = await signPhotoUrls({ data: { keys: paths } });
    map = new Map(Object.entries(signed));
  } catch {
    map = new Map();
  }

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
  });
}

export async function fetchAlbums(): Promise<Album[]> {
  const { data, error } = await supabase
    .from("albums")
    .select("id, name, caption, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Album[];
}

export function useAlbums() {
  return useQuery({ queryKey: ["albums"], queryFn: fetchAlbums });
}

export function useHeroImages() {
  const { data, isLoading } = usePhotos();
  const heroes = (data ?? []).filter((p) => p.is_hero && p.image_url);
  const images = heroes.length > 0 ? heroes.map((p) => p.image_url) : HERO_IMAGES;
  return { images, isLoading };
}