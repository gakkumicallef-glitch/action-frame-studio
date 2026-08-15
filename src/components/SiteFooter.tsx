import { CONTACT } from "@/lib/contact";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 px-5 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>Mvassallophotography</span>
        <span className="flex flex-col gap-2 sm:flex-row sm:gap-6">
          <a href={`mailto:${CONTACT.email}`} className="hover:text-foreground">
            {CONTACT.email}
          </a>
          <a href={`tel:${CONTACT.phoneIntl}`} className="hover:text-foreground">
            {CONTACT.phoneDisplay}
          </a>
        </span>
        <span>Malta &middot; Available worldwide</span>
      </div>
    </footer>
  );
}