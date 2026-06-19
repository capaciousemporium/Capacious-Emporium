import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const { 
  handlers, 
  auth, 
  signIn, 
  signOut 
} = NextAuth({
  ...authConfig,
// cookies: {
//   sessionToken: {
//     name: "authjs.session-token",
//     options: {
//       httpOnly: true,
//       sameSite: "lax",
//       path: "/",
//       secure: process.env.NODE_ENV === "production",
//     },
//   },
// },
  callbacks: {
  async jwt({ token, user }) {
   console.log("JWT callback called with user:", user);
  if (user) {
    token.id = (user as any).id;
    token.role = (user as any).role;
    token.rememberMe = (user as any).rememberMe;
  }

  return token;
},

 async session({ session, token }) {
  if (session.user) {
    (session.user as any).id = token.id;
    (session.user as any).role = token.role;
    (session.user as any).rememberMe = token.rememberMe;
  }

  return session;
},

},
  adapter: PrismaAdapter(prisma),
  session: {
  strategy: "jwt",
    maxAge: 10, // 1 minute
 
},
  providers: [
    Credentials({
      async authorize(credentials) {
      const parsedCredentials = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    rememberMe: z.string().optional(),
  })
  .safeParse(credentials);

        if (parsedCredentials.success) {
         const { email, password, rememberMe } =
  parsedCredentials.data;
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) return null;
          
          const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
          if (passwordsMatch) {
return {
  ...user,
  rememberMe: rememberMe === "true",
};
}
        }

        return null;
      },
    }),
  ],
});
