import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { registerUser, setAuthToken } from "@/services/auth";

const AccountRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const firstName = String(formData.get("firstName") || "").trim();
    const lastName = String(formData.get("lastName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const result = await registerUser({
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        password,
      });

      setAuthToken(result.token);
      toast.success("Account created successfully");
      navigate("/account");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create account";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="container pt-32 pb-24 max-w-2xl">
        <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">Account</p>
        <h1 className="font-display font-bold text-5xl tracking-tight">
          Create <span className="text-gradient">your account</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          Join Luxtronics to track orders, save your preferences, and get personalized recommendations.
        </p>

        <form onSubmit={onSubmit} className="mt-8 rounded-3xl border border-border bg-gradient-card p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">First name</label>
              <input
                name="firstName"
                required
                className="mt-2 w-full h-12 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:border-primary"
                placeholder="Asmit"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Last name</label>
              <input
                name="lastName"
                required
                className="mt-2 w-full h-12 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:border-primary"
                placeholder="Sharma"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
            <input
              name="email"
              required
              type="email"
              className="mt-2 w-full h-12 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:border-primary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Phone (optional)</label>
            <input
              name="phone"
              className="mt-2 w-full h-12 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:border-primary"
              placeholder="+91 98765 43210"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Password</label>
              <input
                name="password"
                required
                type="password"
                className="mt-2 w-full h-12 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:border-primary"
                placeholder="Create password"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Confirm password</label>
              <input
                name="confirmPassword"
                required
                type="password"
                className="mt-2 w-full h-12 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:border-primary"
                placeholder="Confirm password"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-full bg-gradient-brand px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <Link to="/account/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </section>
    </Layout>
  );
};

export default AccountRegister;
