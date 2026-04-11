import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";
import { PlusSigns } from "../icons/plus-signs";

function readingTime(text: string): number {
  const words = text?.split(/\s+/).length ?? 0;
  return Math.max(1, Math.ceil(words / 200));
}

const BlogPosts = ({ posts }: { posts: any[] }) => {
  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <div className="relative py-16 md:py-24">
      {/* Header */}
      <section>
        <div className="container max-w-5xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Peptide Research Blog
          </h1>
          <p className="text-muted-foreground mt-4 text-lg md:text-xl">
            Guides, dosage references, and research insights for peptide
            reconstitution and injection.
          </p>
          <div className="absolute -inset-40 z-[-1] [mask-image:radial-gradient(circle_at_center,black_0%,black_20%,transparent_75%)]">
            <PlusSigns className="text-foreground/[0.05] h-full w-full" />
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="mt-12">
          <div className="container max-w-5xl">
            <a
              href={`/blog/${featuredPost.id}/`}
              className="bg-card group relative flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-all hover:shadow-md lg:flex-row"
            >
              {featuredPost.data.image && (
                <div className="lg:w-2/5">
                  <img
                    src={featuredPost.data.image}
                    alt={featuredPost.data.title}
                    className="h-56 w-full object-cover transition-transform group-hover:scale-[1.02] lg:h-full"
                  />
                </div>
              )}
              <div
                className={`flex flex-col justify-center p-6 lg:p-8 ${featuredPost.data.image ? "lg:w-3/5" : "w-full"}`}
              >
                <div className="mb-3 flex items-center gap-2">
                  <Badge className="border-0 bg-[#1d4ed8]/10 text-[#1d4ed8] hover:bg-[#1d4ed8]/20">
                    Featured
                  </Badge>
                  {featuredPost.data.category && (
                    <Badge variant="outline">
                      {featuredPost.data.category}
                    </Badge>
                  )}
                </div>
                <h2 className="mb-3 text-2xl font-bold transition-colors group-hover:text-[#1d4ed8] md:text-3xl">
                  {featuredPost.data.title}
                </h2>
                <p className="text-muted-foreground mb-5 line-clamp-2 text-base">
                  {featuredPost.data.description}
                </p>
                <div className="text-muted-foreground flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    {featuredPost.data.authorImage ? (
                      <Avatar className="size-6">
                        <AvatarImage src={featuredPost.data.authorImage} />
                        <AvatarFallback>
                          {featuredPost.data.authorName?.[0] ?? "A"}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="bg-primary/10 text-primary flex size-6 items-center justify-center rounded-full">
                        <User className="size-3.5" />
                      </div>
                    )}
                    <span>{featuredPost.data.authorName || "Editorial"}</span>
                  </div>
                  <span>·</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    <span>
                      {new Date(featuredPost.data.pubDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    <span>
                      {readingTime(featuredPost.data.description)} min read
                    </span>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-[#1d4ed8]">
                  Read article{" "}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </a>
          </div>
        </section>
      )}

      {/* Grid */}
      {remainingPosts.length > 0 && (
        <section className="mt-12">
          <div className="container max-w-5xl">
            <h2 className="mb-6 text-xl font-semibold">All Articles</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {remainingPosts.map((post) => (
                <a
                  key={post.id}
                  href={`/blog/${post.id}/`}
                  className="bg-card group flex flex-col rounded-xl border shadow-sm transition-all hover:border-[#3b82f6]/40 hover:shadow-md"
                >
                  {post.data.image && (
                    <div className="overflow-hidden rounded-t-xl">
                      <img
                        src={post.data.image}
                        alt={post.data.title}
                        className="aspect-video w-full object-cover transition-transform group-hover:scale-[1.03]"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    {post.data.category && (
                      <span className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#1d4ed8]">
                        {post.data.category}
                      </span>
                    )}
                    <h3 className="mb-2 font-semibold leading-snug transition-colors group-hover:text-[#1d4ed8]">
                      {post.data.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2 flex-1 text-sm">
                      {post.data.description}
                    </p>
                    <div className="text-muted-foreground mt-4 flex items-center gap-3 border-t pt-3 text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3.5" />
                        <span>
                          {new Date(post.data.pubDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        <span>
                          {readingTime(post.data.description)} min read
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Calculator CTA */}
      <section className="mt-16">
        <div className="container max-w-5xl">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#3b82f6]/20 bg-[#1d4ed8]/5 px-8 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 dark:text-white">
                Ready to calculate your dose?
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Use our free peptide dosage calculator for instant, accurate
                results.
              </p>
            </div>
            <a
              href="/calculator"
              className="shrink-0 rounded-xl bg-gradient-to-r from-[#1d4ed8] dark:from-slate-200 to-[#3b82f6] dark:to-slate-400 px-6 py-3 text-sm font-bold text-white dark:text-slate-900 transition-opacity hover:opacity-90"
            >
              Open Calculator →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export { BlogPosts };
