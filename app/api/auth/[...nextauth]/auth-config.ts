import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import { z } from "zod";
import { LoginResponseType } from "next-auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});


// Normalize backend response shapes into a consistent { token, user } shape
async function authenticateUser(
  email: string,
  password: string
): Promise<LoginResponseType | null> {
  try {
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    if (!response.ok) {
      console.error("Login failed:", response.status, response.statusText);
      return null;
    }

    const json = await response.json();

    // Case A: backend returns { token, user }
    if (json?.token && json?.user) {
      const userRaw = json.user;
      return {
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: userRaw.id ?? userRaw._id ?? "0",
            fullname:
              userRaw.fullname ?? userRaw.name ?? userRaw.username ?? "",
            username: userRaw.username ?? userRaw.email?.split("@")[0] ?? "",
            email: userRaw.email,
            phone: userRaw.phone ?? "",
            roleId: Number(userRaw.roleId ?? userRaw.role ?? 0),
            isActive: userRaw.isActive ?? true,
            createdBy: userRaw.createdBy ?? "",
            createdAt: userRaw.createdAt ?? new Date().toISOString(),
            updatedAt: userRaw.updatedAt ?? new Date().toISOString(),
            isPasswordChanged: userRaw.isPasswordChanged ?? false,
          },
          role: (userRaw.role ?? json.role ?? "").toString(),
          token: json.token,
        },
      };
    }

    // Case B: backend returns { success: true, data: { token, user, role } }
    if (json?.success && json?.data?.token && json?.data?.user) {
      const userRaw = json.data.user;
      return {
        success: json.success,
        message: json.message ?? "Login successful",
        data: {
          user: {
            id: userRaw.id ?? userRaw._id ?? "0",
            fullname:
              userRaw.fullname ?? userRaw.name ?? userRaw.username ?? "",
            username: userRaw.username ?? userRaw.email?.split("@")[0] ?? "",
            email: userRaw.email,
            phone: userRaw.phone ?? "",
            roleId: Number(userRaw.roleId ?? userRaw.role ?? 0),
            isActive: userRaw.isActive ?? true,
            createdBy: userRaw.createdBy ?? "",
            createdAt: userRaw.createdAt ?? new Date().toISOString(),
            updatedAt: userRaw.updatedAt ?? new Date().toISOString(),
            isPasswordChanged: userRaw.isPasswordChanged ?? false,
          },
          role: (json.data.role ?? userRaw.role ?? "").toString(),
          token: json.data.token,
        },
      };
    }

    // Unknown shape
    console.error("Unknown auth response shape:", json);
    return null;
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

async function refreshAccessToken(token: any) {
  try {
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/auth/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: token.refreshToken,
        }),
      }
    );

    const refreshed = await response.json();

    if (!response.ok) {
      throw refreshed;
    }

    return {
      ...token,
      accessToken: refreshed.accessToken ?? refreshed.token,
      expiresAt: refreshed.expiresAt ?? Date.now() + 24 * 60 * 60 * 1000,
      refreshToken: refreshed.refreshToken ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        try {
          const parsed = loginSchema.parse(credentials);
          const authData = await authenticateUser(
            parsed.email,
            parsed.password
          );

          if (!authData || !authData.data?.token || !authData.data?.user) {
            console.error("Invalid auth response:", authData);
            return null;
          }

          const { token, user, role } = authData.data;

          return {
            id: String(user.id),
            name: user.fullname ?? user.username ?? "",
            email: user.email,
            role: role?.toLowerCase() ?? "",
            accessToken: token,
            refreshToken: token, // If backend doesn't provide separate refresh token, use the same token
            expiresAt: Date.now() + 24 * 60 * 60 * 1000, // Default 24 hours expiry
            isPasswordChanged: user.isPasswordChanged,
          };
        } catch (err) {
          console.error("Authorization error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }): Promise<JWT> {
      // On sign in, persist values from returned user into JWT
      if (user) {
        token.sub = user.id?.toString() ?? token.sub;
        (token as any).accessToken = user.accessToken;
        (token as any).refreshToken = user.refreshToken;
        (token as any).expiresAt =
          user.expiresAt ?? Date.now() + 24 * 60 * 60 * 1000;
        (token as any).role = user.role;
        (token as any).isPasswordChanged = user.isPasswordChanged;
      }

      // If token not expired return it
      const expiresAt = (token as any).expiresAt as number | undefined;
      if (expiresAt && Date.now() < expiresAt) {
        return token;
      }

      // Token expired -> attempt refresh
      return await refreshAccessToken(token);
    },

    async session({ session, token }: { session: any; token: JWT }) {
      session.user = session.user ?? {};
      session.user.id = token.sub;
      session.user.role = (token as any).role;
      session.user.isPasswordChanged = (token as any).isPasswordChanged;
      session.accessToken = (token as any).accessToken;
      session.error = (token as any).error;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
