"use client";
import { signIn } from "next-auth/react";
import { AuthBrand } from '@/components/auth-brand';
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Form & Validation
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@/lib/validations";

import { api } from "@/lib/api";
import { InkButton } from "@/components/ui/InkButton";
import { GlassCard } from "@/components/ui/GlassCard";

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    setServerError("");
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
      // We don't need to send confirmPassword to the backend
      const { confirmPassword, ...signupData } = data;

      await api.post("/auth/signup", signupData);
      router.push("/login?message=Account created successfully!");
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Signup failed");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <GlassCard className="w-full max-w-md p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-serif font-black italic">Join the Pub</h1>
          <p className="text-sm opacity-60">Create your writer profile today.</p>
        </div>

        <AuthBrand />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* NAME FIELD */}
          <div className="space-y-1">
            <input
              {...register("name")}
              placeholder="Your Name"
              className={`w-full px-4 py-3 rounded-xl bg-[#4a5033]/5 border transition-colors ${errors.name ? "border-rose-500" : "border-[#4a5033]/10"
                }`}
            />
            {errors.name && <p className="text-[10px] text-rose-600 ml-1">{errors.name.message}</p>}
          </div>

          {/* EMAIL FIELD */}
          <div className="space-y-1">
            <input
              {...register("email")}
              type="email"
              placeholder="Your Email"
              className={`w-full px-4 py-3 rounded-xl bg-[#4a5033]/5 border transition-colors ${errors.email ? "border-rose-500" : "border-[#4a5033]/10"
                }`}
            />
            {errors.email && <p className="text-[10px] text-rose-600 ml-1">{errors.email.message}</p>}
          </div>

          {/* PASSWORD FIELD */}
          <div className="space-y-1">
            <input
              {...register("password")}
              type="password"
              placeholder="Create Password"
              className={`w-full px-4 py-3 rounded-xl bg-[#4a5033]/5 border transition-colors ${errors.password ? "border-rose-500" : "border-[#4a5033]/10"
                }`}
            />
            {errors.password && <p className="text-[10px] text-rose-600 ml-1">{errors.password.message}</p>}
          </div>

          {/* CONFIRM PASSWORD FIELD */}
          <div className="space-y-1">
            <input
              {...register("confirmPassword")}
              type="password"
              placeholder="Confirm Password"
              className={`w-full px-4 py-3 rounded-xl bg-[#4a5033]/5 border transition-colors ${errors.confirmPassword ? "border-rose-500" : "border-[#4a5033]/10"
                }`}
            />
            {errors.confirmPassword && (
              <p className="text-[10px] text-rose-600 ml-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {serverError && <p className="text-xs text-rose-600 text-center font-semibold">{serverError}</p>}

          <InkButton type="submit" className="w-full py-3 rounded-xl justify-center" disabled={isSubmitting}>
            {isSubmitting ? "Creating Account..." : "Sign Up"}
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-[#4a5033]/5 border border-[#4a5033]/10"
            placeholder="Display name"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-[#4a5033]/5 border border-[#4a5033]/10"
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
            className="w-full px-4 py-3 rounded-xl bg-[#4a5033]/5 border border-[#4a5033]/10"
            placeholder="Password"
          />
          {showPasswordFeedback ? (
            <div className="space-y-3 rounded-xl border border-[#4a5033]/10 bg-[#4a5033]/5 p-4">
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
            className="w-full px-4 py-3 rounded-xl bg-[#4a5033]/5 border border-[#4a5033]/10"
          >
            <option value="writer">Writer</option>
            <option value="editor">Editor</option>
            <option value="reader">Reader</option>
          </select>
          {error ? <p className="text-xs text-rose-600 font-semibold">{error}</p> : null}
          <InkButton type="submit" className="w-full py-3 rounded-xl justify-center" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </InkButton>
        </form>

        <p className="text-xs text-center opacity-60">
          Already have an account? <Link href="/login" className="underline">Sign in</Link>
        </p>
      </GlassCard>
    </main>
  );
}