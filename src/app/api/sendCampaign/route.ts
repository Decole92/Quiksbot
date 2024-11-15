import { NextResponse } from "next/server";
import { htmlToText } from "html-to-text";
import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";
import { auth } from "@clerk/nextjs/server";
import prisma from "../../../../prisma/client";
import { Contact } from "../../../../typing";

export async function POST(req: Request) {
  auth().protect();
  const { userId } = auth();

  const { rawContent, contactList, subject } = await req.json();

  if (!userId || !contactList || !rawContent || !subject) {
    throw new Error("no material included");
  }
  // console.log("data received", userId, contactList, rawContent, subject);
  try {
    const foundUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });
    const userMail = await prisma.mail.findUnique({
      where: { userId: foundUser?.id },
    });
    if (!userMail) throw new Error("SMTP configuration not found");

    const transporter = nodemailer.createTransport({
      host: userMail.host,
      port: userMail.port,
      secure: userMail.secure,
      auth: {
        user: userMail.userEmail,
        pass: userMail.password,
      },
    });
    let htmlContent = rawContent.trim().replace(/^"|"$/g, "");

    const promises = contactList.map((contact: Contact) =>
      transporter.sendMail({
        from: userMail.userEmail,
        to: contact.email,
        subject: subject,
        html: htmlContent,
      })
    );

    await Promise.all(promises);
    const plainTextContent = htmlToText(htmlContent, {
      wordwrap: 130,
    });

    await prisma.campaign.create({
      data: {
        subject: subject,
        template: JSON.stringify(plainTextContent),
        customers: contactList.map((c: Contact) => c.email),
        userId: userId,
        from: userMail?.userEmail,
      },
    });
    revalidatePath("/email-campaign");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in fetch-links API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
