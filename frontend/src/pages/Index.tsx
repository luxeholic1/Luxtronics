import { lazy, Suspense } from "react";
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import BrandMarquee from "@/components/BrandMarquee";
import CategoryStrip from "@/components/CategoryStrip";
import FeaturedProducts from "@/components/FeaturedProducts";

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
