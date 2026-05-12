import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import BrandMarquee from "@/components/BrandMarquee";
import DealsBanner from "@/components/DealsBanner";
import PromoBanner from "@/components/PromoBanner";
import LimitedEdition from "@/components/LimitedEdition";
import CategoryStrip from "@/components/CategoryStrip";
import FeaturedProducts from "@/components/FeaturedProducts";
import Testimonials from "@/components/Testimonials";
import TrustBadges from "@/components/TrustBadges";
import Newsletter from "@/components/Newsletter";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <BrandMarquee />
      <DealsBanner />
      <PromoBanner />
      <LimitedEdition />
      <CategoryStrip />
      <FeaturedProducts />
      <Testimonials />
      <TrustBadges />
      <Newsletter />
    </Layout>
  );
};

export default Index;
