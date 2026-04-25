import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { clearAuthToken, getAuthToken, getCurrentUser, updateCurrentUser } from "@/services/auth";
import { Link } from "react-router-dom";

const AccountProfile = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authorized, setAuthorized] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const token = getAuthToken();
      if (!token) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      try {
        const user = await getCurrentUser(token);
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setEmail(user.email);
        setPhone(user.phone || "");
      } catch {
        clearAuthToken();
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) {
      setAuthorized(false);
      return;
    }

    try {
      setSaving(true);
      const user = await updateCurrentUser(token, { firstName, lastName, phone });
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setPhone(user.phone || "");
      toast.success("Profile updated");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update profile";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <section className="container pt-32 pb-24">
          <p className="text-muted-foreground">Loading profile...</p>
        </section>
      </Layout>
    );
  }

  if (!authorized) {
    return (
      <Layout>
        <section className="container pt-32 pb-24 max-w-xl">
          <h1 className="font-display font-bold text-4xl tracking-tight">Please sign in</h1>
          <p className="mt-3 text-muted-foreground">Login to update your profile.</p>
          <Link to="/account/login" className="inline-flex mt-6 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow">
            Sign in
          </Link>
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
        <form onSubmit={onSubmit} className="rounded-3xl border border-border bg-gradient-card p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">First name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-2 w-full h-12 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Last name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-2 w-full h-12 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="mt-2 w-full h-12 rounded-xl border border-border bg-background/70 px-4 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 w-full h-12 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-full bg-gradient-brand px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </section>
    </Layout>
  );
};

export default AccountProfile;
