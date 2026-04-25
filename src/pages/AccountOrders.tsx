import Layout from "@/components/Layout";
import { Link } from "react-router-dom";

const orders = [
  {
    id: "LX-24051",
    date: "Apr 18, 2026",
    amount: "$429",
    status: "Delivered",
  },
  {
    id: "LX-23987",
    date: "Apr 10, 2026",
    amount: "$1,299",
    status: "Shipped",
  },
  {
    id: "LX-23813",
    date: "Mar 29, 2026",
    amount: "$189",
    status: "Processing",
  },
];

const badgeClass = (status: string) => {
  if (status === "Delivered") return "bg-emerald-500/15 text-emerald-300";
  if (status === "Shipped") return "bg-sky-500/15 text-sky-300";
  return "bg-amber-500/15 text-amber-300";
};

const AccountOrders = () => {
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
      </section>
    </Layout>
  );
};

export default AccountOrders;
