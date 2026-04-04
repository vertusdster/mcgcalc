import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, User } from "lucide-react";
import { PlusSigns } from "../icons/plus-signs";

const BlogPosts = ({ posts }: { posts: any[] }) => {
  // Get the first post as the featured post
  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <div className="relative py-16 md:py-28 lg:py-32">
      <section>
        <div className="container">
          <h1 className="text-center text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
            Blog
          </h1>
          <div className="mx-auto mt-4 max-w-[45rem] space-y-2 text-center">
            <p className="text-muted-foreground text-2xl md:text-3xl">
              Stay ahead of fintech trends with our expert analysis and industry
              insights.
            </p>
          </div>
          <div className="absolute -inset-40 z-[-1] [mask-image:radial-gradient(circle_at_center,black_0%,black_20%,transparent_75%)]">
            <PlusSigns className="text-foreground/[0.05] h-full w-full" />
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="mt-8">
        <div className="container max-w-6xl">
          <a
            href={`/blog/${featuredPost.id}/`}
            className="bg-card group relative mb-16 overflow-hidden rounded-xl border shadow-md"
          >
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="lg:w-1/2">
                <div className="p-2 lg:p-4">
                  <img
                    src={featuredPost.data.image}
                    alt={featuredPost.data.title}
                    className="aspect-video w-full rounded-lg object-cover transition-transform group-hover:scale-[1.02]"
                  />
                </div>
              </div>
              <div className="flex flex-col justify-center p-4 pb-8 lg:w-1/2 lg:pr-8">
                <Badge variant="outline" className="mb-3 w-fit">
                  Featured Post
                </Badge>
                <h2 className="mb-3 text-2xl font-bold group-hover:underline md:text-3xl">
                  {featuredPost.data.title}
                </h2>
                <p className="text-muted-foreground mb-4 line-clamp-3 text-base">
                  {featuredPost.data.description}
                </p>

                <div className="mb-6 flex gap-4">
                  <div className="text-muted-foreground flex items-center text-sm">
                    <Calendar className="mr-1 h-4 w-4" />
                    {new Date(featuredPost.data.pubDate).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}
                  </div>
                  <div className="text-muted-foreground flex items-center text-sm">
                    <Clock className="mr-1 h-4 w-4" />5 min read
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {featuredPost.data.authorImage ? (
                    <Avatar className="ring-input size-9 border shadow-sm">
                      <AvatarImage
                        src={featuredPost.data.authorImage}
                        alt={featuredPost.data.authorName || "Author"}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {featuredPost.data.authorName
                          ? featuredPost.data.authorName.charAt(0)
                          : "A"}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                  <span className="font-medium">
                    {featuredPost.data.authorName || "Anonymous"}
                  </span>
                </div>
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* Regular Posts Grid */}
      <section className="mt-8">
        <div className="container max-w-6xl">
          <h2 className="mb-8 text-xl font-semibold md:text-2xl">
            Recent Articles
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {remainingPosts.map((post) => (
              <a
                key={post.id}
                className="bg-card group rounded-xl border shadow-sm transition-all hover:shadow-md"
                href={`/blog/${post.id}/`}
              >
                <div className="p-2">
                  <img
                    src={post.data.image}
                    alt={post.data.title}
                    className="aspect-video w-full rounded-lg object-cover transition-transform group-hover:scale-[1.01]"
                  />
                </div>
                <div className="px-4 pb-5 pt-2">
                  <h2 className="mb-2 text-xl font-semibold group-hover:underline">
                    {post.data.title}
                  </h2>
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {post.data.description}
                  </p>

                  {/* Author and date info */}
                  <div className="mt-4 flex items-center gap-4">
                    {post.data.authorImage ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="ring-input size-8 border shadow-sm">
                          <AvatarImage
                            src={post.data.authorImage}
                            alt={post.data.authorName || "Author"}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {post.data.authorName
                              ? post.data.authorName.charAt(0)
                              : "A"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {post.data.authorName || "Anonymous"}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">
                          {post.data.authorName || "Anonymous"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-muted-foreground mt-3 flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
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
                      <Clock className="h-3.5 w-3.5" />
                      <span>5 min read</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export { BlogPosts };
