import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { categories, products } from "@/data/products";

const Categories = () => {
  return (
    <Layout>
      <section className="container pt-32 pb-16">
        <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">
          Categories
        </p>
        <h1 className="font-display font-bold text-5xl sm:text-6xl tracking-tight">
          Shop by <span className="text-gradient">category</span>
        </h1>
      </section>

      <section className="container pb-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => {
          const sample = products.find((p) => p.category === cat.name);
          return (
            <Link
              key={cat.slug}
              to={`/shop?cat=${cat.slug}`}
              className="group relative overflow-hidden rounded-3xl bg-gradient-card border border-border p-8 min-h-[280px] flex flex-col justify-between hover:border-primary/40 transition-all hover:-translate-y-1"
            >
              <div className="absolute -right-10 -bottom-10 h-56 w-56 rounded-full bg-primary/10 blur-[80px] group-hover:bg-primary/30 transition-all" />
              <div className="relative">
                <h3 className="font-display font-bold text-3xl">{cat.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">{cat.count} products</p>
              </div>
              {sample && (
                <img
                  src={sample.image}
                  alt={cat.name}
                  loading="lazy"
                  width={300}
                  height={300}
                  className="absolute right-4 bottom-4 h-40 w-40 object-contain group-hover:scale-110 transition-transform duration-700"
                />
              )}
              <span className="relative text-sm font-semibold text-gradient">Browse →</span>
            </Link>
          );
        })}
      </section>
    </Layout>
  );
};

export default Categories;
