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

const AccountRegister = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, isSignedIn } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isSignedIn) {
    navigate("/account", { replace: true });
    return null;
  }

  const handleSubmit = async () => {
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, displayName);
      navigate("/account");
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
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

  const goToLogin = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    navigate("/account/login");
  };

  const formFields = {
    header: "Create your account",
    subHeader: "Join Luxtronics to track orders and save favourites.",
    fields: [
      {
        label: "Name",
        required: false,
        type: "text" as const,
        placeholder: "Your name",
        value: displayName,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => setDisplayName(event.target.value),
      },
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
        placeholder: "Min. 6 characters",
        value: password,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value),
      },
      {
        label: "Confirm password",
        required: true,
        type: "password" as const,
        placeholder: "Repeat password",
        value: confirm,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => setConfirm(event.target.value),
      },
    ],
    submitButton: "Create account",
    textVariantButton: "Already have an account? Sign in",
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-background">
      <SEO
        title="Create Account | Luxtronics"
        description="Create a Luxtronics account to track orders and save electronics products for later."
        url="/account/register"
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
          goTo={goToLogin}
          onGoogleLogin={handleGoogle}
          handleSubmit={handleSubmit}
        />
      </span>
    </div>
  );
};

export default AccountRegister;
