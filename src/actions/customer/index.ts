"use server";
import nodemailer from "nodemailer";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

type MailOption = {
  from: string | undefined;
  to: string;
  subject: string;
  html: string;
};

export const getCustomers = async (userId: string): Promise<any[]> => {
  const { userId: authUserId } = await auth();
  if (!authUserId) throw new Error("Unauthorized");
  if (!userId) throw new Error("userId is not provided");
  try {
    const user = await fetchQuery(api.users.getUserByClerkId, { clerkId: userId });
    if (!user) return [];

    const allRooms = await fetchQuery(api.chat.getAllChatRoomsForUser, {
      userId: user._id as any,
    });

    const customerContacts = allRooms
      .filter(
        (room: any) =>
          room.Customer?.email !== "guest@mail.com" && room.Customer?.name !== "guest"
      )
      .map((room: any) => ({
        id: room.Customer?.id,
        name: room.Customer?.name,
        email: room.Customer?.email,
        location: `${room.Customer?.city ?? ""}, ${room.Customer?.country ?? ""}`,
        type: "contact",
        createdAt: room.createdAt ? new Date(room.createdAt).toISOString() : null,
        acquired: room.bot?.name,
      }));

    return customerContacts;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
};

export const getUserCustomers = async (userId: string) => {
  if (!userId) return;

  try {
    const user = await fetchQuery(api.users.getUserByClerkId, { clerkId: userId });
    if (!user) return [];

    const allRooms = await fetchQuery(api.chat.getAllChatRoomsForUser, {
      userId: user._id as any,
    });

    // Group rooms by customer so UI components receive customer-level data
    // with a chatRoom array (matching the shape expected by ChatCard / ConversationMenu)
    const customerMap = new Map<string, any>();
    for (const room of allRooms as any[]) {
      const customerId = room.Customer?.id as string;
      if (!customerId) continue;
      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          id: customerId,
          name: room.Customer?.name,
          email: room.Customer?.email,
          phone: room.Customer?.phone,
          chatbotId: room.Customer?.chatbotId,
          botIcon: room.bot?.icon || room.bot?.botIcon || null,
          chatRoom: [],
        });
      }
      customerMap.get(customerId)!.chatRoom.push({
        id: room.id,
        createdAt: room.createdAt,
        live: room.live,
        message: room.message ?? [],
      });
    }

    return Array.from(customerMap.values());
  } catch (err) {
    throw new Error("Error fetching customers and chat data:", err as any);
  }
};

export const viewMessage = async (id: string) => {
  const { userId } = await auth();
  if (!userId) return;

  try {
    const view = await fetchQuery(api.chat.getChatRoom, {
      chatRoomId: id as any,
    });

    return view;
  } catch (err) {
    throw new Error("error occurs while fetching chatroom");
  }
};

export const updateChatRoomMode = async (id: string) => {
  if (!id) return;

  try {
    const update = await fetchMutation(api.chat.markRoomInactive, {
      chatRoomId: id as any,
    });

    return update;
  } catch (err) {
    throw new Error("error occurs while fetching chatroom");
  }
};

export const onMailer = async (
  config: {
    host?: string;
    port?: number;
    secure?: boolean;
    email?: string;
    name?: string;
    userEmail?: string;
    password?: string;
  },
  customMailOption?: MailOption
) => {
  try {
    const transporter = nodemailer.createTransport({
      host: config?.host ? config.host : "smtp.hostinger.com",
      port: config?.port ? config.port : 465,
      secure: config?.secure ? config.secure : true,
      auth: {
        user: config?.userEmail
          ? config?.userEmail
          : process.env.NODE_MAILER_EMAIL,
        pass: config?.password
          ? config?.password
          : process.env.NODE_MAILER_GMAIL_APP_PASSWORD,
      },
    });

    const defaultMailOptions = {
      from: process.env.NODE_MAILER_EMAIL,
      to: config?.email,
      subject: "🔔 Urgent: Live Chat Support Required",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Live Chat Support Required</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f9f9f9; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0;">Live Support Request</h2>
              <p style="color: #555;">
                A customer on <strong>${config?.name} QUIKSBOT</strong> has initiated real-time chat support and is waiting for your response.
              </p>
              <p style="color: #555;">
                <strong>Important:</strong> The real-time mode will automatically deactivate after 30 minutes of customer inactivity.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://quiksbot.com/chatlogs"
                   style="background-color: #E1B177;
                          color: white;
                          padding: 12px 25px;
                          text-decoration: none;
                          border-radius: 5px;
                          display: inline-block;
                          font-weight: bold;
                          box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  Join Chat Now
                </a>
              </div>
              <div style="font-size: 14px; color: #777; border-top: 1px solid #eee; padding-top: 15px; margin-top: 20px;">
                <p>This is an automated notification from QUIKSBOT Support System. Please do not reply to this email.</p>
              </div>
            </div>

            <div class="footer" style="margin-top: 20px; text-align: center; font-size: 0.8em; color: #777;">
            <p>© 2023 QUIKSBOT. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    };
    const mailOptions = customMailOption
      ? customMailOption
      : defaultMailOptions;

    await transporter.sendMail(mailOptions);

    return true;
  } catch (err) {
    console.error("Error sending email:", err);
    throw new Error("Failed to send email");
  }
};

export const chartBarData = async () => {
  const { userId } = await auth();
  if (!userId) return;
  try {
    const user = await fetchQuery(api.users.getUserByClerkId, { clerkId: userId });
    if (!user) return { chartData: [], heatmapData: [] };

    const allRooms = await fetchQuery(api.chat.getAllChatRoomsForUser, {
      userId: user._id as any,
    });

    const chartData = allRooms.reduce((acc: any, room: any) => {
      const month = new Date(room.createdAt).toISOString().slice(0, 7);
      const rawName = room.bot?.name;
      if (!rawName) return acc;
      // Sanitize for use as CSS variable name (replace spaces/special chars)
      const botName = rawName.replace(/[^a-zA-Z0-9_-]/g, "_");

      let monthEntry = acc.find((entry: any) => entry.date === month);
      if (!monthEntry) {
        monthEntry = { date: month };
        acc.push(monthEntry);
      }

      monthEntry[botName] = ((monthEntry[botName] || 0) as number) + 1;

      return acc;
    }, []);

    const heatmapData = allRooms
      .filter((room: any) => room.Customer?.lat && room.Customer?.lng)
      .map((room: any) => ({
        lat: parseFloat(room.Customer.lat),
        lng: parseFloat(room.Customer.lng),
      }));

    return { chartData, heatmapData };
  } catch (error) {
    console.error("Error fetching chart data:", error);
  }
};

export const updateBotSettings = async (
  selectedModel: any,
  getInfoBeforeChat: boolean,
  id: string,
  liveAgent: boolean
) => {
  const { userId } = await auth();

  if (!userId)
    throw new Error(
      "can't find a userId in the server side for updateBotsettings"
    );

  try {
    await fetchMutation(api.chatbots.updateChatModel, {
      id: id as any,
      chatModel: selectedModel,
    });
    await fetchMutation(api.chatbots.updateGetDetails, {
      id: id as any,
      getDetails: getInfoBeforeChat,
    });
    await fetchMutation(api.chatbots.updateLiveAgent, {
      id: id as any,
      liveAgent,
    });

    revalidatePath(`/edit-chatbot/${id}`);
    return { completed: true };
  } catch (err) {
    throw new Error(
      "error has occur while trying to update updateBotsettings from server side",
      err as any
    );
  }
};

export const adjustBotType = async (botType: string, id: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (!id || !botType) throw new Error("couldn't find chabotId or  botType");

  try {
    await fetchMutation(api.chatbots.updateBotType, {
      id: id as any,
      botType: botType as any,
    });

    if (botType === "Appointment") {
      await fetchMutation(api.appointments.getOrCreateAppointment, {
        chatbotId: id as any,
      });
    }
  } catch (err) {
    throw new Error(
      "error has occur while trying to adjustBotType",
      err as any
    );
  }
};
