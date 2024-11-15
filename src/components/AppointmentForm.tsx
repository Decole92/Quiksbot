import React, { useState, useTransition } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, Loader2, Mail, Send, User } from "lucide-react";
import {
  createAppointment,
  getAppointmentType,
  getBusinessHours,
} from "@/actions/appointment";
import useSWR from "swr";
import { format } from "date-fns";
import type { AppointmentType, BusinessHours } from "@prisma/client";
import { toast } from "sonner";
import { AppointmentData, FormData } from "../../typing";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";

interface AppointmentBookingProps {
  id: string;
}

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({ id }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null | undefined>(
    null
  );
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [isSent, setIsSent] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
  });
  const [isPending, startTransition] = useTransition();
  const {
    data: appointmentsType,
    error: appointmentError,
    isLoading: isAppointmentLoading,
  } = useSWR<AppointmentType[] | undefined>(
    id ? `/api/getAppointment/${id}` : null,
    async () => await getAppointmentType(id)
  );

  const {
    data: businessHours,
    error: businessHoursError,
    isLoading: isBusinessHoursLoading,
  } = useSWR<BusinessHours | any>(
    id ? `/api/getBusinessHours/${id}` : null,
    async () => await getBusinessHours(id)
  );

  const isDateDisabled = (date: Date): boolean => {
    if (!businessHours) return true;

    const day = date.getDay();
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ] as const;
    const today = new Date();
    const dayHours = businessHours[dayNames[day]];
    return !dayHours?.isOpen || date < today;
  };

  const getTimeSlots = (): string[] => {
    if (!selectedDate || !selectedType || !businessHours || !appointmentsType)
      return [];

    const day = selectedDate.getDay();
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ] as const;

    const dayHours = businessHours[dayNames[day]];

    if (!dayHours?.isOpen) return [];

    const slots: string[] = [];
    const [startHour] = dayHours.startTime.split(":");
    const [endHour] = dayHours.endTime.split(":");
    const selectedAppointmentType = appointmentsType.find(
      (t) => t.id === selectedType
    );
    // const duration = selectedAppointmentType?.duration || 30;

    for (let hour = parseInt(startHour); hour < parseInt(endHour); hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeSlot = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push(timeSlot);
      }
    }

    return slots;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !selectedType) return;

    // Type for the appointment data

    const appointmentData: AppointmentData = {
      ...formData,
      appointmentDate: selectedDate,
      selectedTime,
      appointmentType: selectedType,
      status: "PENDING",
    };

    try {
      startTransition(async () => {
        const newAppointment = createAppointment(appointmentData, id);
        toast.promise(newAppointment, {
          success: " Appointment Booked",
          error: "Error occurs while creating appointment!",
          loading: "Booking Appointment...",
        });
        setIsSent(true);
      });

      console.log("appointmentData", appointmentData);
    } catch (error) {
      console.error("Error booking appointment:", error);
    }
  };

  const isLoading = isAppointmentLoading || isBusinessHoursLoading;
  const hasError = appointmentError || businessHoursError;

  if (hasError) {
    return (
      <div className='w-full flex items-center justify-center p-8'>
        <div className='text-center text-red-500'>
          Error loading appointment data. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className='w-full md:max-w-5xl lg:max-w-5xl lg:mx-auto mx-auto    '>
      {isSent ? (
        <div>
          <h5>
            You will receive a confirmation email shortly with all the details
            of your upcoming appointment.
          </h5>
        </div>
      ) : (
        <div className='shadow-md rounded-md'>
          <Card>
            <CardHeader>
              <CardTitle className='text-xl'>Book appointment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className='space-y-6'>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='name' className='text-sm font-medium'>
                      Name
                    </Label>
                    <div className='relative'>
                      <Input
                        id='name'
                        placeholder='Enter your name'
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev: FormData) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        required
                        className='pl-10'
                      />
                      <User
                        className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                        size={18}
                      />
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='email' className='text-sm font-medium'>
                      Email
                    </Label>
                    <div className='relative'>
                      <Input
                        id='email'
                        type='email'
                        placeholder='Enter your email'
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev: FormData) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        required
                        className='pl-10'
                      />
                      <Mail
                        className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                        size={18}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Appointment Type</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select appointment type' />
                    </SelectTrigger>
                    <SelectContent>
                      {appointmentsType?.map((type) => (
                        <SelectItem
                          key={type.id}
                          value={type.typeName}
                          className=''
                        >
                          <div className='flex flex-col items-start'>
                            <h5 className='font-semibold text-md py-0.5'>
                              {type.typeName}
                            </h5>
                            {/* <p className='text-xs'>{type.description}</p> */}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* <div className='w-full overflow-x-auto'>
                  <Label>Select Date</Label>
                  <Calendar
                    mode='single'
                    selected={selectedDate!}
                    onSelect={setSelectedDate!}
                    disabled={isDateDisabled}
                    className='rounded-md border'
                  /> </div> */}

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {selectedDate ? (
                        format(selectedDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      selected={selectedDate!}
                      onSelect={setSelectedDate!}
                      disabled={isDateDisabled}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <div>
                  <Label>Select Time</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select time slot'>
                        <div className='flex items-center gap-2'>
                          <Clock className='w-4 h-4' />
                          <span>{selectedTime || "Select time slot"}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {getTimeSlots().map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type='submit'
                  className='w-full bg-gradient-to-r from-[#E1B177] to-[#E1B177]/50 hover:bg-transparent transition-all duration-200 hover:text-gray-100'
                  disabled={
                    !selectedDate ||
                    !selectedTime ||
                    !selectedType ||
                    isLoading ||
                    isPending
                  }
                >
                  {isPending ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Booking...
                    </>
                  ) : (
                    <>Book Appointment</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AppointmentBooking;
