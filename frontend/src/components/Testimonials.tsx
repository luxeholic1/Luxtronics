import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CardTransformed,
  CardsContainer,
  ContainerScroll,
  ReviewStars,
} from "@/components/ui/animated-cards-stack";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import testimonialBg from "@/assets/testimonial.jpg";

const testimonials = [
  {
    name: "Sarah Anderson",
    role: "Product Designer",
    content:
      "Luxtronics is my go-to for premium tech. The curation is exceptional and delivery is always on point.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  },
  {
    name: "Raj Patel",
    role: "Entrepreneur",
    content:
      "The quality of products and customer service is unmatched. Highly recommend for anyone serious about tech.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Raj",
  },
  {
    name: "Emma Chen",
    role: "Content Creator",
    content: "Fast shipping, authentic products, and amazing packaging. Every purchase feels special.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
  },
];

const Testimonials = () => {
  const { resolvedTheme } = useTheme();
  const cardVariant = resolvedTheme === "dark" ? "dark" : "light";

  return (
    <section className="relative w-full overflow-hidden pt-12 sm:pt-16 md:pt-20 lg:pt-24">
      {/* Photography backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${testimonialBg})` }}
      />
      <div className={cn("absolute inset-0", resolvedTheme === "dark" ? "bg-black/72" : "bg-background/85")} />

      {/* Tech grid pattern background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20 dark:opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(255,107,53,0.1) 1px, transparent 1px),
            linear-gradient(0deg, rgba(255,107,53,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1920px] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="mb-4 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-primary sm:text-sm">
            Customer Love
          </p>
          <h2 className="mx-auto max-w-3xl font-display text-2xl font-bold tracking-tight dark:text-black sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
            What our <span className="text-gradient">customers</span> say
          </h2>
        </div>

        <ContainerScroll className="h-[120vh]">
          <div className="sticky left-0 top-0 flex h-svh w-full items-center justify-center">
            <CardsContainer className="mx-auto h-[420px] w-[320px] sm:h-[450px] sm:w-[380px]">
              {testimonials.map((testimonial, index) => (
                <CardTransformed
                  key={testimonial.name}
                  arrayLength={testimonials.length}
                  index={index + 1}
                  variant={cardVariant}
                  role="article"
                  aria-labelledby={`testimonial-${index}-name`}
                >
                  <div className="flex flex-col items-center space-y-4 text-center">
                    <ReviewStars className="text-primary" rating={testimonial.rating} />
                    <blockquote className="mx-auto w-4/5 text-base leading-relaxed text-foreground sm:text-lg">
                      "{testimonial.content}"
                    </blockquote>
                  </div>
                  <div className="flex items-center gap-4">
                    <Avatar className="!size-12 border border-border">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span id={`testimonial-${index}-name`} className="block text-base font-semibold tracking-tight sm:text-lg">
                        {testimonial.name}
                      </span>
                      <span className="block text-xs text-muted-foreground sm:text-sm">{testimonial.role}</span>
                    </div>
                  </div>
                </CardTransformed>
              ))}
            </CardsContainer>
          </div>
        </ContainerScroll>
      </div>
    </section>
  );
};

export default Testimonials;
