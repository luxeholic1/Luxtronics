import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Package, Heart, MapPin, UserRound } from "lucide-react";
import { toast } from "sonner";
import { clearAuthToken, getAuthToken, getCurrentUser, logoutUser, type AccountUser } from "@/services/auth";

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
  const [user, setUser] = useState<AccountUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const me = await getCurrentUser(token);
        setUser(me);
      } catch (error) {
        clearAuthToken();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    const token = getAuthToken();
    if (token) {
      try {
        await logoutUser(token);
      } catch {
        // no-op
      }
    }

    clearAuthToken();
    setUser(null);
    toast.success("Logged out");
  };

  if (loading) {
    return (
      <Layout>
        <section className="container pt-32 pb-24">
          <p className="text-muted-foreground">Loading account...</p>
        </section>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <section className="container pt-32 pb-24 max-w-xl">
          <h1 className="font-display font-bold text-4xl tracking-tight">Please sign in</h1>
          <p className="mt-3 text-muted-foreground">You need an account to access your dashboard.</p>
          <div className="mt-6 flex gap-3">
            <Link to="/account/login" className="rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow">
              Sign in
            </Link>
            <Link to="/account/register" className="rounded-full border border-border px-6 py-3 text-sm font-semibold hover:border-primary/40">
              Create account
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="container pt-32 pb-12">
        <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">My account</p>
        <h1 className="font-display font-bold text-5xl tracking-tight">
          Hi, <span className="text-gradient">{user.firstName}</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl">
          {user.email}
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-5 rounded-full border border-border px-5 py-2 text-sm font-medium hover:border-primary/40"
        >
          Logout
        </button>
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
