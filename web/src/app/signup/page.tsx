"use client";
import { AuthBrand } from '@/components/auth-brand';
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Form & Validation
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@/lib/validations";

import { api } from "@/lib/api";
import { InkButton } from "@/components/ui/InkButton";
import { GlassCard } from "@/components/ui/GlassCard";

type Role = "writer" | "editor" | "reader";

interface PasswordRule {
  label: string;
  message: string;
  test: (value: string) => boolean;
}

const passwordRules: PasswordRule[] = [
  { label: "8+ characters", message: "At least 8 characters", test: (value) => value.length >= 8 },
  { label: "Uppercase", message: "At least 1 uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { label: "Number", message: "At least 1 number", test: (value) => /[0-9]/.test(value) },
  { label: "Special", message: "At least 1 special character (!@#$%^&*)", test: (value) => /[!@#$%^&*]/.test(value) },
];

function getPasswordStrength(password: string) {
  const passedRules = passwordRules.filter((rule) => rule.test(password)).length;
  if (passedRules <= 1) return { label: "Weak", barClass: "bg-rose-500", textClass: "text-rose-600", width: "25%" };
  if (passedRules <= 3) return { label: "Medium", barClass: "bg-amber-500", textClass: "text-amber-600", width: "60%" };
  return { label: "Strong", barClass: "bg-emerald-500", textClass: "text-emerald-600", width: "100%" };
}

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>("writer");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password", "");
  const strength = getPasswordStrength(password);
  const showFeedback = password.length > 0;

  const onSubmit = async (data: SignupInput) => {
    setServerError("");
    try {
      // Combines Zod-validated data with the role state
      await api.post("/auth/signup", { ...data, role });
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
<<<<<<< HEAD

        <AuthBrand />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* NAME FIELD */}
          <div className="space-y-1">
            <input
              {...register("name")}
              placeholder="Your Name"
              className={`w-full px-4 py-3 rounded-xl bg-[#4a5033]/5 border transition-colors ${errors.name ? "border-rose-500" : "border-[#4a5033]/10"}`}
            />
            {errors.name && <p className="text-[10px] text-rose-600 ml-1">{errors.name.message}</p>}
          </div>

          {/* EMAIL FIELD */}
          <div className="space-y-1">
            <input
              {...register("email")}
              type="email"
              placeholder="Your Email"
              className={`w-full px-4 py-3 rounded-xl bg-[#4a5033]/5 border transition-colors ${errors.email ? "border-rose-500" : "border-[#4a5033]/10"}`}
            />
            {errors.email && <p className="text-[10px] text-rose-600 ml-1">{errors.email.message}</p>}
          </div>

          {/* PASSWORD FIELD */}
          <div className="space-y-1">
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Create Password"
                className={`w-full px-4 py-3 pr-12 rounded-xl bg-[#4a5033]/5 border transition-colors ${errors.password ? "border-rose-500" : "border-[#4a5033]/10"}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-[10px] text-rose-600 ml-1">{errors.password.message}</p>}
          </div>

          {/* STRENGTH INDICATOR */}
          {showFeedback && (
            <div className="space-y-3 rounded-xl border border-[#4a5033]/10 bg-[#4a5033]/5 p-4">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className={strength.textClass}>Strength: {strength.label}</span>
=======
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
>>>>>>> upstream/main
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-black/10">
                <div className={`h-full transition-all duration-500 ${strength.barClass}`} style={{ width: strength.width }} />
              </div>
              <ul className="grid grid-cols-2 gap-1 text-[10px]">
                {passwordRules.map((rule) => (
                  <li key={rule.label} className={rule.test(password) ? "text-emerald-600" : "text-rose-600"}>
                    {rule.test(password) ? "✓" : "•"} {rule.label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CONFIRM PASSWORD FIELD */}
          <div className="space-y-1">
            <input
              {...register("confirmPassword")}
              type="password"
              placeholder="Confirm Password"
              className={`w-full px-4 py-3 rounded-xl bg-[#4a5033]/5 border transition-colors ${errors.confirmPassword ? "border-rose-500" : "border-[#4a5033]/10"}`}
            />
            {errors.confirmPassword && <p className="text-[10px] text-rose-600 ml-1">{errors.confirmPassword.message}</p>}
          </div>

          {/* ROLE SELECT */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
<<<<<<< HEAD
            className="w-full px-4 py-3 rounded-xl bg-[#4a5033]/5 border border-[#4a5033]/10 text-sm"
=======
            className="w-full px-4 py-3 rounded-xl bg-primary/5 border border-primary/10 text-primary focus:outline-none focus:border-primary/30 cursor-pointer"
>>>>>>> upstream/main
          >
            <option value="writer" className="bg-background text-primary">Writer</option>
            <option value="editor" className="bg-background text-primary">Editor</option>
            <option value="reader" className="bg-background text-primary">Reader</option>
          </select>

          {serverError && <p className="text-xs text-rose-600 text-center font-semibold">{serverError}</p>}

          <InkButton type="submit" className="w-full py-3 rounded-xl justify-center" disabled={isSubmitting}>
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </InkButton>
        </form>
<<<<<<< HEAD
=======
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
>>>>>>> upstream/main

        <p className="text-xs text-center opacity-60 text-primary">
          Already have an account? <Link href="/login" className="underline hover:opacity-85 transition-opacity">Sign in</Link>
        </p>
      </GlassCard>
    </main>
  );
}