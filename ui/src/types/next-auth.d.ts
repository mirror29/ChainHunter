import { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * 扩展 Session 类型
   */
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }

  /**
   * 扩展 User 类型
   */
  interface User extends DefaultUser {
    id: string
  }
}

declare module "next-auth/jwt" {
  /** 扩展 JWT 类型 */
  interface JWT {
    id?: string
  }
}
