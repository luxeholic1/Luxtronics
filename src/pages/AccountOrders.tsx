import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/react";

const AccountOrders = () => {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return (
      <Layout>
        <section className="container pt-32 pb-24">
          <p className="text-muted-foreground">Loading orders...</p>
        </section>
      </Layout>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <Layout>
        <section className="container pt-32 pb-24 max-w-xl">
          <h1 className="font-display font-bold text-4xl tracking-tight">Please sign in</h1>
          <p className="mt-3 text-muted-foreground">Use Clerk to view your account area.</p>
          <div className="mt-6 flex gap-3 flex-wrap">
            <SignInButton>
              <button type="button" className="inline-flex rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton>
              <button type="button" className="inline-flex rounded-full border border-border px-6 py-3 text-sm font-semibold hover:border-primary/40">
                Create account
              </button>
            </SignUpButton>
          </div>
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
            <p className="mt-3 text-muted-foreground">Signed in as {user.primaryEmailAddress?.emailAddress}</p>
          </div>
          <Link to="/account" className="text-sm text-primary hover:underline">
            Back to dashboard
          </Link>
        </div>
      </section>

      <section className="container pb-24">
        <div className="rounded-3xl border border-border bg-gradient-card p-8">
          <div className="flex items-center gap-4 flex-wrap mb-4">
            <UserButton />
            <p className="text-sm text-muted-foreground">
              Your Clerk account is connected. Hook your order source here when you’re ready.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-gradient-card p-8 text-center">
            <p className="text-muted-foreground">No order feed is connected yet.</p>
            <Link to="/shop" className="inline-flex mt-5 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow">
              Start shopping
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AccountOrders;
