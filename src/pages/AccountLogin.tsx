import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { toast } from "sonner";

const AccountLogin = () => {
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Logged in successfully (demo)");
  };

  return (
    <Layout>
      <section className="container pt-32 pb-24 max-w-xl">
        <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">Account</p>
        <h1 className="font-display font-bold text-5xl tracking-tight">
          Welcome <span className="text-gradient">back</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          Sign in to access your orders, saved addresses, and account settings.
        </p>

        <form onSubmit={onSubmit} className="mt-8 rounded-3xl border border-border bg-gradient-card p-8 space-y-5">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
            <input
              required
              type="email"
              className="mt-2 w-full h-12 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:border-primary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Password</label>
              <button type="button" className="text-xs text-primary hover:underline">
                Forgot password?
              </button>
            </div>
            <input
              required
              type="password"
              className="mt-2 w-full h-12 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:border-primary"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center rounded-full bg-gradient-brand px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground text-center">
          New here?{" "}
          <Link to="/account/register" className="text-primary font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </section>
    </Layout>
  );
};

export default AccountLogin;
