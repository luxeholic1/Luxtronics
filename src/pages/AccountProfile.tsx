import Layout from "@/components/Layout";
import { toast } from "sonner";

const AccountProfile = () => {
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated (demo)");
  };

  return (
    <Layout>
      <section className="container pt-32 pb-16 max-w-3xl">
        <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">My account</p>
        <h1 className="font-display font-bold text-5xl tracking-tight">
          Profile <span className="text-gradient">settings</span>
        </h1>
      </section>

      <section className="container pb-24 max-w-3xl">
        <form onSubmit={onSubmit} className="rounded-3xl border border-border bg-gradient-card p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">First name</label>
              <input defaultValue="Asmit" className="mt-2 w-full h-12 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Last name</label>
              <input defaultValue="Sharma" className="mt-2 w-full h-12 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
            <input type="email" defaultValue="asmit@example.com" className="mt-2 w-full h-12 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Phone</label>
            <input defaultValue="+91 98765 43210" className="mt-2 w-full h-12 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:border-primary" />
          </div>
          <button type="submit" className="inline-flex items-center justify-center rounded-full bg-gradient-brand px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all">
            Save changes
          </button>
        </form>
      </section>
    </Layout>
  );
};

export default AccountProfile;
