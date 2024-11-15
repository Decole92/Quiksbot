"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "../../../prisma/client";
import { AppointmentData, BusinessHoursState } from "../../../typing";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { getBot } from "../bot";
import { onMailer } from "../customer";
import { BASE_URL } from "../../../constant/url";

export const getAppointmentType = async (id: string) => {
  if (!id) throw new Error("no chatbot Id found!");
  try {
    const appointmentType = await prisma.appointmentType.findMany({
      where: {
        appointment: {
          chatbotId: id,
        },
      },
    });

    return appointmentType;
  } catch (err) {
    console.log("error occurs while trying to get appointmentType", err);
  }
};

export const addNewAppointment = async (
  title: string,
  description: string,
  id: string
) => {
  auth().protect();
  if (!title || !id) throw new Error("there's no title or id found");
  try {
    const add = await prisma.appointmentType.create({
      data: {
        typeName: title,
        description: description,
        appointment: {
          connect: {
            chatbotId: id,
          },
        },
      },
    });
    return add;
  } catch (err) {
    console.log("error has occur while add new appointment type", err);
  }
};

export const delAppointmentType = async (id: string) => {
  auth().protect();
  if (!id) throw new Error("there's no valid id");
  try {
    const add = await prisma.appointmentType.delete({
      where: {
        id: id,
      },
    });
    return add;
  } catch (err) {
    console.log("error has occur while deleting  appointment type", err);
  }
};

export const getBusinessHours = async (id: string) => {
  try {
    const hours = await prisma.businessHours.findMany({
      where: { appointment: { chatbotId: id } },
      select: { day: true, startTime: true, endTime: true, isOpen: true },
    });

    return hours.reduce((acc: BusinessHoursState, hour) => {
      acc[hour.day as keyof BusinessHoursState] = {
        startTime: hour.startTime,
        endTime: hour.endTime,
        isOpen: hour.isOpen,
      };
      return acc;
    }, {} as BusinessHoursState);
  } catch (error) {
    console.error("Error fetching business hours:", error);
    return {};
  }
};
export async function updateBusinessHours(
  id: string,
  businessHours: BusinessHoursState[]
) {
  try {
    console.log("this is chatbotId", id, "this is businesshour", businessHours);

    // Find existing appointment
    let appointment = await prisma.appointment.findFirst({
      where: {
        chatbotId: id,
      },
    });

    // If no appointment exists, create one
    if (!appointment) {
      appointment = await prisma.appointment.create({
        data: {
          chatbot: {
            connect: {
              id: id,
            },
          },
        },
      });
    }

    // Delete existing business hours for this appointment
    await prisma.businessHours.deleteMany({
      where: {
        appointmentId: appointment.id,
      },
    });

    // Create new business hours
    await prisma.businessHours.createMany({
      data: businessHours.map((hour: any) => ({
        day: hour.day,
        startTime: hour.startTime,
        endTime: hour.endTime,
        isOpen: hour.isOpen,
        appointmentId: appointment?.id,
      })),
    });

    revalidatePath(`/dashboard/edit-chatbot/${id}`);

    return { success: true };
  } catch (error) {
    console.error("Error updating business hours:", error);
    throw new Error("Failed to update business hours");
  }
}
export const createAppointment = async (
  appointmentData: AppointmentData,
  id: string
) => {
  if (!appointmentData || !id)
    throw new Error("There's no appointment data or id fetched!");

  const confirmationToken = randomBytes(32).toString("hex");
  const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
  try {
    const getUser = await getBot(id);
    const appointment = await getAppointmentType(id);
    if (!getUser) throw new Error("no getUser by chatbot id found");
    if (!appointment) throw new Error("no appointment found with chatbot Id");
    console.log("start newAppointment");
    const newAppointment = await prisma.appointmentClient.create({
      data: {
        name: appointmentData.name,
        email: appointmentData.email,
        status: appointmentData.status ?? "PENDING",
        appointmentId: appointment[0].appointmentId,
        selectedTime: appointmentData.selectedTime,
        selectedDate: appointmentData?.appointmentDate,
        appointmentType: appointmentData.appointmentType,
        confirmationToken: confirmationToken,
        tokenExpiry: tokenExpiry,
        tokenUsed: false,
      },
    });

    if (!newAppointment) throw new Error("error didn't insert newAppointment");

    const date = new Date(appointmentData?.appointmentDate);

    const formattedDate = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);

    const mailOptions = {
      from: process.env.NODE_MAILER_EMAIL,
      to: getUser?.User?.email!,
      subject: "📅 New Appointment Request via QUIKSBOT",
      html: `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title> 📅 New Appointment Request</title>
      </head>
      <body style="
        font-family: system-ui, -apple-system, sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 0;
        background-color: #f3f4f6;
      ">
        <div style="max-width: 600px; margin: 40px auto; padding: 0 20px;">
          <!-- Main Card -->
          <div style="
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          ">
            <!-- Logo Section -->
            <div style="text-align: center; padding: 24px 20px 0;">
              <img src="${
                process.env.LOGO_URL
              }" alt="QUIKSBOT Logo" style="max-height: 40px;">
            </div>
      
            <!-- Header -->
            <div style="padding: 20px 24px;">
              <h1 style="
                color: #111827;
                font-size: 24px;
                font-weight: 600;
                text-align: center;
                margin: 0;
              ">New Appointment Request</h1>
            </div>
      
            <!-- Content -->
            <div style="padding: 0 24px;">
              <p style="color: #374151; margin-bottom: 24px;">
                Hello <strong>${getUser?.User?.fullname}</strong>,
              </p>
              <p style="color: #374151; margin-bottom: 24px;">
                You have received a new appointment request through your ${
                  getUser?.name
                } chatbot.
              </p>
      
              <!-- Appointment Details -->
              <div style="margin-bottom: 32px;">
                <!-- Calendar Row -->
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                  <div style="
                    width: 20px;
                    height: 20px;
                    margin-right: 16px;
                    color: #6B7280;
                  ">
                    📅
                  </div>
                  <div>
                    <p style="margin: 0; font-weight: 500; color: #111827;">Date</p>
                    <p style="margin: 0; color: #6B7280; font-size: 14px;">${formattedDate}</p>
                  </div>
                </div>
      
                <!-- Clock Row -->
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                  <div style="
                    width: 20px;
                    height: 20px;
                    margin-right: 16px;
                    color: #6B7280;
                  ">
                    ⏰
                  </div>
                  <div>
                    <p style="margin: 0; font-weight: 500; color: #111827;">Time</p>
                    <p style="margin: 0; color: #6B7280; font-size: 14px;">${
                      appointmentData?.selectedTime
                    }</p>
                  </div>
                </div>
      
                <!-- User Row -->
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                  <div style="
                    width: 20px;
                    height: 20px;
                    margin-right: 16px;
                    color: #6B7280;
                  ">
                    👤
                  </div>
                  <div>
                    <p style="margin: 0; font-weight: 500; color: #111827;">Client</p>
                    <p style="margin: 0; color: #6B7280; font-size: 14px;">${
                      appointmentData?.name
                    }</p>
                  </div>
                </div>
      
                <!-- Service Row -->
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                  <div style="
                    width: 20px;
                    height: 20px;
                    margin-right: 16px;
                    color: #6B7280;
                  ">
                    🎯
                  </div>
                  <div>
                    <p style="margin: 0; font-weight: 500; color: #111827;">Service</p>
                    <p style="margin: 0; color: #6B7280; font-size: 14px;">${
                      appointmentData?.appointmentType
                    }</p>
                  </div>
                </div>
              </div>
      
              <!-- Buttons -->
              <div style="text-align: center; padding: 24px 0;">
                <a href="${BASE_URL}/appointmentToken/${confirmationToken}?confirm=true" 
                   style="
                    display: inline-block;
                    background-color: #E1B177;
                    color: white;
                    padding: 12px 24px;
                    border-radius: 6px;
                    text-decoration: none;
                    font-weight: 500;
                    margin-bottom: 12px;
                    width: 100%;
                    text-align: center;
                    box-sizing: border-box;
                   ">
                  Confirm Appointment
                </a>
                <a href="${BASE_URL}/appointmentToken/${confirmationToken}?confirm=false"
                   style="
                    display: inline-block;
                    background-color: white;
                    color: #374151;
                    padding: 12px 24px;
                    border-radius: 6px;
                    text-decoration: none;
                    font-weight: 500;
                    border: 1px solid #E5E7EB;
                    width: 100%;
                    text-align: center;
                    box-sizing: border-box;
                   ">
                Cancel Appointment
                </a>
              </div>
      
              <!-- Warning Note -->
              <p style="
                color: #6B7280;
                font-size: 14px;
                margin-top: 24px;
                padding: 16px;
                background-color: #F3F4F6;
                border-radius: 6px;
              ">
                <strong>Note:</strong> This appointment request will automatically expire after 24 hours if no action is taken.
              </p>
            </div>
      
            <!-- Footer -->
            <div style="
              border-top: 1px solid #E5E7EB;
              margin-top: 24px;
              padding: 24px;
              text-align: center;
              color: #6B7280;
              font-size: 14px;
            ">
              <p style="margin: 0;">This is an automated notification from QUIKSBOT Appointment System.</p>
              <p style="margin: 8px 0 0;">© ${new Date().getFullYear()} QUIKSBOT. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>`,
    };

    await onMailer({}, mailOptions);

    return newAppointment;
  } catch (err) {
    console.log("error occurs while trying to make new appointment 12445");
  }
};

export const appointmentAction = async (
  tokenId: string,
  isConfirm: boolean
) => {
  if (!tokenId) throw new Error("No tokenId found!!!");

  try {
    const appointment = await prisma.appointmentClient.findFirst({
      where: {
        confirmationToken: tokenId,
        status: "PENDING",
        tokenUsed: false,
        tokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (appointment) {
      const date = new Date(appointment?.selectedDate!);

      const formattedDate = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);

      console.log("this is appointment", appointment);

      const appointmentOwner = await prisma.appointment.findFirst({
        where: {
          id: appointment?.appointmentId!,
        },
      });

      console.log("this is appointmentOwner", appointmentOwner);

      const getUser =
        appointmentOwner && (await getBot(appointmentOwner?.chatbotId!));
      console.log("Mail");
      const Mail = getUser?.User?.MailId
        ? await prisma.mail.findUnique({
            where: {
              id: getUser?.User?.MailId!,
            },
          })
        : null;

      const mailOptions = {
        from: getUser?.User?.MailId
          ? Mail?.userEmail
          : process?.env.NODE_MAILER_EMAIL,
        to: appointment?.email,
        subject: "Appointment Confirmed!",
        html: ` <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>✅ Appointment Confirmed</title>
        </head>
        <body style="
          font-family: system-ui, -apple-system, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 0;
          background-color: #f3f4f6;
        ">
          <div style="max-width: 600px; margin: 40px auto; padding: 0 20px;">
            <!-- Main Card -->
            <div style="
              background-color: white;
              border-radius: 12px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            ">
             
        
              <!-- Success Icon -->
              <div style="text-align: center; padding: 20px 0;">
                <div style="
                  background-color: #EEF9F1;
                  width: 64px;
                  height: 64px;
                  border-radius: 32px;
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 32px;
                ">
                  ✅
                </div>
              </div>
        
              <!-- Header -->
              <div style="padding: 20px 24px;">
                <h1 style="
                  color: #111827;
                  font-size: 24px;
                  font-weight: 600;
                  text-align: center;
                  margin: 0;
                ">Appointment Confirmed</h1>
              </div>
        
              <!-- Content -->
              <div style="padding: 0 24px;">
                <p style="color: #374151; margin-bottom: 24px; text-align: center;">
                  Hello <strong>${appointment?.name}</strong>,
                </p>
                <p style="color: #374151; margin-bottom: 24px; text-align: center;">
                  Your appointment has been confirmed. Here are your appointment details:
                </p>
        
                <!-- Appointment Details -->
                <div style="
                  margin: 32px 0;
                  padding: 24px;
                  background-color: #F9FAFB;
                  border-radius: 8px;
                ">
                  <!-- Calendar Row -->
                  <div style="display: flex; align-items: center; margin-bottom: 16px;">
                    <div style="
                      width: 20px;
                      height: 20px;
                      margin-right: 16px;
                      color: #6B7280;
                    ">
                      📅
                    </div>
                    <div>
                      <p style="margin: 0; font-weight: 500; color: #111827;">Date</p>
                      <p style="margin: 0; color: #6B7280; font-size: 14px;">${formattedDate}</p>
                    </div>
                  </div>
        
                  <!-- Clock Row -->
                  <div style="display: flex; align-items: center; margin-bottom: 16px;">
                    <div style="
                      width: 20px;
                      height: 20px;
                      margin-right: 16px;
                      color: #6B7280;
                    ">
                      ⏰
                    </div>
                    <div>
                      <p style="margin: 0; font-weight: 500; color: #111827;">Time</p>
                      <p style="margin: 0; color: #6B7280; font-size: 14px;">${
                        appointment?.selectedTime
                      }</p>
                    </div>
                  </div>
        
                  <!-- Service Row -->
                  <div style="display: flex; align-items: center; margin-bottom: 16px;">
                    <div style="
                      width: 20px;
                      height: 20px;
                      margin-right: 16px;
                      color: #6B7280;
                    ">
                      🎯
                    </div>
                    <div>
                      <p style="margin: 0; font-weight: 500; color: #111827;">Service</p>
                      <p style="margin: 0; color: #6B7280; font-size: 14px;">${
                        appointment?.appointmentType
                      }</p>
                    </div>
                  </div>
        
                  <!-- Business Row -->
                  <div style="display: flex; align-items: center;">
                    <div style="
                      width: 20px;
                      height: 20px;
                      margin-right: 16px;
                      color: #6B7280;
                    ">
                      🏢
                    </div>
                    <div>
                      <p style="margin: 0; font-weight: 500; color: #111827;">Appointment</p>
                      <p style="margin: 0; color: #6B7280; font-size: 14px;">${
                        getUser?.name
                      } </p>
                    </div>
                  </div>
                </div>
        
                <!-- Additional Info -->
                <div style="
                  margin-top: 24px;
                  padding: 16px;
                  background-color: #F3F4F6;
                  border-radius: 6px;
                  border-left: 4px solid #E1B177;
                ">  
                  <p style="color: #374151; font-size: 14px; margin: 0;">
                    <strong>Need to make changes?</strong><br>
                    If you need to reschedule or cancel your appointment, please contact us directly or respond to this email.
                  </p>
                </div>
              </div>
        
              <!-- Footer -->
              <div style="
                border-top: 1px solid #E5E7EB;
                margin-top: 24px;
                padding: 24px;
                text-align: center;
                color: #6B7280;
                font-size: 14px;
              ">
               
                <p style="margin: 8px 0 0;">© ${new Date().getFullYear()} QUIKSBOT. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>`,
      };
      // <p style="margin: 0;">Thank you for choosing ${g?.name}!</p>
      const updatedAppointment = await prisma.appointmentClient.update({
        where: { id: appointment?.id! },
        data: {
          status: isConfirm ? "CONFIRMED" : "CANCELLED",
          tokenUsed: true,
        },
      });

      if (!updatedAppointment) throw new Error("cannot updated Appointment!!!");
      console.log("this is mail", Mail);
      Mail
        ? await onMailer(
            {
              host: Mail?.host,
              port: Mail?.port,
              secure: Mail?.secure,
              userEmail: Mail?.userEmail,
              password: Mail?.password,
            },
            mailOptions
          )
        : await onMailer({}, mailOptions);
      //   console.log("updatedAppointment", updatedAppointment);
      return updatedAppointment;
    } else {
      return null;
    }
  } catch (err) {
    console.log(
      "err has occur while trying to confirm or decline appointment",
      err
    );
  }
};
