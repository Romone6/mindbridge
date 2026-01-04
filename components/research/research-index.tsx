"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { researchItems, researchTags } from "@/lib/research/research-data";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export function ResearchIndex() {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string>("All");
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (rootRef.current) {
      rootRef.current.dataset.hydrated = "true";
    }
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return researchItems.filter((item) => {
      const matchesTag =
        activeTag === "All" || item.tags.includes(activeTag);
      if (!matchesTag) return false;

      if (!normalizedQuery) return true;
      const haystack = [item.title, item.abstract, item.tags.join(" ")]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [activeTag, query]);

  return (
    <section
      ref={rootRef}
      className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
      data-testid="research-index"
      data-hydrated="false"
    >
        <Panel className="space-y-4 p-6">
          <div className="text-sm font-semibold">Find a document</div>
          <label className="relative block">
            <span className="sr-only">Search research</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              data-testid="research-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search titles, topics, or tags"
              className="pl-9"
            />
          </label>
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Filter by tag
            </div>
            <div className="flex flex-wrap gap-2" data-testid="research-tags">
              {["All", ...researchTags].map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  size="sm"
                  variant={activeTag === tag ? "secondary" : "outline"}
                  onClick={() => setActiveTag(tag)}
                  data-testid={`research-tag-${tag.toLowerCase().replace(/\s+/g, "-")}`}
                  aria-pressed={activeTag === tag}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </Panel>

        <div className="space-y-4" data-testid="research-list">
          {filteredItems.length === 0 ? (
            <Panel className="p-6 text-sm text-muted-foreground">
              No research items match your filters. Try clearing the search or
              selecting another tag.
            </Panel>
          ) : (
            filteredItems.map((item) => (
              <Panel
                key={item.slug}
                className="p-6 space-y-3"
                data-testid={`research-card-${item.slug}`}
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <time dateTime={item.date}>{formatDate(item.date)}</time>
                  {item.status ? (
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                      {item.status}
                    </Badge>
                  ) : null}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    <Link
                      href={`/research/${item.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {item.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-muted-foreground">{item.abstract}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={`${item.slug}-${tag}`} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Panel>
            ))
          )}
        </div>
      </section>
  );
}
