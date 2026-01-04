import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Download, FileText } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { ResearchIndex } from "@/components/research/research-index";

export const metadata = {
  title: "Research | MindBridge",
  description:
    "Clinical evidence, implementation guides, and safety documentation for MindBridge workflows.",
};

export default function ResearchPage() {
  return (
    <PageShell>
      <div className="space-y-10">
        <div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to home
            </Button>
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" /> Research hub
          </div>
          <h1 className="mt-4">Clinical evidence</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Documentation, methodology, and safety practices that inform the MindBridge workflow.
          </p>
        </div>

        <section>
          <Panel className="p-8 md:p-10 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" /> Whitepaper
            </div>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="space-y-4 max-w-2xl">
                <h2 className="text-2xl font-semibold">MindBridge clinical overview</h2>
                <p className="text-muted-foreground">
                  Documentation covering intake structure, safety checks, and configuration options for clinical teams.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild size="lg" variant="outline">
                    <Link href="/docs/mindbridge_whitepaper.pdf" target="_blank" rel="noreferrer">
                      Download PDF <Download className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    Updated regularly as new evidence is published.
                  </div>
                </div>
              </div>

              <div className="w-full md:w-1/3 aspect-[3/4] bg-muted/20 border border-border rounded-[var(--radius)] relative overflow-hidden">
                <Image
                  src="/docs/whitepaper-abstract.png"
                  alt="Whitepaper preview"
                  fill
                  className="object-cover opacity-80"
                />
              </div>
            </div>
          </Panel>
        </section>

        <ResearchIndex />
      </div>
    </PageShell>
  );
}
