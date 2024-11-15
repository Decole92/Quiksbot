"use server";
import nodemailer from "nodemailer";
import prisma from "../../../prisma/client";
import { auth } from "@clerk/nextjs/server";
import type { ChatBot, Customer, botType } from "@prisma/client";
import { revalidatePath } from "next/cache";

type MailOption = {
  from: string | undefined;
  to: string;
  subject: string;
  html: string;
};

export const getCustomers = async (userId: string): Promise<any[]> => {
  auth().protect();
  if (!userId) throw new Error("userId is not provided");
  try {
    const customers = await prisma.customer.findMany({
      where: {
        Chatbot: {
          User: {
            clerkId: userId,
          },
        },
      },
      include: {
        chatRoom: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        Chatbot: {
          select: {
            name: true,
          },
        },
      },
    });

    const customerContacts = customers
      .filter((customer) => customer?.name !== "guest")
      .map((customer) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        location: `${customer?.city}, ${customer?.country}`,
        type: "contact",
        createdAt: customer.chatRoom[0]?.createdAt.toISOString(),
        acquired: customer.Chatbot?.name,
      }));

    const appointmentClients = await prisma.appointmentClient.findMany({
      where: {
        appointment: {
          chatbot: {
            User: {
              clerkId: userId,
            },
          },
        },
      },
      include: {
        appointment: {
          include: {
            chatbot: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const appointmentContacts = appointmentClients.map((client) => ({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      location: null, // Replace with null
      type: "appointment",
      createdAt: client.createdAt.toISOString(),
      acquired: client?.appointment?.chatbot?.name!,
    }));

    return [...customerContacts, ...appointmentContacts];
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
};

export const getUserCustomers = async (userId: string) => {
  if (!userId) return;

  try {
    const userWithCustomers = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        ChatBot: {
          include: {
            customer: {
              include: {
                chatRoom: {
                  include: {
                    message: true,
                  },
                  orderBy: {
                    createdAt: "asc",
                  },
                },
              },
            },
          },
        },
      },
    });

    // Process customers and update the `live` status if `liveExpiry` is over 30 minutes ago
    const customers =
      userWithCustomers?.ChatBot.flatMap((chatBot: any) =>
        chatBot?.customer.map(async (customer: any) => {
          const chatRoom = customer.chatRoom[0]; // Assuming there's one ChatRoom per customer

          const lastMessageTime =
            chatRoom.message[chatRoom.message.length - 1]?.createdAt;

          const now = new Date();
          const liveExpiry = new Date(lastMessageTime);

          const thirtyMinutesInMs = 30 * 60 * 1000;
          if (now.getTime() - liveExpiry.getTime() > thirtyMinutesInMs) {
            await prisma.chatRoom.update({
              where: { id: chatRoom.id },
              data: { live: false },
            });
            chatRoom.live = false;
          }

          return {
            ...customer,
            ...chatBot,
          };
        })
      ) || [];

    // Wait for all promises to resolve
    const resolvedCustomers = await Promise.all(customers);

    console.log("this is customer from backend", resolvedCustomers);
    return resolvedCustomers.sort((a: any, b: any) => {
      const dateA = new Date(a.chatRoom[0]?.createdAt || 0);
      const dateB = new Date(b.chatRoom[0]?.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (err) {
    console.log("Error fetching customers and chat data:", err);
  }
};

export const viewMessage = async (id: string) => {
  const { userId } = auth();
  if (!userId) return;

  try {
    const view = prisma.chatRoom.findUnique({
      where: {
        id: id,
      },
      include: {
        Customer: true,
        message: true,
      },
    });
    //console.log("view", view);
    return view;
  } catch (err) {
    throw new Error("error occurs while fetching chatroom");
  }
};
export const updateChatRoomMode = async (id: string) => {
  if (!id) return;

  try {
    const update = prisma.chatRoom?.update({
      where: {
        id: id,
      },
      data: {
        live: false,
      },
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
  // // host: "smtp.gmail.com",
  // host: "smtp.hostinger.com",
  // port: 465,
  // secure: true,
  // auth: {
  //   user: process.env.NODE_MAILER_EMAIL,
  //   pass: process.env.NODE_MAILER_GMAIL_APP_PASSWORD,
  // },

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
    // mailOptions
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

            <div class="footer" style="
              margin-top: 20px;
              text-align: center;
              font-size: 0.8em;
              color: #777;
            ">
            <p>© 2023 QUIKSBOT. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    };
    const mailOptions = customMailOption
      ? customMailOption
      : defaultMailOptions;

    // const sendMailPromise = () =>
    //   new Promise((resolve, reject) => {
    //     transporter.sendMail(mailOptions, function (error, info) {
    //       if (error) {
    //         console.log(error);
    //         reject(error);
    //       } else {
    //         console.log("Email sent: " + info.response);
    //         resolve(info.response);
    //       }
    //     });
    //   });

    // await sendMailPromise();
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("Error sending email:", err);
    throw new Error("Failed to send email");
  }
};

export const chartBarData = async () => {
  const { userId } = await auth();
  if (!userId) return;
  try {
    const user = await prisma.user.findFirst({
      where: {
        clerkId: userId,
      },
    });
    const chatbots = await prisma.chatBot.findMany({
      where: {
        userId: user?.id,
      },
      include: {
        customer: {
          include: {
            chatRoom: {
              select: {
                createdAt: true,
              },
            },
          },
        },
      },
    });
    console.log("this is chatbots from server", chatbots);

    // Process the data to match the chart format
    const chartData = chatbots?.reduce((acc: any, chatbot: any) => {
      chatbot?.customer?.forEach((customer: any) => {
        customer.chatRoom.forEach((chatRoom: any) => {
          const month = chatRoom.createdAt.toISOString().slice(0, 7); // Get YYYY-MM format
          const botName = chatbot.name;

          // Find or create the month entry
          let monthEntry = acc.find((entry: any) => entry.date === month);
          if (!monthEntry) {
            monthEntry = { date: month };
            acc.push(monthEntry);
          }

          // Increment the count for the specific chatbot
          monthEntry[botName as string] =
            ((monthEntry[botName as string] || 0) as number) + 1;
        });
      });

      return acc;
    }, []);

    const heatmapData = chatbots.flatMap((chatbot: any) =>
      chatbot.customer
        .filter((customer: Customer) => customer.lat && customer.lng) // Ensure lat/lng are present
        .map((customer: Customer) => ({
          lat: parseFloat(customer.lat!),
          lng: parseFloat(customer.lng!),
        }))
    );

    return { chartData, heatmapData };
  } catch (error) {
    console.error("Error fetching chart data:", error);
  }
};

export const updateBotSettings = async (
  selectedModel: any,
  getInfoBeforeChat: boolean,
  id: string
) => {
  const { userId } = await auth();

  if (!userId)
    throw new Error(
      "can't find a userId in the server side for updateBotsettings"
    );

  try {
    const updateSettings = await prisma.chatBot.update({
      where: { id: id },
      data: {
        chatModel: selectedModel,
        getDetails: getInfoBeforeChat,
      },
    });

    revalidatePath(`/edit-chatbot/${id}`);
    return { updateSettings, completed: true };
  } catch (err) {
    console.log(
      "error has occur while trying to update updateBotsettings from server side",
      err
    );
  }
};

export const adjustBotType = async (botType: botType, id: string) => {
  auth().protect();

  if (!id || !botType) throw new Error("couldn't find chabotId or  botType");

  try {
    const updateBot = await prisma.chatBot.update({
      where: {
        id: id,
      },
      data: {
        botType: botType,
      },
    });
    const existingAppointment = await prisma.appointment.findUnique({
      where: { chatbotId: id },
    });

    if (!existingAppointment && botType === "Services") {
      await prisma.appointment.create({
        data: {
          chatbot: { connect: { id } },
        },
      });
    }

    console.log("Bot type adjusted successfully:", updateBot);
  } catch (err) {
    console.log("error has occur while trying to adjustBotType", err);
  }
};
