import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { fetchCustomerOrders, type WooCommerceOrder } from "@/services/store-api";
import { Package, Clock, CheckCircle, XCircle, Truck, ExternalLink, RefreshCw } from "lucide-react";
import { storeConfig } from "@/config/storeConfig";

const WOO_BASE = storeConfig.apiUrl.replace('/wp-json/wc/v3', '');

const statusConfig = {
  'pending':    { label: 'Pending Payment', icon: Clock,         color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  'processing': { label: 'Processing',      icon: Package,       color: 'text-blue-500',   bg: 'bg-blue-500/10 border-blue-500/20'   },
  'on-hold':    { label: 'On Hold',         icon: Clock,         color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/20'},
  'completed':  { label: 'Completed',       icon: CheckCircle,   color: 'text-green-500',  bg: 'bg-green-500/10 border-green-500/20' },
  'cancelled':  { label: 'Cancelled',       icon: XCircle,       color: 'text-red-500',    bg: 'bg-red-500/10 border-red-500/20'     },
  'refunded':   { label: 'Refunded',        icon: XCircle,       color: 'text-red-500',    bg: 'bg-red-500/10 border-red-500/20'     },
  'failed':     { label: 'Failed',          icon: XCircle,       color: 'text-red-500',    bg: 'bg-red-500/10 border-red-500/20'     },
  'shipped':    { label: 'Shipped',         icon: Truck,         color: 'text-blue-500',   bg: 'bg-blue-500/10 border-blue-500/20'   },
};

/** Safely parse a price string/number — returns 0 instead of NaN */
function safePrice(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  const n = typeof val === 'number' ? val : parseFloat(String(val));
  return isNaN(n) ? 0 : n;
}

const AccountOrders = () => {
  const { isLoaded, isSignedIn, user } = useAuth();
  const { formatPrice } = useCurrency();
  const [orders, setOrders]   = useState<WooCommerceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const loadOrders = async () => {
    if (!user?.email) { setLoading(false); return; }
    try {
      setLoading(true);
      const data = await fetchCustomerOrders(user.email);
      setOrders(data);
      setError(null);
    } catch {
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn && user) loadOrders();
  }, [isSignedIn, user]);

  if (!isLoaded || loading) {
    return (
      <Layout>
        <section className="container pt-32 pb-24 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            <p className="text-sm text-muted-foreground">Loading your orders…</p>
          </div>
        </section>
      </Layout>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <Layout>
        <section className="container pt-32 pb-24 max-w-xl">
          <h1 className="font-display font-bold text-4xl tracking-tight">Please sign in</h1>
          <p className="mt-3 text-muted-foreground">Sign in to view your orders.</p>
          <div className="mt-6 flex gap-3 flex-wrap">
            <Link to="/account/login" className="inline-flex rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow">Sign in</Link>
            <Link to="/account/register" className="inline-flex rounded-full border border-border px-6 py-3 text-sm font-semibold hover:border-primary/40">Create account</Link>
          </div>
        </section>
      </Layout>
    );
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  const getStatus = (s: string) =>
    statusConfig[s as keyof typeof statusConfig] ?? statusConfig.pending;

  /** WooCommerce order tracking URL */
  const trackingUrl = (order: WooCommerceOrder) =>
    `${WOO_BASE}/my-account/view-order/${order.id}/`;

  return (
    <Layout>
      <section className="container pt-32 pb-10">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">My account</p>
            <h1 className="font-display font-bold text-5xl tracking-tight">
              Order <span className="text-gradient">history</span>
            </h1>
            <p className="mt-3 text-muted-foreground text-sm">Signed in as {user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadOrders}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:border-primary/40 transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            <Link to="/account" className="text-sm text-primary hover:underline">Back to dashboard</Link>
          </div>
        </div>
      </section>

      <section className="container pb-24">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 flex items-center justify-between">
            <p className="text-sm text-red-400">{error}</p>
            <button onClick={loadOrders} className="text-xs text-red-400 underline">Retry</button>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="rounded-3xl border border-border bg-gradient-card p-12 text-center">
            <Package className="h-14 w-14 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-display font-bold text-2xl mb-2">No orders yet</h3>
            <p className="text-sm text-muted-foreground mb-6">Start shopping to see your orders here.</p>
            <Link to="/shop" className="inline-flex rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const status    = getStatus(order.status);
              const StatusIcon = status.icon;

              // Safe price parsing — prevents NaN
              const subtotal      = safePrice(order.subtotal);
              const shippingTotal = safePrice(order.shipping_total);
              const totalTax      = safePrice(order.total_tax);
              const total         = safePrice(order.total);

              // If subtotal is 0 but total > 0, derive subtotal from line items
              const derivedSubtotal = subtotal > 0
                ? subtotal
                : order.line_items.reduce((sum, item) => sum + safePrice(item.total), 0);

              return (
                <article key={order.id} className="rounded-2xl border border-border bg-gradient-card overflow-hidden hover:border-primary/30 transition-colors">

                  {/* ── Header ── */}
                  <div className="flex items-center justify-between gap-4 flex-wrap px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-display font-bold text-lg">Order #{order.id}</span>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.color} ${status.bg}`}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{formatDate(order.date_created)}</span>
                      {/* Track Order button */}
                      <a
                        href={trackingUrl(order)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all"
                      >
                        <Truck className="h-3 w-3" />
                        Track Order
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  {/* ── Items ── */}
                  <div className="px-6 py-4 space-y-3">
                    {order.line_items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        {item.image?.src && (
                          <div className="h-14 w-14 rounded-xl bg-secondary/40 flex-shrink-0 overflow-hidden border border-border">
                            <img src={item.image.src} alt={item.name} loading="lazy" className="h-full w-full object-contain p-1" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm leading-tight line-clamp-2">{item.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Qty: {item.quantity} × {formatPrice(safePrice(item.price))}
                          </p>
                        </div>
                        <p className="font-semibold text-sm flex-shrink-0">
                          {formatPrice(safePrice(item.total))}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* ── Footer: address + payment + totals ── */}
                  <div className="border-t border-border px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">

                    {/* Shipping address */}
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Shipping Address</p>
                      <p className="font-medium">{order.shipping.first_name} {order.shipping.last_name}</p>
                      {order.shipping.address_1 && <p className="text-muted-foreground text-xs mt-0.5">{order.shipping.address_1}</p>}
                      <p className="text-muted-foreground text-xs">
                        {[order.shipping.city, order.shipping.state, order.shipping.postcode].filter(Boolean).join(', ')}
                      </p>
                      <p className="text-muted-foreground text-xs">{order.shipping.country}</p>
                    </div>

                    {/* Payment */}
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Payment</p>
                      <p className="font-medium">{order.payment_method_title || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground mt-1 font-mono break-all">{order.order_key}</p>
                    </div>

                    {/* Totals */}
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Summary</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Subtotal</span>
                          <span>{formatPrice(derivedSubtotal)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Shipping</span>
                          <span>{shippingTotal === 0 ? 'Free' : formatPrice(shippingTotal)}</span>
                        </div>
                        {totalTax > 0 && (
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Tax</span>
                            <span>{formatPrice(totalTax)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-sm pt-1.5 border-t border-border mt-1.5">
                          <span>Total</span>
                          <span className="text-gradient">{formatPrice(total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default AccountOrders;
