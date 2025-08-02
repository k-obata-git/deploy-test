import { prisma } from '../../../../prisma/prisma';
import CredentialsProvider from "next-auth/providers/credentials";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { verifyPassword } from '../../../../lib/hash';

interface Token extends JWT {
  id?: string,
  userName?: string,
  role?: string,
  isAdmin?: boolean,
}

export const authOptions = {
  // adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt" as const,
    maxAge: 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      // ログイン画面のフォームの中身
      credentials: {
        username: { label: "ユーザーID", type: "text" },
        password: { label: "パスワード", type: "password" },
      },

      // 入力されたIDとパスワードが正しいかチェックする関数
      async authorize(credentials) {
        if (!(credentials?.username && credentials?.password)) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { userId: credentials?.username },
        });

        const isValid = await verifyPassword(
          `${credentials?.password}${credentials.username}`,
          user!.password
        );

        if (!isValid) {
          return null;
        }

        if(user) {
          return { id: user.id.toString(), userName: user.name, role: user.role, isAdmin: user.role === 0 ? true : false };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    // useSession() で取り出すとき、session.user にも userId、role を渡す
    async session({ session, token }: { session: Session; token: Token }) {
      session.user = {
        ...session.user,
        id: token.id ?? null,
        userName: token.userName ?? null,
        role: token.role ?? null,
        isAdmin: token.isAdmin,
      } as typeof session.user & { id?: string } & { userName?: string | null } & { role?: string | null } & { isAdmin?: boolean };
      return session;
    },
    // ログイン後、トークンに userId、 role を保存
    async jwt({ token, user }: { token: Token; user?: unknown }) {
      if (user && typeof user === "object" && "id" in user && "userName" in user && "role" in user && "isAdmin" in user) {
        token.id = (user as { id: string }).id;
        token.userName = (user as { userName?: string }).userName;
        token.role = (user as { role?: string }).role;
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
      }
      return token;
    },
  },
}
