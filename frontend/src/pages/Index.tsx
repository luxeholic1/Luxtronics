import { lazy, Suspense } from "react";
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import BrandMarquee from "@/components/BrandMarquee";
import SEO from "@/components/SEO";

// Lazy load below-the-fold components
const CategoryStrip = lazy(() => import("@/components/CategoryStrip"));
const FeaturedProducts = lazy(() => import("@/components/FeaturedProducts"));
const DealsBanner = lazy(() => import("@/components/DealsBanner"));
const PromoBanner = lazy(() => import("@/components/PromoBanner"));
const LimitedEdition = lazy(() => import("@/components/LimitedEdition"));
const Testimonials = lazy(() => import("@/components/Testimonials"));
const TrustBadges = lazy(() => import("@/components/TrustBadges"));
const Newsletter = lazy(() => import("@/components/Newsletter"));

const mobileBrandTrail = [
  { name: "OPPO", logo: "/brands/oppo-mobile-logo-icon.svg" },
  { name: "Vivo", logo: "/brands/vivo-mobile-logo-icon.svg" },
  { name: "Huawei", logo: "/brands/huawei-icon.svg" },
  { name: "Realme", logo: "/brands/realme-mobile-logo-icon.svg" },
  { name: "OnePlus", logo: "/brands/plus-one-icon.svg" },
  { name: "Tecno", logo: "/brands/tecno-mobile-logo-icon.svg" },
  { name: "Google", logo: "/brands/google-color-icon.svg" },
  { name: "Motorola", logo: "/brands/motorola-logo-icon.svg" },
  { name: "Nokia", logo: "/brands/nokia-logo-icon.svg" },
];

const Index = () => {
  return (
    <Layout>
      <SEO
        title="Luxtronics — Premium Electronics & Gadgets Store | India, Australia, New Zealand"
        description="Shop premium electronics: smartphones, audio, wearables, laptops, gaming and cameras. Curated catalog with regional stores for India, Australia and New Zealand."
        keywords="electronics store, premium gadgets, smartphones, laptops, audio equipment, wearables, gaming accessories, cameras, tech store India, electronics Australia"
        url="https://luxtronics.in"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Luxtronics",
          "url": "https://luxtronics.in",
          "description": "Premium electronics store shipping to India, Australia and New Zealand.",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://luxtronics.in/shop?q={search_term_string}",
            "query-input": "required name=search_term_string"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Luxtronics",
            "logo": { "@type": "ImageObject", "url": "https://luxtronics.in/logo.png" }
          }
        }}
      />
      <Hero />
      <BrandMarquee />
      <Suspense fallback={<div className="h-40" />}>
        <CategoryStrip />
        <BrandMarquee
          brands={mobileBrandTrail}
          eyebrow="Mobile brand support"
          title="Compatible picks for OPPO, Vivo, Huawei, Realme, OnePlus, Tecno, Google, Motorola and Nokia devices."
          compact
        />
        <FeaturedProducts />
        <DealsBanner />
        <PromoBanner />
        <LimitedEdition />
        <Testimonials />
        <TrustBadges />
        <Newsletter />
      </Suspense>
    </Layout>
  );
};

export default Index;
