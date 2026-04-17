"use server";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { getBot } from "../bot";
import { onMailer } from "../customer";
import { BASE_URL } from "../../../constant/url";
import { AppointmentData, BusinessHoursState } from "../../../typing";

type BusinessHourInput = {
  day: string;
  startTime: string;
  endTime: string;
  isOpen: boolean;
};

export const getAppointmentType = async (id: string) => {
  if (!id) throw new Error("no chatbot Id found!");
  try {
    const appointmentTypes = await fetchQuery(api.appointments.getAppointmentTypes, {
      chatbotId: id as any,
    });

    return appointmentTypes;
  } catch (err) {
    throw new Error(
      "error occurs while trying to get appointmentType",
      err as any
    );
  }
};

export const addNewAppointment = async (
  title: string,
  description: string,
  id: string
) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (!title || !id) throw new Error("there's no title or id found");
  try {
    const add = await fetchMutation(api.appointments.addAppointmentType, {
      chatbotId: id as any,
      typeName: title,
      description: description || undefined,
    });
    return add;
  } catch (err) {
    throw new Error(
      "error has occur while add new appointment type",
      (err as any)?.message
    );
  }
};

export const delAppointmentType = async (id: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (!id) throw new Error("there's no valid id");
  try {
    const add = await fetchMutation(api.appointments.deleteAppointmentType, {
      id: id as any,
    });
    return add;
  } catch (err) {
    throw new Error(
      "error has occur while add new appointment type",
      (err as any)?.message
    );
  }
};

export const getBusinessHours = async (
  id: string
): Promise<BusinessHoursState> => {
  try {
    const hours = await fetchQuery(api.appointments.getBusinessHours, {
      chatbotId: id as any,
    });

    const businessHoursState: BusinessHoursState = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    };

    hours.forEach((hour: any) => {
      const day = hour.day as keyof BusinessHoursState;
      if (!businessHoursState[day]) {
        businessHoursState[day] = [];
      }
      businessHoursState[day]?.push({
        startTime: hour.startTime,
        endTime: hour.endTime,
        isOpen: hour.isOpen,
      });
    });

    const DAYS_OF_WEEK = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    DAYS_OF_WEEK.forEach((day) => {
      if (
        !businessHoursState[day as keyof BusinessHoursState] ||
        businessHoursState[day as keyof BusinessHoursState].length === 0
      ) {
        businessHoursState[day as keyof BusinessHoursState] = [
          { startTime: "09:00", endTime: "17:00", isOpen: false },
        ];
      }
    });

    return businessHoursState;
  } catch (error) {
    console.error("Error fetching business hours:", error);
    return {
      monday: [{ startTime: "09:00", endTime: "17:00", isOpen: false }],
      tuesday: [{ startTime: "09:00", endTime: "17:00", isOpen: false }],
      wednesday: [{ startTime: "09:00", endTime: "17:00", isOpen: false }],
      thursday: [{ startTime: "09:00", endTime: "17:00", isOpen: false }],
      friday: [{ startTime: "09:00", endTime: "17:00", isOpen: false }],
      saturday: [{ startTime: "09:00", endTime: "17:00", isOpen: false }],
      sunday: [{ startTime: "09:00", endTime: "17:00", isOpen: false }],
    };
  }
};

export async function updateBusinessHours(
  id: string,
  businessHours: BusinessHourInput[]
): Promise<{ success: true }> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    await fetchMutation(api.appointments.updateBusinessHours, {
      chatbotId: id as any,
      hours: businessHours,
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

    const startTime = new Date(
      `${appointmentData.appointmentDate}T${appointmentData.selectedTime}:00Z`
    ).toISOString();

    const newAppointment = await fetchMutation(api.appointments.createAppointmentClient, {
      name: appointmentData.name,
      email: appointmentData.email,
      status: appointmentData.status ?? "PENDING",
      appointmentId: (appointment as any)[0].appointmentId as any,
      selectedTime: startTime,
      selectedDate: new Date(appointmentData.appointmentDate).getTime(),
      appointmentType: appointmentData.appointmentType,
      confirmationToken: confirmationToken,
      tokenExpiry: tokenExpiry.getTime(),
      tokenUsed: false,
    });

    if (!newAppointment) throw new Error("error didn't insert newAppointment");

    const date = new Date(appointmentData?.appointmentDate);

    const formattedDate = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);

    const mailOptions1 = {
      from: process.env.NODE_MAILER_EMAIL,
      to: appointmentData?.email!,
      subject: "📅 Your Appointment Request is Being Processed",
      html: `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>📅 Appointment Request Received</title>
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
              ">Appointment Request Received</h1>
            </div>

            <!-- Content -->
            <div style="padding: 0 24px;">
              <p style="color: #374151; margin-bottom: 24px; text-align: center;">
                Hello <strong>${appointmentData?.name}</strong>,
              </p>
              <p style="color: #374151; margin-bottom: 24px; text-align: center;">
                We have received your appointment request and it is currently being processed.
              </p>

              <!-- Appointment Details -->
              <div style="margin: 32px 0; padding: 24px; background-color: #F9FAFB; border-radius: 8px;">
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                  <div style="width: 20px; height: 20px; margin-right: 16px; color: #6B7280;">📅</div>
                  <div>
                    <p style="margin: 0; font-weight: 500; color: #111827;">Date</p>
                    <p style="margin: 0; color: #6B7280; font-size: 14px;">${formattedDate}</p>
                  </div>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                  <div style="width: 20px; height: 20px; margin-right: 16px; color: #6B7280;">⏰</div>
                  <div>
                    <p style="margin: 0; font-weight: 500; color: #111827;">Time</p>
                    <p style="margin: 0; color: #6B7280; font-size: 14px;">${appointmentData?.selectedTime}</p>
                  </div>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                  <div style="width: 20px; height: 20px; margin-right: 16px; color: #6B7280;">🎯</div>
                  <div>
                    <p style="margin: 0; font-weight: 500; color: #111827;">Service</p>
                    <p style="margin: 0; color: #6B7280; font-size: 14px;">${appointmentData?.appointmentType}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div style="border-top: 1px solid #E5E7EB; margin-top: 24px; padding: 24px; text-align: center; color: #6B7280; font-size: 14px;">
              <p style="margin: 0;">Thank you for choosing QUIKSBOT!</p>
              <p style="margin: 8px 0 0;">© ${new Date().getFullYear()} QUIKSBOT. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>`,
    };

    const mailOptions = {
      from: process.env.NODE_MAILER_EMAIL,
      to: (getUser as any)?.User?.email!,
      subject: "📅 New Appointment Request via QUIKSBOT",
      html: `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title> 📅 New Appointment Request</title>
      </head>
      <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 40px auto; padding: 0 20px;">
          <div style="background-color: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
            <div style="text-align: center; padding: 24px 20px 0;">
              <img src="${process.env.LOGO_URL}" alt="QUIKSBOT Logo" style="max-height: 40px;">
            </div>
            <div style="padding: 20px 24px;">
              <h1 style="color: #111827; font-size: 24px; font-weight: 600; text-align: center; margin: 0;">New Appointment Request</h1>
            </div>
            <div style="padding: 0 24px;">
              <p style="color: #374151; margin-bottom: 24px;">Hello <strong>${(getUser as any)?.User?.fullname}</strong>,</p>
              <p style="color: #374151; margin-bottom: 24px;">You have received a new appointment request through your ${(getUser as any)?.name} chatbot.</p>
              <div style="margin-bottom: 32px;">
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                  <div style="width: 20px; height: 20px; margin-right: 16px; color: #6B7280;">📅</div>
                  <div>
                    <p style="margin: 0; font-weight: 500; color: #111827;">Date</p>
                    <p style="margin: 0; color: #6B7280; font-size: 14px;">${formattedDate}</p>
                  </div>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                  <div style="width: 20px; height: 20px; margin-right: 16px; color: #6B7280;">⏰</div>
                  <div>
                    <p style="margin: 0; font-weight: 500; color: #111827;">Time</p>
                    <p style="margin: 0; color: #6B7280; font-size: 14px;">${appointmentData?.selectedTime}</p>
                  </div>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                  <div style="width: 20px; height: 20px; margin-right: 16px; color: #6B7280;">👤</div>
                  <div>
                    <p style="margin: 0; font-weight: 500; color: #111827;">Client</p>
                    <p style="margin: 0; color: #6B7280; font-size: 14px;">${appointmentData?.name}</p>
                  </div>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                  <div style="width: 20px; height: 20px; margin-right: 16px; color: #6B7280;">🎯</div>
                  <div>
                    <p style="margin: 0; font-weight: 500; color: #111827;">Service</p>
                    <p style="margin: 0; color: #6B7280; font-size: 14px;">${appointmentData?.appointmentType}</p>
                  </div>
                </div>
              </div>
              <div style="text-align: center; padding: 24px 0;">
                <a href="${BASE_URL}/appointmentToken/${confirmationToken}?confirm=true" style="display: inline-block; background-color: #E1B177; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; margin-bottom: 12px; width: 100%; text-align: center; box-sizing: border-box;">Confirm Appointment</a>
                <a href="${BASE_URL}/appointmentToken/${confirmationToken}?confirm=false" style="display: inline-block; background-color: white; color: #374151; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; border: 1px solid #E5E7EB; width: 100%; text-align: center; box-sizing: border-box;">Cancel Appointment</a>
              </div>
            </div>
            <div style="border-top: 1px solid #E5E7EB; margin-top: 24px; padding: 24px; text-align: center; color: #6B7280; font-size: 14px;">
              <p style="margin: 0;">This is an automated notification from QUIKSBOT Appointment System.</p>
              <p style="margin: 8px 0 0;">© ${new Date().getFullYear()} QUIKSBOT. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>`,
    };

    await Promise.all([onMailer({}, mailOptions1 as any), onMailer({}, mailOptions as any)]);
    return newAppointment;
  } catch (err) {
    throw new Error(
      "error has occur while add new appointment type",
      (err as any)?.message
    );
  }
};

export const appointmentAction = async (
  tokenId: string,
  isConfirm: boolean
) => {
  if (!tokenId) throw new Error("No tokenId found!!!");

  try {
    const appointment = await fetchQuery(api.appointments.getAppointmentClientByToken, {
      token: tokenId,
    });

    if (appointment && appointment.status === "PENDING" && !appointment.tokenUsed) {
      const date = new Date(appointment?.selectedDate!);

      const formattedDate = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);

      const appointmentOwner = await fetchQuery(api.appointments.getAppointmentById, {
        id: appointment?.appointmentId! as any,
      });

      const getUser =
        appointmentOwner && (await getBot(appointmentOwner?.chatbotId!));

      const userWithMail = (getUser as any)?.User?.mailId
        ? await fetchQuery(api.users.getUserWithSubscriptionById, {
            userId: (getUser as any)?.User?._id as any,
          })
        : null;

      const Mail = userWithMail?.mail ?? null;

      const mailOptions = {
        from: Mail ? Mail?.userEmail : process?.env.NODE_MAILER_EMAIL,
        to: appointment?.email,
        subject: "Appointment Confirmed!",
        html: `<!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>✅ Appointment Confirmed</title>
        </head>
        <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 40px auto; padding: 0 20px;">
            <div style="background-color: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
              <div style="text-align: center; padding: 20px 0;">
                <div style="background-color: #EEF9F1; width: 64px; height: 64px; border-radius: 32px; display: inline-flex; align-items: center; justify-content: center; font-size: 32px;">✅</div>
              </div>
              <div style="padding: 20px 24px;">
                <h1 style="color: #111827; font-size: 24px; font-weight: 600; text-align: center; margin: 0;">Appointment Confirmed</h1>
              </div>
              <div style="padding: 0 24px;">
                <p style="color: #374151; margin-bottom: 24px; text-align: center;">Hello <strong>${appointment?.name}</strong>,</p>
                <p style="color: #374151; margin-bottom: 24px; text-align: center;">Your appointment has been confirmed. Here are your appointment details:</p>
                <div style="margin: 32px 0; padding: 24px; background-color: #F9FAFB; border-radius: 8px;">
                  <div style="display: flex; align-items: center; margin-bottom: 16px;">
                    <div style="width: 20px; height: 20px; margin-right: 16px; color: #6B7280;">📅</div>
                    <div>
                      <p style="margin: 0; font-weight: 500; color: #111827;">Date</p>
                      <p style="margin: 0; color: #6B7280; font-size: 14px;">${formattedDate}</p>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; margin-bottom: 16px;">
                    <div style="width: 20px; height: 20px; margin-right: 16px; color: #6B7280;">⏰</div>
                    <div>
                      <p style="margin: 0; font-weight: 500; color: #111827;">Time</p>
                      <p style="margin: 0; color: #6B7280; font-size: 14px;">${appointment?.selectedDate}</p>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; margin-bottom: 16px;">
                    <div style="width: 20px; height: 20px; margin-right: 16px; color: #6B7280;">🎯</div>
                    <div>
                      <p style="margin: 0; font-weight: 500; color: #111827;">Service</p>
                      <p style="margin: 0; color: #6B7280; font-size: 14px;">${appointment?.appointmentType}</p>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center;">
                    <div style="width: 20px; height: 20px; margin-right: 16px; color: #6B7280;">🏢</div>
                    <div>
                      <p style="margin: 0; font-weight: 500; color: #111827;">Appointment</p>
                      <p style="margin: 0; color: #6B7280; font-size: 14px;">${(getUser as any)?.name}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div style="border-top: 1px solid #E5E7EB; margin-top: 24px; padding: 24px; text-align: center; color: #6B7280; font-size: 14px;">
                <p style="margin: 8px 0 0;">© ${new Date().getFullYear()} QUIKSBOT. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>`,
      };

      const updatedAppointment = await fetchMutation(api.appointments.updateAppointmentStatus, {
        id: appointment?._id! as any,
        status: isConfirm ? "CONFIRMED" : "CANCELLED",
        tokenUsed: true,
      });

      if (!updatedAppointment) throw new Error("cannot updated Appointment!!!");

      Mail
        ? await onMailer(
            {
              host: Mail?.host,
              port: Mail?.port,
              secure: Mail?.secure,
              userEmail: Mail?.userEmail,
              password: Mail?.password,
            },
            mailOptions as any
          )
        : await onMailer({}, mailOptions as any);

      return updatedAppointment;
    } else {
      return null;
    }
  } catch (err) {
    throw new Error(
      "err has occur while trying to confirm or decline appointment",
      (err as any)?.message
    );
  }
};
