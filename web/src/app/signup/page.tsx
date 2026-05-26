"use client";
import { signIn } from "next-auth/react";
import { AuthBrand } from '@/components/auth-brand';
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { setSession } from "@/lib/auth";
import { InkButton } from "@/components/ui/InkButton";
import { GlassCard } from "@/components/ui/GlassCard";

type Role = "writer" | "editor" | "reader";

interface RegisterResponse {
  user: { id: string; role: string; display_name: string };
  tokens: { accessToken: string; refreshToken: string };
}

interface PasswordRule {
  label: string;
  message: string;
  test: (value: string) => boolean;
}

const passwordRules: PasswordRule[] = [
  {
    label: "8+ characters",
    message: "Password must be at least 8 characters",
    test: (value) => value.length >= 8,
  },
  {
    label: "Uppercase letter",
    message: "Password must contain at least 1 uppercase letter",
    test: (value) => /[A-Z]/.test(value),
  },
  {
    label: "Number",
    message: "Password must contain at least 1 number",
    test: (value) => /[0-9]/.test(value),
  },
  {
    label: "Special character",
    message: "Password must contain at least 1 special character (!@#$%^&*)",
    test: (value) => /[!@#$%^&*]/.test(value),
  },
];

function getPasswordStrength(password: string) {
  const passedRules = passwordRules.filter((rule) => rule.test(password)).length;

  if (passedRules <= 1) {
    return { label: "Weak", barClass: "bg-rose-500", textClass: "text-rose-600" };
  }

  if (passedRules <= 3) {
    return { label: "Medium", barClass: "bg-amber-500", textClass: "text-amber-600" };
  }

  return { label: "Strong", barClass: "bg-emerald-500", textClass: "text-emerald-600" };
}

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("writer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);

  const passwordStrength = getPasswordStrength(password);
  const passwordErrors = passwordRules
    .filter((rule) => !rule.test(password))
    .map((rule) => rule.message);

  const showPasswordFeedback = passwordTouched || password.length > 0;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordTouched(true);
    if (passwordErrors.length > 0) {
      setError(passwordErrors[0]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post<RegisterResponse>("/auth/register", {
        displayName,
        email,
        password,
        role,
      });
      if (!res.data) throw new Error("Invalid signup response");
      setSession({
        accessToken: res.data.tokens.accessToken,
        refreshToken: res.data.tokens.refreshToken,
        user: res.data.user,
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <GlassCard className="w-full max-w-md p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-serif font-black italic">Create Account</h1>
          <p className="text-sm opacity-60">Choose your role and join the Writers&apos; Pub.</p>
        </div>
<AuthBrand />
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-primary/5 border border-primary/10 text-primary placeholder:text-primary/40 focus:outline-none focus:border-primary/30"
            placeholder="Display name"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-primary/5 border border-primary/10 text-primary placeholder:text-primary/40 focus:outline-none focus:border-primary/30"
            placeholder="Email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordTouched(true);
              setError("");
            }}
            onBlur={() => setPasswordTouched(true)}
            required
            minLength={8}
            className="w-full px-4 py-3 rounded-xl bg-primary/5 border border-primary/10 text-primary placeholder:text-primary/40 focus:outline-none focus:border-primary/30"
            placeholder="Password"
          />
          {showPasswordFeedback ? (
            <div className="space-y-3 rounded-xl border border-primary/10 bg-primary/5 p-4">
              <div className="flex items-center justify-between gap-3 text-xs font-semibold">
                <span className={passwordStrength.textClass}>Password strength</span>
                <span className={passwordStrength.textClass}>{passwordStrength.label}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/10">
                <div
                  className={`h-full w-full rounded-full transition-colors ${passwordStrength.barClass}`}
                  style={{
                    width:
                      passwordStrength.label === "Weak"
                        ? "25%"
                        : passwordStrength.label === "Medium"
                          ? "60%"
                          : "100%",
                  }}
                />
              </div>
              <ul className="space-y-1 text-xs">
                {passwordRules.map((rule) => {
                  const isValid = rule.test(password);
                  return (
                    <li key={rule.label} className={isValid ? "text-emerald-600" : "text-rose-600"}>
                      {isValid ? "✓" : "•"} {rule.message}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full px-4 py-3 rounded-xl bg-primary/5 border border-primary/10 text-primary focus:outline-none focus:border-primary/30 cursor-pointer"
          >
            <option value="writer" className="bg-background text-primary">Writer</option>
            <option value="editor" className="bg-background text-primary">Editor</option>
            <option value="reader" className="bg-background text-primary">Reader</option>
          </select>
          {error ? <p className="text-xs text-rose-600 font-semibold">{error}</p> : null}
          <InkButton type="submit" className="w-full py-3 rounded-xl justify-center" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </InkButton>
        </form>
        {/* Separator */}
<div className="relative my-6">
  <div className="absolute inset-0 flex items-center">
    <span className="w-full border-t border-primary/10" />
  </div>
  <div className="relative flex justify-center text-xs uppercase">
    <span className="bg-background px-2 text-primary/50 font-medium">Or sign up with</span>
  </div>
</div>

{/* Social Buttons */}
<div className="grid grid-cols-2 gap-4">
  <button 
    type="button"
    onClick={() => signIn('google')} 
    className="flex items-center justify-center py-2.5 border border-primary/20 rounded-lg hover:bg-primary/5 transition-all shadow-sm cursor-pointer"
  >
    <img src="https://authjs.dev/img/providers/google.svg" className="w-5 h-5 mr-2" alt="Google" />
    <span className="text-sm font-semibold text-primary">Google</span>
  </button>
  
  <button 
    type="button"
    onClick={() => signIn('facebook')} 
    className="flex items-center justify-center py-2.5 border border-primary/20 rounded-lg hover:bg-primary/5 transition-all shadow-sm cursor-pointer"
  >
    <img src="https://authjs.dev/img/providers/facebook.svg" className="w-5 h-5 mr-2" alt="Facebook" />
    <span className="text-sm font-semibold text-primary">Facebook</span>
  </button>
</div>

        <p className="text-xs text-center opacity-60 text-primary">
          Already have an account? <Link href="/login" className="underline hover:opacity-85 transition-opacity">Sign in</Link>
        </p>
      </GlassCard>
    </main>
  );
}
