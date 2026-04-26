import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Show, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/react";

const AccountProfile = () => {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <Layout>
        <section className="container pt-32 pb-24">
          <p className="text-muted-foreground">Loading profile...</p>
        </section>
      </Layout>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <Layout>
        <section className="container pt-32 pb-24 max-w-xl">
          <h1 className="font-display font-bold text-4xl tracking-tight">Please sign in</h1>
          <p className="mt-3 text-muted-foreground">Use Clerk to manage your profile.</p>
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
      <section className="container pt-32 pb-16 max-w-3xl">
        <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">My account</p>
        <h1 className="font-display font-bold text-5xl tracking-tight">
          Profile <span className="text-gradient">settings</span>
        </h1>
      </section>

      <section className="container pb-24 max-w-3xl">
        <div className="rounded-3xl border border-border bg-gradient-card p-8 space-y-5">
          <div className="flex items-center gap-4 flex-wrap">
            <UserButton />
            <div>
              <p className="text-sm uppercase tracking-wider text-muted-foreground">Signed in as</p>
              <p className="font-medium">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
          <Show when="signed-in">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>First name: {user.firstName || "Not set"}</p>
              <p>Last name: {user.lastName || "Not set"}</p>
              <p>Username: {user.username || "Not set"}</p>
              <p>Open the UserButton menu to edit your Clerk profile details.</p>
            </div>
          </Show>
          <Link to="/account" className="inline-flex rounded-full border border-border px-6 py-3 text-sm font-semibold hover:border-primary/40 w-fit">
            Back to dashboard
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default AccountProfile;
