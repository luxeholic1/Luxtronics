export type BlogPost = {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  date: string;
  image?: string;
  video?: string;
  images?: string[];
  background?: string;
  foreground?: string;
  content: string[];
};

export const fallbackBlogPosts: BlogPost[] = [
  {
    _id: "fallback-gan-wall-chargers",
    slug: "gan-wall-chargers-fast-compact-and-built-for-daily-carry",
    title: "GaN Wall Chargers: Fast, Compact, and Built for Daily Carry",
    excerpt:
      "Why 65W and 80W GaN chargers with retractable USB-C cables are becoming the smarter travel and desk setup.",
    date: "Jun 04, 2026",
    tag: "Charging",
    image: "https://images.unsplash.com/photo-1591290619762-d8b9c4286b04?q=80&w=1600&auto=format&fit=crop",
    background: "#fd5200",
    foreground: "#ffffff",
    content: [
      "GaN chargers are replacing bulky adapters because they deliver high wattage from a smaller body. Gallium nitride runs more efficiently than older silicon designs, which helps chargers stay compact while powering phones, tablets, earbuds, smart watches, and many USB-C laptops.",
      "The practical upgrade is convenience. A 65W or 80W wall charger with a built-in retractable USB-C cable means one less cable to forget, one cleaner desk, and one compact adapter that can move from office bag to bedside table without turning into cable clutter.",
      "For most buyers, the sweet spot is multi-device charging. A 3-port GaN charger lets you top up your phone, accessories, and a second device from one plug. Look for USB-C Power Delivery support, clear wattage sharing, solid heat control, and a compact plug design before choosing only by the highest watt number.",
      "If you travel or commute daily, the retractable cable matters more than it sounds. It protects the cable, keeps the setup neat, and makes quick charging easier in airports, cafes, coworking spaces, and hotel rooms.",
      "Luxtronics is highlighting compact 65W and 80W GaN wall charger options for shoppers who want faster charging without carrying multiple adapters. Check current availability, regional pricing, and shipping options before checkout.",
    ],
  },
  {
    _id: "fallback-laptops-creators-2025",
    slug: "top-10-laptops-for-creators-in-2025",
    title: "Top 10 Laptops for Creators in 2025",
    excerpt: "Our editors round up the best machines for design, video, and code.",
    date: "Apr 18, 2026",
    tag: "Guides",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1600&auto=format&fit=crop",
    background: "#000000",
    foreground: "#ffffff",
    content: [
      "Creative professionals need a laptop that can handle real workloads, not just benchmark screenshots. For 2025, the biggest upgrade trend is better sustained performance and smarter cooling in thinner chassis.",
      "If you work in design or video, prioritize display quality, color accuracy, and GPU reliability before chasing raw CPU numbers. For coding-heavy workflows, keyboard comfort, battery consistency, and thermal behavior matter more over long sessions.",
      "Our shortlist balances performance, portability, and long-term value so you can choose a device that supports your growth instead of limiting it after six months.",
    ],
  },
  {
    _id: "fallback-mirrorless-camera",
    slug: "how-to-choose-your-next-mirrorless-camera",
    title: "How to Choose Your Next Mirrorless Camera",
    excerpt: "Sensor size, lenses, video specs - we break down what matters.",
    date: "Apr 12, 2026",
    tag: "Photography",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1600&auto=format&fit=crop",
    background: "#F5F0E8",
    foreground: "#000000",
    content: [
      "Choosing a mirrorless camera starts with your shooting style. Street and travel creators often prefer compact bodies with great stabilization, while studio and commercial users may benefit more from higher resolution and robust tethering support.",
      "Lens ecosystem is the most important long-term decision. A camera body can be replaced in two years, but lenses shape your look for much longer. Pick a mount with affordable primes and reliable zoom options for your niche.",
      "For hybrid creators, check autofocus reliability, 4K crop behavior, heat management, and real-world battery life. Specs are easy to compare; consistency during real shoots is what actually saves your day.",
    ],
  },
  {
    _id: "fallback-anc-passive",
    slug: "anc-vs-passive-what-actually-works",
    title: "ANC vs Passive: What Actually Works",
    excerpt: "We tested 14 headphones in a noisy cafe. Here's what won.",
    date: "Apr 05, 2026",
    tag: "Audio",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1600&auto=format&fit=crop",
    background: "#1A3DE8",
    foreground: "#ffffff",
    content: [
      "Active noise cancellation and passive isolation solve different problems. ANC is strongest against low-frequency sounds like engines and AC hum, while passive isolation performs better for sudden high-frequency chatter.",
      "In real-world testing, comfort and ear-cup seal had a bigger impact than marketing claims. Even premium ANC can underperform if the fit is loose or clamping pressure is inconsistent.",
      "Best results come from balance: solid passive design plus competent ANC tuning. That combination reduces fatigue and keeps audio clarity high without forcing you to increase volume for long sessions.",
    ],
  },
];

export const getFallbackBlogPost = (slug: string) =>
  fallbackBlogPosts.find((post) => post.slug === slug);
