import { Mail, MapPin, Phone, Send, MessageCircle, Clock } from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import SEO from "@/components/SEO";

const Contact = () => {
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you within 24 hours.");
    (e.target as HTMLFormElement).reset();
  };

  return (
    <Layout>
      <SEO
        title="Contact Luxtronics — Customer Support & Enquiries"
        description="Contact Luxtronics for order support, returns, or partnerships. Email, phone, WhatsApp available. Response within 24 hours."
        keywords="contact luxtronics, customer support, electronics store contact, luxtronics phone number"
        url="https://luxtronics.in/contact"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Contact Luxtronics",
          "url": "https://luxtronics.in/contact",
          "description": "Contact Luxtronics for support, orders, or partnerships.",
          "mainEntity": {
            "@type": "Organization",
            "name": "Luxtronics",
            "url": "https://luxtronics.in",
            "email": "support@luxtronics.in",
            "telephone": "+91-92664-33722",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Plot No. 12, Sector 63",
              "addressLocality": "Noida",
              "addressRegion": "Uttar Pradesh",
              "postalCode": "201301",
              "addressCountry": "IN"
            },
            "contactPoint": [
              {
                "@type": "ContactPoint",
                "telephone": "+91-92664-33722",
                "contactType": "customer service",
                "availableLanguage": ["English", "Hindi"],
                "hoursAvailable": {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
                  "opens": "09:00",
                  "closes": "18:00"
                }
              }
            ]
          }
        }}
      />

      <section className="container pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16">
        <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">Contact</p>
        <h1 className="font-display font-bold text-5xl sm:text-6xl tracking-tight">
          Let's <span className="text-gradient">talk</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl">
          Questions, feedback, or need help with an order? We're here for you — usually reply within 24 hours.
        </p>
      </section>

      <section className="container pb-16 sm:pb-20 lg:pb-24 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Contact info */}
        <div className="space-y-4 lg:col-span-1">
          <a
            href="mailto:support@luxtronics.in"
            className="p-6 rounded-2xl bg-gradient-card border border-border flex items-start gap-4 hover:border-primary/40 transition-colors block"
          >
            <div className="h-11 w-11 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow flex-shrink-0">
              <Mail className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Email</p>
              <p className="font-medium mt-1">support@luxtronics.in</p>
              <p className="text-xs text-muted-foreground mt-0.5">Response within 24 hours</p>
            </div>
          </a>

          <a
            href="tel:+919266433722"
            className="p-6 rounded-2xl bg-gradient-card border border-border flex items-start gap-4 hover:border-primary/40 transition-colors block"
          >
            <div className="h-11 w-11 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow flex-shrink-0">
              <Phone className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Phone</p>
              <p className="font-medium mt-1">+91 92664 33722</p>
              <p className="text-xs text-muted-foreground mt-0.5">Mon–Sat, 9 AM – 6 PM IST</p>
            </div>
          </a>

          <a
            href="https://wa.me/919266433722?text=Hi%20Luxtronics%2C%20I%20need%20help%20with"
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-2xl bg-gradient-card border border-border flex items-start gap-4 hover:border-primary/40 transition-colors block"
          >
            <div className="h-11 w-11 rounded-xl bg-[#25D366] flex items-center justify-center shadow-glow flex-shrink-0">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">WhatsApp</p>
              <p className="font-medium mt-1">+91 92664 33722</p>
              <p className="text-xs text-muted-foreground mt-0.5">Quick replies on WhatsApp</p>
            </div>
          </a>

          <div className="p-6 rounded-2xl bg-gradient-card border border-border flex items-start gap-4">
            <div className="h-11 w-11 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow flex-shrink-0">
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Office Address</p>
              <p className="font-medium mt-1">Plot No. 12, Sector 63</p>
              <p className="text-sm text-muted-foreground">Noida, Uttar Pradesh 201301</p>
              <p className="text-sm text-muted-foreground">India</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-card border border-border flex items-start gap-4">
            <div className="h-11 w-11 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow flex-shrink-0">
              <Clock className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Business Hours</p>
              <p className="font-medium mt-1">Mon – Sat</p>
              <p className="text-sm text-muted-foreground">9:00 AM – 6:00 PM IST</p>
              <p className="text-xs text-muted-foreground mt-1">Closed on Sundays & public holidays</p>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <form onSubmit={onSubmit} className="lg:col-span-2 p-8 rounded-3xl bg-gradient-card border border-border space-y-5">
          <h2 className="font-display font-bold text-2xl">Send us a message</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Name *</label>
              <input
                required
                name="name"
                placeholder="Your full name"
                className="mt-2 w-full h-12 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Email *</label>
              <input
                required
                type="email"
                name="email"
                placeholder="your@email.com"
                className="mt-2 w-full h-12 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Phone (optional)</label>
            <input
              type="tel"
              name="phone"
              placeholder="+91 XXXXX XXXXX"
              className="mt-2 w-full h-12 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Subject *</label>
            <select
              required
              name="subject"
              className="mt-2 w-full h-12 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">Select a topic</option>
              <option value="order">Order enquiry</option>
              <option value="return">Return / Refund</option>
              <option value="product">Product question</option>
              <option value="shipping">Shipping issue</option>
              <option value="warranty">Warranty claim</option>
              <option value="partnership">Partnership / Business</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Message *</label>
            <textarea
              required
              name="message"
              rows={6}
              placeholder="Describe your query in detail..."
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none transition-colors"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all hover:scale-105"
          >
            Send message <Send className="h-4 w-4" />
          </button>
          <p className="text-xs text-muted-foreground">
            By submitting this form, you agree to our{" "}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
          </p>
        </form>
      </section>
    </Layout>
  );
};

export default Contact;
