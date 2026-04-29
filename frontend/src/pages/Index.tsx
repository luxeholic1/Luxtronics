import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import CategoryStrip from "@/components/CategoryStrip";
import FeaturedProducts from "@/components/FeaturedProducts";
import PromoBanner from "@/components/PromoBanner";
import BrandMarquee from "@/components/BrandMarquee";
import Newsletter from "@/components/Newsletter";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <BrandMarquee />
      <CategoryStrip />
      <PromoBanner />
      <FeaturedProducts />
      <Newsletter />
    </Layout>
  );
};

export default Index;
