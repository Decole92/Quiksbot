"use server";

import { auth } from "@clerk/nextjs/server";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import { BASE_URL } from "../../../constant/url";
import { onMailer } from "../customer";

type formData = {
  host: string;
  port: number;
  secure: boolean;
  userEmail: string;
  password: string;
};

export const createMailOptions = async (formData: formData) => {
  const { userId } = await auth();

  if (!userId || !formData) throw new Error("not userId or formdata found!");

  try {
    const foundUser = await fetchQuery(api.users.getUserByClerkId, {
      clerkId: userId,
    });

    if (foundUser) {
      const mailOptions = {
        from: formData?.userEmail,
        to: formData?.userEmail,
        subject: "Your Email Integration is Complete - Start Your Campaign!",
        html: `
        <!DOCTYPE html>
        <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                :root {
                    --primary-color: #E1B177;
                    --secondary-color: #212121;
                    --success-color: #22c55e;
                    --background-color: #f8fafc;
                    --text-color: #334155;
                }
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.7; color: var(--text-color); background-color: var(--background-color); padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; }
                .header { background: linear-gradient(135deg, var(--primary-color), var(--text-color)); padding: 40px 20px; text-align: center; color: white; }
                .header h1 { font-size: 24px; font-weight: 700; margin-bottom: 10px; }
                .content { padding: 32px 24px; }
                .button { display: inline-block; padding: 12px 24px; margin: 8px; text-decoration: none; border-radius: 6px; font-weight: 600; }
                .primary-button { background-color: var(--primary-color); color: white; }
                .secondary-button { background-color: white; color: var(--primary-color); border: 2px solid var(--primary-color); }
                .footer { background-color: #f8fafc; padding: 24px; text-align: center; font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div>✓</div>
                    <h1>Integration Complete!</h1>
                    <p>Your email setup is ready to go</p>
                </div>
                <div class="content">
                    <p>Hello ${foundUser?.fullname},</p>
                    <p>Great news! Your QUIKSBOT email integration is now active and ready to power up your communication strategy.</p>
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${BASE_URL}/email-campaign" class="button primary-button">Launch First Campaign</a>
                        <a href="${BASE_URL}/dashboard" class="button secondary-button">View Dashboard</a>
                    </div>
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} QUIKSBOT. All rights reserved.</p>
                    <p>Connected Email: ${formData?.userEmail}</p>
                </div>
            </div>
        </body>
        </html>`,
      };

      await onMailer(
        {
          host: formData.host,
          port: formData.port,
          secure: formData.secure,
          userEmail: formData.userEmail,
          password: formData.password,
        },
        mailOptions as any
      );

      await fetchMutation(api.mail.upsertMail, {
        userId: foundUser._id as any,
        host: formData.host,
        port: formData.port,
        secure: formData.secure,
        userEmail: formData.userEmail,
        password: formData.password,
      });
    }
    return {
      success: true,
    };
  } catch (err) {
    console.error("error occurs while trying to update or set user mailOption");
    return {
      success: false,
    };
  }
};
