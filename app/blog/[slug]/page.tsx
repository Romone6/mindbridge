import { notFound } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { blogPosts } from "@/lib/content/blog-posts";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);
  if (!post) {
    return {
      title: "MindBridge Blog",
    };
  }
  return {
    title: `${post.title} | MindBridge Blog`,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);
  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: "MindBridge",
    },
    publisher: {
      "@type": "Organization",
      name: "MindBridge",
      logo: {
        "@type": "ImageObject",
        url: "https://mindbridge.health/og-image.png",
      },
    },
  };

  return (
    <MainLayout>
      <article className="mx-auto w-full max-w-3xl px-6 py-16 space-y-6">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {post.date} · {post.readingTime}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
          <p className="text-muted-foreground">{post.description}</p>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div className="space-y-5 leading-relaxed">
          {post.sections.map((section, index) => {
            if (section.type === "heading") {
              return (
                <h2 key={index} className="text-xl font-semibold">
                  {section.text}
                </h2>
              );
            }
            if (section.type === "list") {
              return (
                <ul key={index} className="list-disc pl-5 space-y-2">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={index} className="text-base text-foreground">
                {section.text}
              </p>
            );
          })}
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </article>
    </MainLayout>
  );
}
