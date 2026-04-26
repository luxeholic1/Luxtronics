import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { SignIn, UserButton, useUser } from "@clerk/react";

const AccountLogin = () => {
  const { isLoaded, isSignedIn } = useUser();
  const showSignedOutActions = !isLoaded || !isSignedIn;

  return (
    <Layout>
      <section className="container pt-32 pb-24 max-w-xl">
        <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">Account</p>
        <h1 className="font-display font-bold text-5xl tracking-tight">
          Welcome <span className="text-gradient">back</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          Sign in with Clerk to access your account.
        </p>

        <div className="mt-8 rounded-3xl border border-border bg-gradient-card p-8 space-y-5">
          {showSignedOutActions ? (
            <div className="flex justify-center">
              <SignIn
                routing="path"
                path="/account/login"
                signUpUrl="/account/register"
                forceRedirectUrl="/account"
              />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <UserButton />
              <div>
                <p className="font-medium">You’re already signed in.</p>
                <Link to="/account" className="text-sm text-primary hover:underline">
                  Go to dashboard
                </Link>
              </div>
            </div>
          )}
        </div>

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
