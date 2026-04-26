import laptop from "@/assets/product-laptop.png";
import camera from "@/assets/product-camera.png";
import headphones from "@/assets/product-headphones.png";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  img: string;
  tag: string;
  content: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "top-10-laptops-for-creators-2025",
    title: "Top 10 Laptops for Creators in 2025",
    excerpt: "Our editors round up the best machines for design, video, and code.",
    date: "Apr 18, 2026",
    img: laptop,
    tag: "Guides",
    content: [
      "Creative professionals need a laptop that can handle real workloads, not just benchmark screenshots. For 2025, the biggest upgrade trend is better sustained performance and smarter cooling in thinner chassis.",
      "If you work in design or video, prioritize display quality, color accuracy, and GPU reliability before chasing raw CPU numbers. For coding-heavy workflows, keyboard comfort, battery consistency, and thermal behavior matter more over long sessions.",
      "Our shortlist balances performance, portability, and long-term value so you can choose a device that supports your growth instead of limiting it after six months.",
    ],
  },
  {
    slug: "how-to-choose-your-next-mirrorless-camera",
    title: "How to Choose Your Next Mirrorless Camera",
    excerpt: "Sensor size, lenses, video specs - we break down what matters.",
    date: "Apr 12, 2026",
    img: camera,
    tag: "Photography",
    content: [
      "Choosing a mirrorless camera starts with your shooting style. Street and travel creators often prefer compact bodies with great stabilization, while studio and commercial users may benefit more from higher resolution and robust tethering support.",
      "Lens ecosystem is the most important long-term decision. A camera body can be replaced in two years, but lenses shape your look for much longer. Pick a mount with affordable primes and reliable zoom options for your niche.",
      "For hybrid creators, check autofocus reliability, 4K crop behavior, heat management, and real-world battery life. Specs are easy to compare; consistency during real shoots is what actually saves your day.",
    ],
  },
  {
    slug: "anc-vs-passive-what-actually-works",
    title: "ANC vs Passive: What Actually Works",
    excerpt: "We tested 14 headphones in a noisy cafe. Here's what won.",
    date: "Apr 05, 2026",
    img: headphones,
    tag: "Audio",
    content: [
      "Active noise cancellation and passive isolation solve different problems. ANC is strongest against low-frequency sounds like engines and AC hum, while passive isolation performs better for sudden high-frequency chatter.",
      "In real-world testing, comfort and ear-cup seal had a bigger impact than marketing claims. Even premium ANC can underperform if the fit is loose or clamping pressure is inconsistent.",
      "Best results come from balance: solid passive design plus competent ANC tuning. That combination reduces fatigue and keeps audio clarity high without forcing you to increase volume for long sessions.",
    ],
  },
];

export const getBlogPost = (slug: string) =>
  blogPosts.find((post) => post.slug === slug);