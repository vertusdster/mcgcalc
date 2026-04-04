import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar, Clock, ArrowLeft, User } from "lucide-react";

const BlogPost = ({
  post,
  children,
}: {
  post: any;
  children: React.ReactNode;
}) => {
  const { title, authorName, image, pubDate, description, authorImage } =
    post.data;
  return (
    <>
      {/* Hero section with gradient background and post info */}
      <section className="pb-8 pt-4">
        <div className="container max-w-4xl">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              {description}
            </p>
          </div>

          <div className="mx-auto mt-6 flex max-w-md flex-wrap items-center justify-center gap-6">
            {/* Author info */}
            {authorImage ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border shadow-sm">
                  <AvatarImage src={authorImage} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {authorName ? authorName.charAt(0) : "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-sm">
                  <span className="font-medium">
                    {authorName || "Anonymous"}
                  </span>
                  <span className="text-muted-foreground">Author</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full shadow-sm">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex flex-col text-sm">
                  <span className="font-medium">
                    {authorName || "Anonymous"}
                  </span>
                  <span className="text-muted-foreground">Author</span>
                </div>
              </div>
            )}

            {/* Date info */}
            <div className="flex items-center gap-4">
              <div className="text-muted-foreground flex items-center gap-1 text-sm">
                <Calendar className="h-4 w-4" />
                <span>{format(pubDate, "MMMM d, yyyy")}</span>
              </div>

              <div className="text-muted-foreground flex items-center gap-1 text-sm">
                <Clock className="h-4 w-4" />
                <span>5 min read</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured image */}
      {image && (
        <section className="container max-w-5xl py-4">
          <div className="aspect-video w-full overflow-hidden rounded-xl border">
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover"
            />
          </div>
        </section>
      )}

      {/* Article content */}
      <section className="container my-10 max-w-3xl">
        <article className="prose prose-lg dark:prose-invert prose-headings:font-semibold prose-a:text-primary mx-auto">
          {children}
        </article>
      </section>
    </>
  );
};

export { BlogPost };
