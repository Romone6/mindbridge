import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import {
  getResearchItem,
  researchItems,
} from "@/lib/research/research-data";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export async function generateStaticParams() {
  return researchItems.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const item = getResearchItem(resolvedParams.slug);
  if (!item) {
    return {
      title: "Research | MindBridge",
      description: "Research content not found.",
    };
  }

  const title = `${item.title} | MindBridge Research`;

  return {
    title,
    description: item.abstract,
    openGraph: {
      title,
      description: item.abstract,
      type: "article",
    },
    twitter: {
      card: "summary",
      title,
      description: item.abstract,
    },
  };
}

export default async function ResearchDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const item = getResearchItem(resolvedParams.slug);

  if (!item) {
    notFound();
  }

  return (
    <PageShell>
      <div className="space-y-8">
        <div>
          <Link href="/research">
            <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to research
            </Button>
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <time dateTime={item.date}>{formatDate(item.date)}</time>
            {item.status ? (
              <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                {item.status}
              </Badge>
            ) : null}
          </div>
          <h1 className="mt-4">{item.title}</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            {item.abstract}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Badge key={`${item.slug}-${tag}`} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {item.links?.length ? (
          <Panel className="p-6 space-y-3">
            <div className="text-sm font-semibold">Resources</div>
            <div className="flex flex-wrap gap-3">
              {item.links.map((link) => (
                <Button key={link.href} asChild variant="outline">
                  <Link href={link.href} target="_blank" rel="noreferrer">
                    {link.label} <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ))}
            </div>
          </Panel>
        ) : null}

        <div className="space-y-6">
          {item.sections.map((section) => (
            <Panel key={section.heading} className="p-6 space-y-3">
              <h2 className="text-xl font-semibold">{section.heading}</h2>
              <p className="text-sm text-muted-foreground">{section.body}</p>
            </Panel>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
