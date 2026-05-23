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
          </InkButton>
        </form>

        <p className="text-xs text-center opacity-60">
          Already have an account? <Link href="/login" className="underline">Sign in</Link>
        </p>
      </GlassCard>
    </main>
  );
}