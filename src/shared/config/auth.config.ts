import { AuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { userApi } from "@/entities/user/api/user.api";

export const authConfig: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await userApi.validateUser({
            email: credentials.email,
            password: credentials.password,
          });

          if (user) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }

          return null;
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // Создаем или находим пользователя при входе через Google
        try {
          let dbUser = await userApi.findUserByEmail(user.email!);
          
          if (!dbUser) {
            // Создаем нового пользователя
            await userApi.createUser({
              email: user.email!,
              name: user.name || undefined,
              password: "google_oauth", // Заглушка для Google пользователей
            });
            // Получаем созданного пользователя с ролью
            dbUser = await userApi.findUserByEmail(user.email!);
          }
          
          if (dbUser) {
            // Добавляем данные из БД к пользователю
            user.id = dbUser.id;
            user.role = dbUser.role;
            return true;
          } else {
            return false;
          }
        } catch (error) {
          console.error("Google signIn error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
