import { lazy, Suspense } from "react";
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import BrandMarquee from "@/components/BrandMarquee";
import CategoryStrip from "@/components/CategoryStrip";
import FeaturedProducts from "@/components/FeaturedProducts";
import SEO from "@/components/SEO";

// Lazy load below-the-fold components
const DealsBanner = lazy(() => import("@/components/DealsBanner"));
const PromoBanner = lazy(() => import("@/components/PromoBanner"));
const LimitedEdition = lazy(() => import("@/components/LimitedEdition"));
const Testimonials = lazy(() => import("@/components/Testimonials"));
const TrustBadges = lazy(() => import("@/components/TrustBadges"));
const Newsletter = lazy(() => import("@/components/Newsletter"));

const Index = () => {
  return (
    <Layout>
      <SEO
        title="Luxtronics — Premium Electronics & Gadgets Store | India, Australia, New Zealand"
        description="Shop premium electronics: smartphones, audio, wearables, laptops, gaming and cameras. Curated brands, fast shipping, 2-year warranty. Ships to India, Australia & New Zealand."
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
      <CategoryStrip />
      <FeaturedProducts />
      <Suspense fallback={<div className="h-20" />}>
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
