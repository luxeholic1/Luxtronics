import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { SignUp, UserButton, useUser } from "@clerk/react";

const AccountRegister = () => {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useUser();
  const showSignedOutActions = !isLoaded || !isSignedIn;

  return (
    <Layout>
      <section className="container pt-32 pb-24 max-w-2xl">
        <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">Account</p>
        <h1 className="font-display font-bold text-5xl tracking-tight">
          Create <span className="text-gradient">your account</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          Create your Clerk account to continue.
        </p>

        <div className="mt-8 rounded-3xl border border-border bg-gradient-card p-8 space-y-5">
          {showSignedOutActions ? (
            <div className="flex justify-center">
              <SignUp
                routing="path"
                path="/account/register"
                signInUrl="/account/login"
                forceRedirectUrl="/account"
              />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <UserButton />
              <div>
                <p className="font-medium">You’re already signed in.</p>
                <button
                  type="button"
                  onClick={() => navigate("/account")}
                  className="text-sm text-primary hover:underline"
                >
                  Go to dashboard
                </button>
              </div>
            </div>
          )}
        </div>

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
