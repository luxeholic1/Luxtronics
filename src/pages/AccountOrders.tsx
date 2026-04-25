import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { clearAuthToken, getAuthToken, getCurrentUser, type UserOrder } from "@/services/auth";

const badgeClass = (status: string) => {
  if (status === "Delivered") return "bg-emerald-500/15 text-emerald-300";
  if (status === "Shipped") return "bg-sky-500/15 text-sky-300";
  return "bg-amber-500/15 text-amber-300";
};

const AccountOrders = () => {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      const token = getAuthToken();
      if (!token) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      try {
        const user = await getCurrentUser(token);
        setOrders(user.orders || []);
      } catch {
        clearAuthToken();
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return (
      <Layout>
        <section className="container pt-32 pb-24">
          <p className="text-muted-foreground">Loading orders...</p>
        </section>
      </Layout>
    );
  }

  if (!authorized) {
    return (
      <Layout>
        <section className="container pt-32 pb-24 max-w-xl">
          <h1 className="font-display font-bold text-4xl tracking-tight">Please sign in</h1>
          <p className="mt-3 text-muted-foreground">Login to view your order history.</p>
          <Link to="/account/login" className="inline-flex mt-6 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow">
            Sign in
          </Link>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="container pt-32 pb-16">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">My account</p>
            <h1 className="font-display font-bold text-5xl tracking-tight">
              Order <span className="text-gradient">history</span>
            </h1>
          </div>
          <Link to="/account" className="text-sm text-primary hover:underline">
            Back to dashboard
          </Link>
        </div>
      </section>

      <section className="container pb-24">
        {orders.length === 0 ? (
          <div className="rounded-3xl border border-border bg-gradient-card p-8 text-center">
            <p className="text-muted-foreground">No orders yet. Your real orders will appear here once created in DB.</p>
            <Link to="/shop" className="inline-flex mt-5 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-gradient-card overflow-hidden">
            <div className="grid grid-cols-4 gap-4 px-6 py-4 text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
              <p>Order</p>
              <p>Date</p>
              <p>Amount</p>
              <p>Status</p>
            </div>
            {orders.map((order) => (
              <div key={order.id} className="grid grid-cols-4 gap-4 px-6 py-5 border-b border-border/60 last:border-0 text-sm">
                <p className="font-medium">{order.id}</p>
                <p className="text-muted-foreground">{order.date}</p>
                <p>{order.amount}</p>
                <p>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${badgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default AccountOrders;
