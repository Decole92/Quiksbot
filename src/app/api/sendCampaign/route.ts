import { NextResponse } from "next/server";
import { htmlToText } from "html-to-text";
import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { Contact } from "../../../../typing";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { rawContent, contactList, subject } = await req.json();

  if (!userId || !contactList || !rawContent || !subject) {
    throw new Error("no material included");
  }
  try {
    const foundUser = await fetchQuery(api.users.getUserWithSubscription, {
      clerkId: userId,
    });

    const userMail = foundUser?.mail ?? null;
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

    await fetchMutation(api.campaigns.createCampaign, {
      subject: subject,
      template: JSON.stringify(plainTextContent),
      customers: contactList.map((c: Contact) => c.email),
      userId: userId,
      from: userMail?.userEmail,
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
