import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { useAuth } from "@/context/AuthContext";
import { AuthTabs, TechOrbitDisplay } from "@/components/ui/animated-sign-in";
import { BatteryCharging, Plug, ShieldCheck, Zap } from "lucide-react";
import loginBg from "@/assets/flatlay-macbook-ipad-dark.jpeg";

const iconsArray = [
  {
    component: () => <Zap className="h-full w-full text-accent" />,
    className: "size-[30px] border-none bg-transparent",
    duration: 20,
    delay: 20,
    radius: 100,
    path: false,
    reverse: false,
  },
  {
    component: () => <Plug className="h-full w-full text-accent" />,
    className: "size-[30px] border-none bg-transparent",
    duration: 20,
    delay: 10,
    radius: 100,
    path: false,
    reverse: false,
  },
  {
    component: () => <BatteryCharging className="h-full w-full text-foreground" />,
    className: "size-[50px] border-none bg-transparent",
    radius: 210,
    duration: 20,
    path: false,
    reverse: false,
  },
  {
    component: () => <ShieldCheck className="h-full w-full text-foreground" />,
    className: "size-[50px] border-none bg-transparent",
    radius: 210,
    duration: 20,
    delay: 20,
    path: false,
    reverse: false,
  },
];

const AccountLogin = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, isSignedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isSignedIn) {
    navigate("/account", { replace: true });
    return null;
  }

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/account");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate("/account");
    } catch (err: any) {
      setError(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    navigate("/account/register");
  };

  const formFields = {
    header: "Welcome back",
    subHeader: "Sign in to access your Luxtronics account.",
    fields: [
      {
        label: "Email",
        required: true,
        type: "email" as const,
        placeholder: "you@example.com",
        value: email,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value),
      },
      {
        label: "Password",
        required: true,
        type: "password" as const,
        placeholder: "••••••••",
        value: password,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value),
      },
    ],
    submitButton: "Sign in",
    textVariantButton: "New here? Create an account",
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-background">
      <SEO
        title="Sign In | Luxtronics"
        description="Sign in to your Luxtronics account to manage orders, saved products, and profile details."
        url="/account/login"
        noindex
        nofollow
      />

      <span
        className="relative hidden w-1/2 flex-col justify-center bg-cover bg-center lg:flex"
        style={{ backgroundImage: `url(${loginBg})` }}
      >
        <span className="absolute inset-0 bg-background/80" />
        <span className="relative z-10 h-full w-full">
          <TechOrbitDisplay iconsArray={iconsArray} text="Luxtronics" />
        </span>
      </span>

      <span className="flex h-screen w-full flex-col items-center justify-center max-lg:px-[10%] lg:w-1/2">
        <AuthTabs
          formFields={formFields}
          loading={loading}
          errorField={error}
          goTo={goToRegister}
          onGoogleLogin={handleGoogle}
          handleSubmit={handleSubmit}
        />
      </span>
    </div>
  );
};

export default AccountLogin;
