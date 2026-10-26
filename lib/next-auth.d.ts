import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      isPasswordChanged: boolean;
    } & DefaultSession["user"];
    accessToken: string;
    error?: string;
  }

  interface User extends DefaultUser {
    id: string;
    name?: string;
    email?: string;
    role?: string;
    avatar?: string | null;
    isPasswordChanged: boolean;
    // tokens & expiry for the session token
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }

  interface LoginResponseType {
    success: boolean;
    message: string;
    data: {
      user: {
        id: number;
        fullname: string;
        username: string;
        email: string;
        phone: string;
        roleId: number;
        isActive: boolean;
        createdBy: string;
        createdAt: string;
        updatedAt: string;
        isPasswordChanged: boolean;
      };
      role: string;
      roleName?: string;
      token: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    role: string;
    isPasswordChanged: boolean;
    error?: string;
  }
}
