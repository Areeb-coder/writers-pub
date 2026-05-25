import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import crypto from "crypto";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "placeholder",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "placeholder",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    newUser: '/signup',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        try {
          const provider = account.provider as "google" | "facebook";
          const providerId = account.providerAccountId;
          const email = profile.email || "";
          const displayName = profile.name || email.split("@")[0];
          const avatarUrl = profile.image || "";

          // Generate HMAC signature to verify this request securely on the backend
          const sharedSecret = process.env.INTERNAL_AUTH_SHARED_SECRET || "fallback_dev_secret";
          const signature = crypto
            .createHmac("sha256", sharedSecret)
            .update(`${providerId}:${email}`)
            .digest("hex");

          let apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
          if (apiUrl.endsWith("/api")) {
            apiUrl = apiUrl.slice(0, -4);
          }
          const res = await fetch(`${apiUrl}/api/auth/oauth-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              displayName,
              avatarUrl,
              provider,
              providerId,
              signature
            }),
          });

          if (res.ok) {
            const result = await res.json();
            token.accessToken = result.data.tokens.accessToken;
            token.refreshToken = result.data.tokens.refreshToken;
            token.backendUser = result.data.user;
          } else {
            console.error("Backend OAuth registration returned non-200:", res.status);
          }
        } catch (error) {
          console.error("Failed to sync OAuth details to backend:", error);
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
        session.user = token.backendUser;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl + '/dashboard';
    },
  },
});

export { handler as GET, handler as POST };