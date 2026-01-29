import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { blogPosts } from "@/lib/content/blog-posts";

export const metadata = {
  title: "MindBridge Blog | AI Triage & Mental Health Insights",
  description:
    "Expert insights on AI triage, clinical operations, and mental health access. Learn how to reduce wait times and improve outcomes.",
};

export default function BlogIndexPage() {
  return (
    <MainLayout>
      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            MindBridge Clinical Blog
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Evidence-driven guidance on AI triage, clinician workflows, and
            mental health access. Written for clinical and operational teams.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              className="rounded-lg border border-border bg-card p-6 shadow-sm"
            >
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {post.date} · {post.readingTime}
                </p>
                <h2 className="text-xl font-semibold">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:underline"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="text-sm text-muted-foreground">
                  {post.description}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Blog",
              name: "MindBridge Clinical Blog",
              description:
                "Insights on AI triage, clinical operations, and mental health access.",
              url: "https://mindbridge.health/blog",
            }),
          }}
        />
      </section>
    </MainLayout>
  );
}
