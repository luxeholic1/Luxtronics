import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, CreditCard, Lock, Package, Truck, Shield, ShieldCheck } from "lucide-react";
import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { redirectToWooCheckout } from "@/lib/woo-checkout";

const PAYPAL_ICON = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.65A.859.859 0 0 1 5.79 1.9h5.765c2.12 0 3.794.478 4.822 1.528.956.978 1.283 2.392.971 4.198-.018.1-.04.206-.064.314a7.38 7.38 0 0 1-.082.39c-.91 3.844-3.746 5.17-7.108 5.17H8.467a.859.859 0 0 0-.847.736l-.544 3.1z"/>
    <path d="M19.87 7.151c-.012.08-.025.16-.04.24-1.015 4.287-4.18 5.77-8.316 5.77H9.62a1.06 1.06 0 0 0-1.047.908l-.88 5.016-.25 1.42a.558.558 0 0 0 .551.645h3.87a.757.757 0 0 0 .748-.648l.03-.16.593-3.363.038-.207a.757.757 0 0 1 .748-.649h.47c3.05 0 5.437-1.107 6.137-4.31.292-1.338.141-2.455-.632-3.24a2.82 2.82 0 0 0-.932-.622z" opacity=".7"/>
  </svg>
);

const Checkout = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { formatPrice, country } = useCurrency();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");
  
  // Form state for customer data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
  });

  // Redirect to cart if empty
  if (items.length === 0 && !isSuccess) {
    navigate('/cart');
    return null;
  }

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const shipping = subtotal > 200 ? 0 : 15;
  const total = subtotal + shipping;
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Prepare line items
      const lineItems = items.map(item => ({
        product_id: Number(item.product.id),
        quantity: item.qty,
      }));
      
      // Prepare customer data
      const customerData = {
        billing: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address_1: formData.address,
          city: formData.city,
          postcode: formData.zipCode,
          country: country.code,
        },
        shipping: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          address_1: formData.address,
          city: formData.city,
          postcode: formData.zipCode,
          country: country.code,
        }
      };
      
      // Redirect to WooCommerce checkout with cart items and customer data
      redirectToWooCheckout(
        lineItems,
        window.location.hostname,
        country.currency,
        customerData
      );
      
      // Clear cart after successful redirect
      clearCart();
      setIsSuccess(true);
      setTimeout(() => navigate("/"), 3500);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const handlePayPal = () => {
    setIsProcessing(true);
    
    // Prepare line items
    const lineItems = items.map(item => ({
      product_id: Number(item.product.id),
      quantity: item.qty,
    }));
    
    // Prepare customer data
    const customerData = {
      billing: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address_1: formData.address,
        city: formData.city,
        postcode: formData.zipCode,
        country: country.code,
      },
      shipping: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        address_1: formData.address,
        city: formData.city,
        postcode: formData.zipCode,
        country: country.code,
      }
    };
    
    // Redirect to WooCommerce checkout with PayPal
    redirectToWooCheckout(
      lineItems,
      window.location.hostname,
      country.currency,
      customerData
    );
    
    clearCart();
    setIsSuccess(true);
    setTimeout(() => navigate("/"), 3500);
  };

  if (isSuccess) {
    return (
      <Layout>
        <section className="container pt-40 pb-24 text-center">
          <div className="max-w-md mx-auto space-y-6 flex flex-col items-center">
            <div className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-4">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight">
              Order <span className="text-gradient">Confirmed</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Thank you for your purchase! We'll email you an order confirmation with details and tracking info.
            </p>
            <p className="text-sm text-muted-foreground animate-pulse">Redirecting to home…</p>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="container pt-32 pb-16">
        <Link
          to="/cart"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Cart
        </Link>

        <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight mb-4">
          Secure <span className="text-gradient">Checkout</span>
        </h1>

        {/* Security badges row */}
        <div className="flex flex-wrap items-center gap-4 mb-10 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/5 px-3 py-1.5 text-green-400">
            <ShieldCheck className="h-3.5 w-3.5" /> SSL Encrypted
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1.5 text-blue-400">
            <Shield className="h-3.5 w-3.5" /> PCI DSS Compliant
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1.5 text-purple-400">
            <Lock className="h-3.5 w-3.5" /> 3D Secure
          </span>
        </div>

        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-card border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                  <Truck className="h-5 w-5" />
                </div>
                <h2 className="font-display font-bold text-2xl">Shipping Information</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">First Name</label>
                  <input
                    required
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Last Name</label>
                  <input
                    required
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">Email Address</label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">Phone</label>
                  <input
                    required
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">Address</label>
                  <input
                    required
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Luxury Ave"
                    className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">City</label>
                  <input
                    required
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                    className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">ZIP Code</label>
                  <input
                    required
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="10001"
                    className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-card border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h2 className="font-display font-bold text-2xl">Payment Method</h2>
              </div>

              {/* Toggle */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-center justify-center gap-2 rounded-xl border py-3.5 text-sm font-semibold transition-all ${
                    paymentMethod === "card"
                      ? "border-primary bg-primary/10 text-foreground shadow-[0_0_20px_hsl(18_100%_55%/0.15)]"
                      : "border-border text-muted-foreground hover:border-white/20"
                  }`}
                >
                  <CreditCard className="h-4 w-4" /> Credit / Debit
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("paypal")}
                  className={`flex items-center justify-center gap-2 rounded-xl border py-3.5 text-sm font-semibold transition-all ${
                    paymentMethod === "paypal"
                      ? "border-[#0070BA] bg-[#0070BA]/10 text-foreground shadow-[0_0_20px_rgba(0,112,186,0.15)]"
                      : "border-border text-muted-foreground hover:border-white/20"
                  }`}
                >
                  <PAYPAL_ICON /> PayPal
                </button>
              </div>

              {paymentMethod === "card" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Card Number</label>
                    <div className="relative">
                      <input required type="text" maxLength={19} className="w-full rounded-xl border border-border bg-background/50 pl-10 pr-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono" placeholder="0000 0000 0000 0000" />
                      <CreditCard className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Expiry Date</label>
                      <input required type="text" maxLength={5} className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono" placeholder="MM/YY" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">CVC</label>
                      <div className="relative">
                        <input required type="text" maxLength={4} className="w-full rounded-xl border border-border bg-background/50 pl-10 pr-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono" placeholder="123" />
                        <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="mx-auto h-16 w-16 rounded-2xl bg-[#0070BA]/10 flex items-center justify-center text-[#0070BA]">
                    <PAYPAL_ICON />
                  </div>
                  <p className="text-sm text-muted-foreground">You will be redirected to PayPal to complete your payment securely.</p>
                  <button
                    type="button"
                    onClick={handlePayPal}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-2 rounded-full bg-[#0070BA] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#005EA6] transition-all disabled:opacity-60"
                  >
                    {isProcessing ? "Connecting to PayPal…" : (
                      <><PAYPAL_ICON /> Pay with PayPal</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <aside className="lg:sticky lg:top-28 h-fit p-6 sm:p-8 rounded-3xl bg-gradient-card border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                <Package className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-xl">Order Summary</h3>
            </div>

            <div className="space-y-4 mb-6">
              {items.map(({ product, qty }) => (
                <div key={product.id} className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-xl bg-secondary/40 flex items-center justify-center flex-shrink-0 p-2">
                    <img src={product.image} alt={product.name} className="object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-1">{product.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">Qty: {qty}</p>
                  </div>
                  <p className="font-medium text-sm">${(product.price * qty).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-sm border-t border-border pt-6 mb-6">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : `$${shipping}`}</span></div>
              <div className="border-t border-border pt-3 flex justify-between font-display font-bold text-xl">
                <span>Total</span><span className="text-gradient">${total.toLocaleString()}</span>
              </div>
            </div>

            {paymentMethod === "card" && (
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-7 py-4 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Processing…" : `Pay $${total.toLocaleString()}`}
              </button>
            )}

            <p className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-1">
              <Lock className="h-3 w-3" /> 256-bit SSL Encrypted
            </p>

            {/* Trust badges */}
            <div className="mt-6 pt-5 border-t border-border grid grid-cols-3 gap-2 text-center">
              {[
                { icon: ShieldCheck, label: "Verified" },
                { icon: Lock, label: "Secure" },
                { icon: Shield, label: "Protected" },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-1.5">
                  <b.icon className="h-4 w-4 text-green-400" />
                  <span className="text-[10px] text-muted-foreground">{b.label}</span>
                </div>
              ))}
            </div>
          </aside>
        </form>
      </section>
    </Layout>
  );
};

export default Checkout;
