import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "placeholder",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "placeholder",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID ?? "placeholder",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? "placeholder",
    }),
  ],
  // This tells NextAuth to use your beautiful custom pages 
  // instead of its default boring ones.
  pages: {
    signIn: '/login',
    newUser: '/signup',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // After login, send them to the dashboard
      return baseUrl + '/dashboard';
    },
  },
});

export { handler as GET, handler as POST };