import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Package, Heart, MapPin, UserRound } from "lucide-react";

const quickCards = [
  {
    title: "Recent orders",
    description: "View status, tracking, and invoices for your last purchases.",
    to: "/account/orders",
    icon: Package,
  },
  {
    title: "Saved items",
    description: "Products you bookmarked for later comparison.",
    to: "/shop",
    icon: Heart,
  },
  {
    title: "Addresses",
    description: "Manage delivery and billing addresses.",
    to: "/contact",
    icon: MapPin,
  },
  {
    title: "Profile",
    description: "Update your name, email, and communication preferences.",
    to: "/account/profile",
    icon: UserRound,
  },
];

const AccountDashboard = () => {
  return (
    <Layout>
      <section className="container pt-32 pb-12">
        <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">My account</p>
        <h1 className="font-display font-bold text-5xl tracking-tight">
          Hi, <span className="text-gradient">Asmit</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl">
          Manage your account settings, monitor orders, and keep your profile up to date.
        </p>
      </section>

      <section className="container pb-24 grid grid-cols-1 sm:grid-cols-2 gap-5">
        {quickCards.map((item) => (
          <Link
            key={item.title}
            to={item.to}
            className="rounded-3xl border border-border bg-gradient-card p-6 hover:border-primary/40 transition-all hover:-translate-y-1"
          >
            <div className="h-11 w-11 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow mb-4">
              <item.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold">{item.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
          </Link>
        ))}
      </section>
    </Layout>
  );
};

export default AccountDashboard;
