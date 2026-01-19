import { Resend } from "resend";

export async function sendMagicLink(email, token) {
    
    const link = `${process.env.VITE_API_URL}/api/login/verify?token=${token}`;
    
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
        from: 'UTampa Fabrication Labs <no-reply@mariablokhina.com>',
        to: email,
        subject: "Sign in to UTampa Fabrication Labs",
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <p style="color: #333; font-size: 16px; line-height: 1.5; margin: 0 0 16px 0;">Hi there,</p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.5; margin: 0 0 24px 0;">Click the button below to verify your UT email and sign in:</p>
            
            <div style="margin: 32px 0;">
                <a href="${link}" target="_self" style="display: inline-block; background: #6dff60; color: #000; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: 500; font-size: 16px;">Verify Email</a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0 0 12px 0;">This link expires in 10 minutes.</p>
            
            <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0 0 24px 0;">If you didn't request this, you can ignore this email.</p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.5; margin: 0;">– The FabLab Team</p>
            </div>
        `,
    });
    return {
        success: true, 
        message: 'Magic link sent'
    }
}