import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";

const AccountProfile = () => {
  const { user, isLoaded, isSignedIn } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  if (!isLoaded) {
    return (
      <Layout>
        <section className="container pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 lg:pb-24">
          <p className="text-muted-foreground">Loading profile...</p>
        </section>
      </Layout>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <Layout>
        <section className="container pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 lg:pb-24 max-w-xl">
          <h1 className="font-display font-bold text-4xl tracking-tight">Please sign in</h1>
          <p className="mt-3 text-muted-foreground">Sign in to manage your profile.</p>
          <div className="mt-6 flex gap-3 flex-wrap">
            <Link
              to="/account/login"
              className="inline-flex rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              Sign in
            </Link>
            <Link
              to="/account/register"
              className="inline-flex rounded-full border border-border px-6 py-3 text-sm font-semibold hover:border-primary/40"
            >
              Create account
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateProfile(auth.currentUser!, { displayName });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <section className="container pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 max-w-3xl">
        <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">My account</p>
        <h1 className="font-display font-bold text-5xl tracking-tight">
          Profile <span className="text-gradient">settings</span>
        </h1>
      </section>

      <section className="container pb-16 sm:pb-20 lg:pb-24 max-w-3xl">
        <div className="rounded-3xl border border-border bg-gradient-card p-8 space-y-6">
          <div>
            <p className="text-sm uppercase tracking-wider text-muted-foreground mb-1">Signed in as</p>
            <p className="font-medium">{user.email}</p>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-500/10 rounded-xl px-4 py-3">{error}</p>
          )}
          {saved && (
            <p className="text-sm text-green-500 bg-green-500/10 rounded-xl px-4 py-3">Profile updated.</p>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Display name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={user.email || ""}
                disabled
                className="w-full rounded-xl border border-border bg-background/30 px-4 py-3 text-sm text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>

          <Link
            to="/account"
            className="inline-flex rounded-full border border-border px-6 py-3 text-sm font-semibold hover:border-primary/40 w-fit"
          >
            Back to dashboard
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default AccountProfile;
