import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Loader2, Trash2, Upload } from "lucide-react";

import { SiteNav } from "@/components/SiteNav";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/compress";
import { CATEGORIES, fetchPhotos, type Photo } from "@/lib/photos";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin — VersaSport Photography" },
      { name: "description", content: "Private gallery management area." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin — VersaSport Photography" },
      { property: "og:description", content: "Private gallery management area." },
    ],
  }),
  component: Admin,
});

function Admin() {
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-5 pb-24 pt-32">
        {!ready ? null : userId ? <Manager /> : <SignIn />}
      </main>
    </div>
  );
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/admin` },
          });
    setBusy(false);
    if (res.error) return toast.error(res.error.message);
    if (mode === "up" && !res.data.session)
      toast.success("Check your email to confirm the account.");
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-3xl">Admin</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in to manage the galleries.
      </p>
      <form onSubmit={submit} className="mt-8 grid gap-4">
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <button
          disabled={busy}
          className="border border-primary bg-primary px-7 py-3.5 text-[0.7rem] uppercase tracking-[0.3em] text-primary-foreground disabled:opacity-50"
        >
          {busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}
        </button>
      </form>
      <button
        onClick={() => setMode(mode === "in" ? "up" : "in")}
        className="mt-4 text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground hover:text-primary"
      >
        {mode === "in" ? "Create an account" : "I already have an account"}
      </button>
    </div>
  );
}

function Manager() {
  const qc = useQueryClient();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("photos")
      .select("id, title, category, tags, image_url, storage_path, sort_order")
      .order("sort_order", { ascending: true });
    setPhotos((data ?? []) as Photo[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = async () => {
    await load();
    await qc.invalidateQueries({ queryKey: ["photos"] });
    void fetchPhotos;
  };

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    let ok = 0;
    for (const file of Array.from(files)) {
      try {
        const compressed = await compressImage(file);
        const path = `${crypto.randomUUID()}.jpg`;
        const { error: upErr } = await supabase.storage
          .from("photos")
          .upload(path, compressed, { contentType: "image/jpeg" });
        if (upErr) throw upErr;
        const { error: dbErr } = await supabase.from("photos").insert({
          title: file.name.replace(/\.[^.]+$/, ""),
          category,
          image_url: "",
          storage_path: path,
          sort_order: photos.length + ok,
        });
        if (dbErr) throw dbErr;
        ok++;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      }
    }
    setUploading(false);
    if (ok) toast.success(`${ok} image${ok > 1 ? "s" : ""} uploaded`);
    await refresh();
  }

  async function update(id: string, patch: Partial<Photo>) {
    const { error } = await supabase.from("photos").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    await refresh();
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= photos.length) return;
    const a = photos[index]!;
    const b = photos[target]!;
    await supabase.from("photos").update({ sort_order: b.sort_order }).eq("id", a.id);
    await supabase.from("photos").update({ sort_order: a.sort_order }).eq("id", b.id);
    await refresh();
  }

  async function remove(photo: Photo) {
    if (photo.storage_path)
      await supabase.storage.from("photos").remove([photo.storage_path]);
    const { error } = await supabase.from("photos").delete().eq("id", photo.id);
    if (error) return toast.error(error.message);
    toast.success("Image deleted");
    await refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl">Gallery manager</h1>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            qc.clear();
          }}
          className="border border-border px-5 py-2.5 text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground hover:border-primary hover:text-primary"
        >
          Sign out
        </button>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`border px-4 py-2 text-[0.65rem] uppercase tracking-[0.25em] ${
              category === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          void handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`mt-6 cursor-pointer border border-dashed px-6 py-16 text-center transition-colors ${
          drag ? "border-primary bg-card" : "border-border"
        }`}
      >
        {uploading ? (
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
        ) : (
          <Upload className="mx-auto h-6 w-6 text-primary" />
        )}
        <p className="mt-4 text-sm">
          Drop images here or click to browse — uploading to <b>{category}</b>
        </p>
        <p className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
          Auto-compressed under 500 KB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      <div className="mt-10 grid gap-3">
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 border border-border bg-card p-3"
          >
            <span className="grid h-14 w-14 shrink-0 place-items-center bg-secondary text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
              {i + 1}
            </span>
            <div className="grid min-w-0 gap-2 sm:grid-cols-3">
              <input
                defaultValue={photo.title}
                onBlur={(e) =>
                  e.target.value !== photo.title && update(photo.id, { title: e.target.value })
                }
                placeholder="Title"
                className="min-w-0 border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <select
                value={photo.category}
                onChange={(e) => update(photo.id, { category: e.target.value })}
                className="min-w-0 border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                defaultValue={photo.tags.join(", ")}
                onBlur={(e) =>
                  update(photo.id, {
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="Tags (comma separated)"
                className="min-w-0 border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="flex shrink-0 gap-1">
              <button aria-label="Move up" onClick={() => move(i, -1)} className="p-2 hover:text-primary">
                <ArrowUp className="h-4 w-4" />
              </button>
              <button aria-label="Move down" onClick={() => move(i, 1)} className="p-2 hover:text-primary">
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                aria-label="Delete"
                onClick={() => remove(photo)}
                className="p-2 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {photos.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No uploads yet — the site is showing the default sample gallery.
          </p>
        )}
      </div>
    </div>
  );
}