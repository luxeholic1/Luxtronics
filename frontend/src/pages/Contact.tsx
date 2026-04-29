import { Mail, MapPin, Phone, Send } from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "sonner";

const Contact = () => {
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you within 24 hours.");
    (e.target as HTMLFormElement).reset();
  };

  return (
    <Layout>
      <section className="container pt-32 pb-16">
        <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">Contact</p>
        <h1 className="font-display font-bold text-5xl sm:text-6xl tracking-tight">
          Let's <span className="text-gradient">talk</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl">
          Questions, feedback, partnerships? Drop us a line — we usually reply within 24 hours.
        </p>
      </section>

      <section className="container pb-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-4 lg:col-span-1">
          {[
            { Icon: Mail, label: "Email", value: "hello@luxtronics.shop" },
            { Icon: Phone, label: "Phone", value: "+1 (555) 010-2025" },
            { Icon: MapPin, label: "Office", value: "221B Baker Street, London" },
          ].map(({ Icon, label, value }) => (
            <div key={label} className="p-6 rounded-2xl bg-gradient-card border border-border flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow flex-shrink-0">
                <Icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="font-medium mt-1">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={onSubmit} className="lg:col-span-2 p-8 rounded-3xl bg-gradient-card border border-border space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Name</label>
              <input required className="mt-2 w-full h-12 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
              <input required type="email" className="mt-2 w-full h-12 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Subject</label>
            <input required className="mt-2 w-full h-12 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Message</label>
            <textarea required rows={6} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none" />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all hover:scale-105"
          >
            Send message <Send className="h-4 w-4" />
          </button>
        </form>
      </section>
    </Layout>
  );
};

export default Contact;
