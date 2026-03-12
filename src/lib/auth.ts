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
                    <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
                            <!-- Header / Logo Area -->
                            <div style="background-color: #0f172a; padding: 32px; text-align: center;">
                                <div style="color: #8b5cf6; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                                    CAPITA<span style="color: #ffffff; font-style: italic;">FIN</span>
                                </div>
                            </div>
                            
                            <!-- Content Area -->
                            <div style="padding: 40px 32px;">
                                <h1 style="margin: 0 0 16px 0; color: #0f172a; font-size: 22px; font-weight: 700; text-align: center;">
                                    Redefinição de Senha
                                </h1>
                                <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 24px; text-align: center;">
                                    Olá, <strong>${user.name}</strong>!<br>
                                    Recebemos uma solicitação para alterar a senha da sua conta.
                                </p>
                                
                                <!-- CTA Button -->
                                <div style="text-align: center; margin: 32px 0;">
                                    <a href="${url}" style="display: inline-block; background-color: #8b5cf6; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.3);">
                                        Redefinir minha senha
                                    </a>
                                </div>
                                
                                <p style="margin: 24px 0 0 0; color: #64748b; font-size: 14px; line-height: 20px; text-align: center;">
                                    Este link é válido por 60 minutos. Se você não solicitou esta alteração, pode ignorar este e-mail com segurança.
                                </p>
                            </div>
                            
                            <!-- Bottom Info -->
                            <div style="padding: 0 32px 32px 32px; text-align: center;">
                                <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                    Para sua segurança, nunca compartilhe este link com ninguém.
                                </p>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div style="max-width: 500px; margin: 24px auto 0; text-align: center;">
                            <p style="margin: 0; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">
                                © ${new Date().getFullYear()} CapitaFin — Inteligência Financeira
                            </p>
                        </div>
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
    trustedOrigins: [
        "http://localhost:3000",
        "https://capitafin.zapcoretech.com",
    ],
});
