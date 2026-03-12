import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", // Postgres
        schema: {
            user: schema.users,
            session: schema.sessions,
            account: schema.accounts,
            verification: schema.verifications,
        }
    }),
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
            await transporter.sendMail({
                from: `"CapitaFin" <${process.env.GMAIL_USER}>`,
                to: user.email,
                subject: "Redefinição de Senha - CapitaFin",
                text: `Para redefinir sua senha, clique no link: ${url}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #0f172a;">Redefinição de Senha</h2>
                        <p>Olá, ${user.name}!</p>
                        <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>CapitaFin</strong>.</p>
                        <p>Clique no botão abaixo para escolher uma nova senha:</p>
                        <div style="margin: 32px 0;">
                            <a href="${url}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Redefinir Senha</a>
                        </div>
                        <p style="color: #64748b; font-size: 14px;">Se você não solicitou isso, pode ignorar este e-mail com segurança.</p>
                        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
                        <p style="color: #94a3b8; font-size: 12px;">© 2026 CapitaFin. Todos os direitos reservados.</p>
                    </div>
                `,
            });
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_SECRET_KEY as string,
        },
    },
    account: {
        accountLinking: {
            enabled: true,
        },
    },
});
