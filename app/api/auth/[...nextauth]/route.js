
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                const res = await fetch(process.env.BACKEND_URL + "/auth/login", {
                    method: 'POST',
                    body: JSON.stringify(credentials),
                    headers: { "Content-Type": "application/json" },
                    cache: 'no-store'
                })
                let loginResponse = await res.json()
                
                if (res.ok && loginResponse && loginResponse.status === 404) throw new Error('Бүртгэл олдсонгүй')
                if (res.ok && loginResponse && loginResponse.status === 200) return loginResponse.user
                throw new Error(loginResponse?.error || 'Нэвтрэхэд алдаа гарлаа')
            }
        }),
    ],
    pages: {
        signIn: "/login",
        signOut: "/logout",
        error: "/login",
    },
    session: {
        strategy: "jwt",
        jwt: true,
        maxAge: 48 * 60 * 60, // 48 hours
    },
    callbacks: {
        async jwt({ token, user, account, profile, trigger, session }) {
            if(trigger == "update"){
                return { ...token, ...session.user }
            }
            return { ...token, ...user }
        },
        async session({ session, token }) {
            session.user = token
            return session
        },
        async signIn({ user, account, profile, email, credentials }) {
            return true
        }
    },
    secret: process.env.NEXTAUTH_SECRET
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 
