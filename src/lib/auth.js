import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { query } from "@/lib/db";
import bcrypt from "bcrypt";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Email Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const rows = await query("SELECT * FROM users WHERE email = ?", [credentials.email]);
        const user = rows[0];
        
        if (!user || !user.password) return null;
        
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) return null;
        
        return { 
          id: user.id.toString(), 
          name: user.name, 
          email: user.email, 
          role: user.role, 
          status: user.status 
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const rows = await query("SELECT * FROM users WHERE email = ?", [user.email]);
        
        if (rows.length === 0) {
          // Member baru via Google, masukkan ke DB dengan status pending
          await query(
            "INSERT INTO users (name, email, google_id, status, role) VALUES (?, ?, ?, 'pending', 'member')",
            [user.name, user.email, profile?.sub]
          );
        } else if (!rows[0].google_id) {
            // Update google_id if it's missing for existing email
            await query("UPDATE users SET google_id = ? WHERE email = ?", [profile?.sub, user.email]);
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
      }
      
      // Sinkronisasi data token dengan database setiap ada request (agar status live)
      if (token.email) {
         try {
             const rows = await query("SELECT id, role, status FROM users WHERE email = ?", [token.email]);
             if (rows.length > 0) {
                 token.id = rows[0].id.toString();
                 token.role = rows[0].role;
                 token.status = rows[0].status;
             }
         } catch(e) {
             console.error("JWT sync error:", e);
         }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.status = token.status;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 hari
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Digunakan oleh API lama, sekarang proteksi di-handle middleware NextAuth
export function isValidSession(request) {
    return true;
}

export function setSession(response) {
    const sessionSecret = process.env.ADMIN_SESSION_SECRET;
    response.cookies.set('admin_session', sessionSecret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 1 minggu
    });
}

export function clearSession(response) {
    response.cookies.delete('admin_session');
}
