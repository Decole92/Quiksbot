"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Eye, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { getBusinessHours, updateBusinessHours } from "@/actions/appointment";

// Define the types for our business hours
interface TimeSlot {
  startTime: string;
  endTime: string;
  isOpen: boolean;
}

interface BusinessHoursState {
  [key: string]: TimeSlot[];
}

export const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DEFAULT_BUSINESS_HOURS: BusinessHoursState = {
  monday: [{ startTime: "09:00", endTime: "17:00", isOpen: false }],
  tuesday: [{ startTime: "09:00", endTime: "17:00", isOpen: false }],
  wednesday: [{ startTime: "09:00", endTime: "17:00", isOpen: false }],
  thursday: [{ startTime: "09:00", endTime: "17:00", isOpen: false }],
  friday: [{ startTime: "09:00", endTime: "17:00", isOpen: false }],
  saturday: [{ startTime: "09:00", endTime: "17:00", isOpen: false }],
  sunday: [{ startTime: "09:00", endTime: "17:00", isOpen: false }],
};

const BusinessHoursManager = ({ id }: { id: string }) => {
  const [businessHours, setBusinessHours] = useState<BusinessHoursState>(
    DEFAULT_BUSINESS_HOURS
  );
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>("monday");
  const [activeTab, setActiveTab] = useState("view");

  useEffect(() => {
    const loadBusinessHours = async () => {
      try {
        setIsLoading(true);
        const hours = await getBusinessHours(id);
        if (hours && Object.keys(hours).length > 0) {
          setBusinessHours(hours);
        }
      } catch (error) {
        console.error("Error loading business hours:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadBusinessHours();
  }, [id]);

  const handleTimeChange = (
    day: string,
    index: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setBusinessHours((prev) => {
      const updatedDay = [...prev[day]];
      updatedDay[index] = {
        ...updatedDay[index],
        [field]: value,
      };
      return {
        ...prev,
        [day]: updatedDay,
      };
    });
  };

  const handleToggleTimeSlot = (day: string, index: number) => {
    setBusinessHours((prev) => {
      const updatedDay = [...prev[day]];
      updatedDay[index] = {
        ...updatedDay[index],
        isOpen: !updatedDay[index].isOpen,
      };
      return {
        ...prev,
        [day]: updatedDay,
      };
    });
  };

  const addTimeSlot = (day: string) => {
    setBusinessHours((prev) => {
      return {
        ...prev,
        [day]: [
          ...prev[day],
          { startTime: "09:00", endTime: "17:00", isOpen: true },
        ],
      };
    });
  };

  const removeTimeSlot = (day: string, index: number) => {
    setBusinessHours((prev) => {
      if (prev[day].length <= 1) {
        return prev;
      }
      const updatedDay = [...prev[day]];
      updatedDay.splice(index, 1);
      return {
        ...prev,
        [day]: updatedDay,
      };
    });
  };

  const saveBusinessHours = () => {
    try {
      const hoursArray = Object.entries(businessHours).flatMap(
        ([day, timeSlots]) =>
          timeSlots.map((slot) => ({
            day,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isOpen: slot.isOpen,
            id,
          }))
      );

      startTransition(async () => {
        const promise = updateBusinessHours(id, hoursArray);
        toast.promise(promise, {
          success: "Business Hours Updated",
          error: "Error occurs while update Hours",
          loading: "Updating Business Hours...",
        });
      });
    } catch (error) {
      console.error("Error saving business hours:", error);
    }
  };

  if (isLoading) {
    return (
      <Card className='w-full'>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center'>
            Loading business hours...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full'>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='w-full p-4'
        >
          <TabsList className='grid w-full grid-cols-2 mb-6'>
            <TabsTrigger value='view'>
              <Eye className='w-4 h-4 mr-2' />
              View Hours
            </TabsTrigger>
            <TabsTrigger value='edit'>
              <Plus className='w-4 h-4 mr-2' />
              Edit Hours
            </TabsTrigger>
          </TabsList>

          <TabsContent value='view' className='space-y-4'>
            <div className='p-4 border rounded-lg'>
              <div className='space-y-2'>
                {DAYS_OF_WEEK.map((day) => {
                  const openSlots = businessHours[day].filter(
                    (slot) => slot.isOpen
                  );
                  const hoursText =
                    openSlots.length > 0
                      ? openSlots
                          .map((slot) => `${slot.startTime} - ${slot.endTime}`)
                          .join(", ")
                      : "Closed";
                  return (
                    <div key={day} className='flex justify-between py-1'>
                      <span className='font-medium capitalize'>{day}</span>
                      <span>{hoursText}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value='edit' className='space-y-4'>
            <div className='space-y-4'>
              <div className='flex gap-4 mb-6'>
                <div className='w-full'>
                  <Label htmlFor='day-select'>Select Day</Label>
                  <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger id='day-select' className='w-full'>
                      <SelectValue placeholder='Select a day' />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem
                          key={day}
                          value={day}
                          className='capitalize'
                        >
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='border rounded-lg p-4'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-medium capitalize'>
                    {selectedDay}
                  </h3>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => addTimeSlot(selectedDay)}
                    className='flex items-center gap-1'
                  >
                    <Plus className='w-4 h-4' /> Add Time Slot
                  </Button>
                </div>

                <div className='space-y-4'>
                  {businessHours[selectedDay].map((timeSlot, index) => (
                    <div
                      key={index}
                      className='flex items-center gap-4 p-3 rounded-lg border'
                    >
                      <div className='w-28 flex flex-col gap-2'>
                        <Label>Active</Label>
                        <Switch
                          checked={timeSlot.isOpen}
                          onCheckedChange={() =>
                            handleToggleTimeSlot(selectedDay, index)
                          }
                        />
                      </div>

                      {timeSlot.isOpen && (
                        <>
                          <div className='flex-1 grid grid-cols-2 gap-4'>
                            <div>
                              <Label>Open</Label>
                              <Input
                                type='time'
                                value={timeSlot.startTime}
                                onChange={(e) =>
                                  handleTimeChange(
                                    selectedDay,
                                    index,
                                    "startTime",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label>Close</Label>
                              <Input
                                type='time'
                                value={timeSlot.endTime}
                                onChange={(e) =>
                                  handleTimeChange(
                                    selectedDay,
                                    index,
                                    "endTime",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => removeTimeSlot(selectedDay, index)}
                            disabled={businessHours[selectedDay].length <= 1}
                            className='text-destructive hover:text-destructive/90'
                          >
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant='outline'
                disabled={isPending}
                onClick={saveBusinessHours}
                className='w-full dark:hover:bg-[#E1B177] hover:bg-[#E1B177] items-center justify-center bg-gray-200/50 text-black hover:text-white dark:bg-gray-950 dark:text-gray-400 dark:hover:text-gray-200'
              >
                Update Business Hours
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BusinessHoursManager;
