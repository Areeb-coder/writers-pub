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

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("writer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
            placeholder="Your Display name"
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-[#4a5033]/5 border border-[#4a5033]/10"
            
          />
          <input
            type="email"
            placeholder="Type Email"
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-[#4a5033]/5 border border-[#4a5033]/10"
            
          />
          <input
            type="password"
            placeholder=" Type Password"
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl bg-[#4a5033]/5 border border-[#4a5033]/10"
            
          />
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
        {/* Separator */}
<div className="relative my-6">
  <div className="absolute inset-0 flex items-center">
    <span className="w-full border-t border-gray-200" />
  </div>
  <div className="relative flex justify-center text-xs uppercase">
    <span className="bg-white px-2 text-gray-400">Or sign up with</span>
  </div>
</div>

{/* Social Buttons */}
<div className="grid grid-cols-2 gap-4">
  <button 
    type="button"
    onClick={() => signIn('google')} 
    className="flex items-center justify-center py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
  >
    <img src="https://authjs.dev/img/providers/google.svg" className="w-5 h-5 mr-2" alt="Google" />
    <span className="text-sm font-semibold text-gray-700">Google</span>
  </button>
  
  <button 
    type="button"
    onClick={() => signIn('facebook')} 
    className="flex items-center justify-center py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
  >
    <img src="https://authjs.dev/img/providers/facebook.svg" className="w-5 h-5 mr-2" alt="Facebook" />
    <span className="text-sm font-semibold text-gray-700">Facebook</span>
  </button>
</div>

        <p className="text-xs text-center opacity-60">
          Already have an account? <Link href="/login" className="underline">Sign in</Link>
        </p>
      </GlassCard>
    </main>
  );
}
