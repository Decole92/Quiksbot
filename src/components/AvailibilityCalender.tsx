"use client";

import { FormEvent, useState, useTransition } from "react";
import { addDays, format, isBefore, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, Plus, PlusIcon, Settings, Trash2Icon } from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import BusinessHoursManager from "./BusinessHours";
import { toast } from "sonner";
import useSWR from "swr";
import {
  addNewAppointment,
  delAppointmentType,
  getAppointmentType,
} from "@/actions/appointment";
import Chatbot from "./Bot/Chatbot";

const AvailabilityCalender = ({ id }: { id: string }) => {
  const {
    data: appointments,
    mutate,
    isLoading,
  } = useSWR(
    id ? "/api/getAppointmentsTypes" : null,
    async () => await getAppointmentType(id)
  );

  const [activeTab, setActiveTab] = useState("appointment");
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleAddAppointment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const header_title = title;
    const body_description = description;
    setTitle("");
    setDescription("");
    startTransition(async () => {
      const promise = addNewAppointment(header_title, body_description, id);
      toast.promise(promise, {
        loading: "Adding Appointment type...",
        success: "Appointment type added.",
        error: "error has occur while add new appointment type.",
      });
    });
    await mutate();
  };

  const handleDel = async (id: string) => {
    const promise = delAppointmentType(id);
    toast.promise(promise, {
      loading: "Deleting Appointment type...",
      success: "Appointment deleted.",
      error: "error has occur while deleting appointment type.",
    });

    await mutate();
  };
  return (
    <div className=' md:max-w-3xl md:mx-auto w-full lg:max-w-4xl lg:mx-auto'>
      <Tabs defaultValue={activeTab} className='w-full'>
        <TabsList className='flex justify-end bg-transparent'>
          <TabsTrigger value='appointment'>
            <PlusIcon className='w-4 h-4 mr-2' />
            Appointment
          </TabsTrigger>
          <TabsTrigger value='business'>
            <Settings className='w-4 h-4 mr-2' />
            Business Hours
          </TabsTrigger>
        </TabsList>
        <TabsContent value='appointment'>
          <div className=''>
            <form
              onSubmit={handleAddAppointment}
              className='flex flex-col items-center flex-1 gap-2 bg-gray-200/50  p-3 rounded-md dark:bg-gray-950'
            >
              <Input
                value={title}
                disabled={isPending}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='Title: (Hint => General Consultation)'
                className=' placeholder:text-black dark:placeholder:text-gray-200 focus:outline-none dark:bg-gray-900 '
              />
              <Textarea
                disabled={isPending}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className='dark:bg-gray-900  placeholder:text-black dark:placeholder:text-gray-200'
                placeholder='Description: e.g (A 30-minute general consultation appointment.)'
              />
              <h3 className='text-xs p-2 text-gray-900 dark:text-gray-500'>
                Hint: (Optional) To allow clients to select an optional
                appointment type from a predefined list, lets enhance the UI and
                update the data structure. The client can then select a specific
                type of appointment (e.g., &ldquo;Consultation&rdquo;,
                &ldquo;Follow-up&rdquo;)
              </h3>
              <Button
                disabled={!title || isPending}
                type='submit'
                variant='outline'
                className=' focus:outline-none w-full'
              >
                Add Appointment
              </Button>
            </form>

            <div className='mt-8'>
              <h2 className='text-xl font-semibold mb-4'>Appointment Type</h2>

              {isLoading ? (
                <div className='w-full flex flex-col'>
                  <div className='flex items-center justify-center'>
                    <Loader2 className='h-12 w-12 animate-spin  ' />
                  </div>
                </div>
              ) : (
                <Accordion type='single' collapsible className='w-full'>
                  {appointments && appointments.length > 0 ? (
                    appointments.map((appointment) => (
                      <AccordionItem
                        key={appointment.id}
                        value={appointment.id}
                      >
                        <div className='flex items-center w-full'>
                          <Trash2Icon
                            onClick={() => handleDel(appointment?.id)}
                            className='w-5 h-5  mr-4 cursor-pointer hover:text-red-500'
                          />
                          <div className='flex-1'>
                            <AccordionTrigger>
                              {appointment.typeName}
                            </AccordionTrigger>
                            <AccordionContent>
                              {appointment.description}
                            </AccordionContent>
                          </div>
                        </div>
                      </AccordionItem>
                    ))
                  ) : (
                    <h4>
                      {`No appointment type has been added to your chatbot yet`}
                    </h4>
                  )}
                </Accordion>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value='business'>
          <BusinessHoursManager id={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default AvailabilityCalender;
