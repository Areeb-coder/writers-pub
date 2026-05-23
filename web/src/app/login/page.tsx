"use client";
import { signIn } from "next-auth/react";
import { AuthBrand } from '@/components/auth-brand';
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Form & Validation Imports
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations";

import { api } from "@/lib/api";
import { setSession, isAuthenticated } from "@/lib/auth";
import { InkButton } from "@/components/ui/InkButton";
import { GlassCard } from "@/components/ui/GlassCard";

interface LoginResponse {
  user: { id: string; role: string; display_name: string };
  tokens: { accessToken: string; refreshToken: string };
}

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  // 1. Initialize Form with Zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated()) router.replace("/dashboard");
  }, [router]);

  // 2. The Submit Handler now receives validated 'data'
  const onSubmit = async (data: LoginInput) => {
    setError("");
    try {
      const res = await api.post<LoginResponse>("/auth/login", data);
      if (!res.data) throw new Error("Invalid login response");

      setSession({
        accessToken: res.data.tokens.accessToken,
        refreshToken: res.data.tokens.refreshToken,
        user: res.data.user,
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <GlassCard className="w-full max-w-md p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-serif font-black italic">Welcome Back</h1>
          <p className="text-sm opacity-60">Sign in to continue to Writers&apos; Pub.</p>
        </div>

        <AuthBrand />

        {/* 3. Wrap onSubmit with handleSubmit */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <input
              {...register("email")} // 4. Connect input to React Hook Form
              type="email"
              placeholder="Your email"
              className={`w-full px-4 py-3 rounded-xl bg-[#4a5033]/5 border transition-colors ${errors.email ? "border-rose-500 focus:ring-rose-500" : "border-[#4a5033]/10"
                }`}
            />
            {errors.email && (
              <p className="text-[10px] text-rose-600 font-medium ml-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <input
              {...register("password")} // 5. Connect input to React Hook Form
              type="password"
              placeholder="Your password"
              className={`w-full px-4 py-3 rounded-xl bg-[#4a5033]/5 border transition-colors ${errors.password ? "border-rose-500 focus:ring-rose-500" : "border-[#4a5033]/10"
                }`}
            />
            {errors.password && (
              <p className="text-[10px] text-rose-600 font-medium ml-1">{errors.password.message}</p>
            )}
          </div>

          {error ? <p className="text-xs text-rose-600 font-semibold text-center">{error}</p> : null}

          <InkButton
            type="submit"
            className="w-full py-3 rounded-xl justify-center"
            disabled={isSubmitting} // 6. Disable button during submission
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </InkButton>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500 font-medium">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => signIn('google')}
            className="flex items-center justify-center py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm"
          >
            <img src="https://authjs.dev/img/providers/google.svg" className="w-5 h-5 mr-2" alt="Google" />
            <span className="text-sm font-semibold text-gray-700">Google</span>
          </button>
          <button
            type="button"
            onClick={() => signIn('facebook')}
            className="flex items-center justify-center py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm"
          >
            <img src="https://authjs.dev/img/providers/facebook.svg" className="w-5 h-5 mr-2" alt="Facebook" />
            <span className="text-sm font-semibold text-gray-700">Facebook</span>
          </button>
        </div>

        <p className="text-xs text-center opacity-60">
          New here? <Link href="/signup" className="underline">Create an account</Link>
        </p>
      </GlassCard>
    </main>
  );
}