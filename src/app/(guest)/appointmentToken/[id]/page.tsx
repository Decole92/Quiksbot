"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Clock, Loader2Icon, MapPin, User } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { appointmentAction } from "@/actions/appointment";
import type { AppointmentClient } from "@prisma/client";
import useSWR from "swr";

function AppointmentToken({ params: { id } }: { params: { id: string } }) {
  const cleanId = id.split("&")[0];
  console.log("cleanId", cleanId);

  const searchParams = useSearchParams();
  const isConfirm = searchParams.get("confirm") === "true" ? true : false;
  // const [appointment, setAppointment] = useState<AppointmentClient>();

  const {
    data: appointment,
    isLoading,
    mutate,
  } = useSWR(
    cleanId ? "/api/updateAction" : null,
    async () => await appointmentAction(cleanId, isConfirm)
  );

  const formatDate = (dateString: Date) => {
    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }

      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    } catch (err) {
      console.error("Error formatting date:", err);
      return "Invalid date";
    }
  };
  console.log("this appointment", appointment);
  // if (!error) {
  return (
    <div className='min-h-screen bg-gray-100 flex items-center justify-center p-4'>
      {isLoading ? (
        <div className='w-full flex flex-col h-full'>
          <div className='flex-col flex justify-center items-center'>
            <Loader2Icon className='animate-spin w-12 h-12' />
          </div>
        </div>
      ) : !appointment ? (
        <div className='w-full flex flex-col h-full'>
          <div className='flex-col flex justify-center items-center'>
            <h1 className='text-lg font-bold'>
              Sorry, this link has expired or is no longer valid.
            </h1>
          </div>
        </div>
      ) : (
        <>
          <Card className='w-full max-w-md'>
            <CardHeader>
              <CardTitle className='text-2xl font-bold text-center'>
                {appointment?.status}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center space-x-4'>
                <Calendar className='h-5 w-5 text-gray-500' />
                <div>
                  <p className='font-medium'>Date</p>
                  <p className='text-sm text-gray-500'>
                    {formatDate(appointment?.selectedDate!)}
                  </p>
                </div>
              </div>
              <div className='flex items-center space-x-4'>
                <Clock className='h-5 w-5 text-gray-500' />
                <div>
                  <p className='font-medium'>Time</p>
                  <p className='text-sm text-gray-500'>
                    {appointment?.selectedTime}
                  </p>
                </div>
              </div>

              <div className='flex items-center space-x-4'>
                <User className='h-5 w-5 text-gray-500' />
                <div>
                  <p className='font-medium'>Client</p>
                  <p className='text-sm text-gray-500'>{appointment?.name}</p>
                </div>
              </div>
              <div className='pt-2'>
                <p className='font-medium'>Purpose</p>
                <p className='text-sm text-gray-500'>
                  {appointment?.appointmentType}
                </p>
              </div>
            </CardContent>
            <CardFooter className='flex flex-col space-y-2'>
              {appointment?.status === "CONFIRMED" ? (
                <Button
                  disabled
                  variant='outline'
                  className='w-full'
                  onClick={() => alert("Appointment confirmed!")}
                >
                  Appointment Confirmed
                </Button>
              ) : (
                <Button
                  disabled
                  variant='destructive'
                  className='w-full'
                  onClick={() => alert("Reschedule requested")}
                >
                  Appointment Cancelled
                </Button>
              )}
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
}

export default AppointmentToken;
