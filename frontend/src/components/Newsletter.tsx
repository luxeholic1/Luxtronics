import { Mail } from "lucide-react";

const Newsletter = () => {
  return (
    <section className="container py-16 sm:py-24 px-4 sm:px-6 lg:px-0">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-card border border-border p-6 sm:p-10 lg:p-16 text-center">
        <div className="absolute inset-0 bg-gradient-radial opacity-50" />
        <div className="relative max-w-2xl mx-auto">
          <div className="h-12 w-12 sm:h-14 sm:w-14 mx-auto rounded-xl sm:rounded-2xl bg-gradient-brand flex items-center justify-center mb-4 sm:mb-6 shadow-glow">
            <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tight">
            Get <span className="text-gradient">10% off</span> your first order
          </h2>
          <p className="mt-3 sm:mt-4 text-xs sm:text-base text-muted-foreground">
            Subscribe for exclusive drops, early access, and the latest tech updates.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              placeholder="your@email.com"
              className="flex-1 h-10 sm:h-12 rounded-full border border-border bg-background px-4 sm:px-5 text-xs sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              className="h-10 sm:h-12 rounded-full bg-gradient-brand px-5 sm:px-7 text-xs sm:text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all hover:scale-105"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
