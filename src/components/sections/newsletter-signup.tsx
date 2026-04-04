import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";

const NewsletterSignup = () => {
  const [email, setEmail] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would be connected to your newsletter service
    console.log("Submitting email:", email);
    alert("Thanks for subscribing!");
    setEmail("");
  };

  return (
    <section className="bg-muted/50 border-t py-16 md:py-24">
      <div className="container max-w-5xl">
        <div className="bg-card flex flex-col items-center justify-between gap-8 rounded-2xl border p-8 shadow-sm md:p-12 lg:flex-row">
          <div className="max-w-md text-center lg:text-left">
            <div className="mb-3 flex justify-center lg:justify-start">
              <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                <Mail className="h-5 w-5" />
              </div>
            </div>
            <h2 className="mb-3 text-2xl font-bold md:text-3xl">
              Subscribe to our newsletter
            </h2>
            <p className="text-muted-foreground mb-0 text-base">
              Stay updated with the latest articles, tutorials, and insights
              from our team. We'll never spam your inbox.
            </p>
          </div>

          <div className="w-full max-w-md">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-2 sm:flex-row"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
              <Button type="submit" className="h-12">
                Subscribe
              </Button>
            </form>
            <p className="text-muted-foreground mt-2 text-xs">
              By subscribing, you agree to our Privacy Policy and consent to
              receive updates from our company.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSignup;
