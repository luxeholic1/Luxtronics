import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import laptop from "@/assets/product-laptop.png";
import camera from "@/assets/product-camera.png";

const PromoBanner = () => {
  return (
    <section className="container py-16 grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-card border border-border p-10 min-h-[320px] flex flex-col justify-between group hover:border-primary/40 transition-all">
        <div className="absolute -right-10 -bottom-10 h-72 w-72 rounded-full bg-primary/20 blur-[80px] group-hover:bg-primary/30 transition-all" />
        <div className="relative">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">
            Limited Edition
          </p>
          <h3 className="font-display font-bold text-3xl sm:text-4xl leading-tight">
            Pro Laptops
            <br />
            <span className="text-gradient">up to 30% off</span>
          </h3>
        </div>
        <div className="relative flex items-end justify-between">
          <Link
            to="/shop?cat=laptops"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
          >
            Shop now <ArrowRight className="h-4 w-4" />
          </Link>
          <img
            src={laptop}
            alt="Laptop promo"
            loading="lazy"
            width={400}
            height={400}
            className="absolute right-0 bottom-0 h-44 w-44 object-contain group-hover:scale-110 transition-transform duration-700"
          />
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-card border border-border p-10 min-h-[320px] flex flex-col justify-between group hover:border-accent/40 transition-all">
        <div className="absolute -left-10 -top-10 h-72 w-72 rounded-full bg-accent/20 blur-[80px] group-hover:bg-accent/30 transition-all" />
        <div className="relative">
          <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-3">
            New Drop
          </p>
          <h3 className="font-display font-bold text-3xl sm:text-4xl leading-tight">
            Capture the
            <br />
            <span className="text-gradient">extraordinary</span>
          </h3>
        </div>
        <div className="relative flex items-end justify-between">
          <Link
            to="/shop?cat=cameras"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
          >
            Discover <ArrowRight className="h-4 w-4" />
          </Link>
          <img
            src={camera}
            alt="Camera promo"
            loading="lazy"
            width={400}
            height={400}
            className="absolute right-0 bottom-0 h-44 w-44 object-contain group-hover:scale-110 transition-transform duration-700"
          />
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
