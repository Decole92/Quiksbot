"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "../../../prisma/client";
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
  const userId = auth();

  if (!userId || !formData) throw new Error("not userId or formdata found!");
  console.log("formData", formData);
  console.log("userId", userId?.userId);

  try {
    const foundUser = await prisma.user.findUnique({
      where: { clerkId: userId?.userId! },
    });

    if (foundUser) {
      console.log("foundUser", foundUser);

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
            <!--[if gte mso 9]>
            <xml>
                <o:OfficeDocumentSettings>
                    <o:AllowPNG/>
                    <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
            </xml>
            <![endif]-->
            <style>
                :root {
                    --primary-color: #E1B177;
                    --secondary-color: #212121;
                    --success-color: #22c55e;
                    --background-color: #f8fafc;
                    --text-color: #334155;
                    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                }
        
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
        
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.7;
                    color: var(--text-color);
                    background-color: var(--background-color);
                    padding: 20px;
                }
        
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: var(--shadow-md);
                }
        
                .header {
                    background: linear-gradient(135deg, var(--primary-color), var(--text-color));
                    padding: 40px 20px;
                    text-align: center;
                    color: white;
                }
        
                .header h1 {
                    font-size: 24px;
                    font-weight: 700;
                    margin-bottom: 10px;
                }
        
                .success-icon {
                    width: 60px;
                    height: 60px;
                    background-color: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    margin: 0 auto 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
        
                .content {
                    padding: 32px 24px;
                }
        
                .welcome-text {
                    font-size: 18px;
                    margin-bottom: 24px;
                    color: var(--text-color);
                }
        
                .feature-card {
                    background-color: #f8fafc;
                    border-radius: 8px;
                    padding: 24px;
                    margin: 24px 0;
                    border: 1px solid #e2e8f0;
                }
        
                .feature-card h3 {
                    font-size: 18px;
                    margin-bottom: 16px;
                    color: var(--primary-color);
                }
        
                .feature-list {
                    list-style-type: none;
                }
        
                .feature-list li {
                    margin-bottom: 12px;
                    padding-left: 24px;
                    position: relative;
                }
        
                .feature-list li:before {
                    content: "✓";
                    color: var(--success-color);
                    position: absolute;
                    left: 0;
                }
        
                .button-container {
                    text-align: center;
                    margin: 32px 0;
                }
        
                .button {
                    display: inline-block;
                    padding: 12px 24px;
                    margin: 8px;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }
        
                .primary-button {
                    background-color: var(--primary-color);
                    color: white;
                }
        
                .primary-button:hover {
                    background-color: var(--secondary-color);
                    transform: translateY(-1px);
                    box-shadow: var(--shadow-sm);
                }
        
                .secondary-button {
                    background-color: white;
                    color: var(--primary-color);
                    border: 2px solid var(--primary-color);
                }
        
                .secondary-button:hover {
                    background-color: var(--primary-color);
                    color: white;
                    transform: translateY(-1px);
                    box-shadow: var(--shadow-sm);
                }
        
                .support-text {
                    text-align: center;
                    padding: 20px;
                    background-color: #f8fafc;
                    border-radius: 8px;
                    margin-top: 24px;
                }
        
                .footer {
                    background-color: #f8fafc;
                    padding: 24px;
                    text-align: center;
                    font-size: 14px;
                    color: #64748b;
                    border-top: 1px solid #e2e8f0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="success-icon">✓</div>
                    <h1>Integration Complete!</h1>
                    <p>Your email setup is ready to go</p>
                </div>
        
                <div class="content">
                    <p class="welcome-text">Hello ${foundUser?.fullname},</p>
        
                    <p>Great news! Your QUIKSBOT email integration is now active and ready to power up your communication strategy.</p>
        
                    <div class="feature-card">
                        <h3>Get Started With</h3>
                        <ul class="feature-list">
                            <li>Smart email campaign creation</li>
                            <li>Automated sequence builder</li>
                            <li>Real-time analytics dashboard</li>
                            <li>Custom template designer</li>
                        </ul>
                    </div>
        
                    <div class="button-container">
                        <a href="${BASE_URL}/email-campaign" class="button primary-button">Launch First Campaign</a>
                        <a href="${BASE_URL}/dashboard" class="button secondary-button">View Dashboard</a>
                    </div>
        
                    <div class="support-text">
                        <p>Need assistance? Our support team is available 24/7 to help you make the most of your email integration.</p>
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
        mailOptions // Your custom mail options if needed
      );

      const findOld = await prisma.mail.findUnique({
        where: {
          userId: foundUser?.id,
        },
      });

      if (findOld) {
        await prisma.mail.update({
          where: {
            userId: foundUser?.id,
          },
          data: {
            host: formData?.host,
            port: formData?.port,
            secure: formData?.secure,
            userEmail: formData?.userEmail,
            password: formData?.password,
          },
        });
      } else {
        const addMailOption = await prisma.mail.create({
          data: {
            host: formData?.host,
            port: formData?.port,
            secure: formData?.secure,
            userEmail: formData?.userEmail,
            password: formData?.password,
          },
        });
        if (addMailOption) {
          await prisma.user.update({
            where: {
              id: foundUser?.id,
            },
            data: {
              MailId: addMailOption?.id,
              Mail: {
                connect: { id: addMailOption?.id },
              },
            },
          });
        }
      }
    }
    return {
      success: true,
    };
  } catch (err) {
    console.log("error occurs while trying to update or set user mailOption");
    return {
      success: false,
    };
  }
};
