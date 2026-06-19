import { lazy, Suspense } from "react";
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import BrandMarquee from "@/components/BrandMarquee";
import SEO from "@/components/SEO";
import { absoluteUrl } from "@/lib/seo";

// Lazy load below-the-fold components
const CategoryStrip = lazy(() => import("@/components/CategoryStrip"));
const GearShowcase = lazy(() => import("@/components/GearShowcase"));
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
        url="/"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Store",
          "name": "Luxtronics",
          "url": absoluteUrl("/"),
          "description": "Premium electronics store shipping to India, Australia and New Zealand.",
          "image": absoluteUrl("/logo.jpeg"),
          "areaServed": ["IN", "AU", "NZ"],
          "currenciesAccepted": "INR, AUD, NZD",
          "paymentAccepted": "Credit Card, Debit Card, UPI, Digital Wallet"
        }}
      />
      <Hero />
      <BrandMarquee />
      <Suspense fallback={<div className="h-40" />}>
        <FeaturedProducts />
        <CategoryStrip />
        <BrandMarquee
          brands={mobileBrandTrail}
          eyebrow="Mobile brand support"
          title="Compatible picks for OPPO, Vivo, Huawei, Realme, OnePlus, Tecno, Google, Motorola and Nokia devices."
          compact
        />
        <GearShowcase />
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
