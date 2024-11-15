import React, { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { getBusinessHours, updateBusinessHours } from "@/actions/appointment";
import { BusinessHoursState } from "../../typing";
import { toast } from "sonner";

const DEFAULT_BUSINESS_HOURS: BusinessHoursState = {
  monday: { startTime: "09:00", endTime: "12:00", isOpen: true },
  tuesday: { startTime: "09:00", endTime: "12:00", isOpen: true },
  wednesday: { startTime: "09:00", endTime: "12:00", isOpen: true },
  thursday: { startTime: "09:00", endTime: "12:00", isOpen: false },
  friday: { startTime: "09:00", endTime: "17:00", isOpen: false },
  saturday: { startTime: "09:00", endTime: "17:00", isOpen: false },
  sunday: { startTime: "09:00", endTime: "17:00", isOpen: false },
};

const BusinessHoursManager = ({ id }: { id: string }) => {
  const [businessHours, setBusinessHours] = useState<BusinessHoursState>(
    DEFAULT_BUSINESS_HOURS
  );
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBusinessHours = async () => {
      try {
        setIsLoading(true);
        const hours = await getBusinessHours(id);

        // Only update state if we got valid data back
        if (hours && Object.keys(hours).length > 0) {
          setBusinessHours(hours as BusinessHoursState);
        }
        // If hours is empty/null, we'll keep using the default values
      } catch (error) {
        console.error("Error loading business hours:", error);
        // Keep default values in case of error
      } finally {
        setIsLoading(false);
      }
    };
    loadBusinessHours();
  }, [id]);

  const handleTimeChange = (
    day: keyof BusinessHoursState,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleToggleDay = (day: keyof BusinessHoursState) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day].isOpen,
      },
    }));
  };

  const saveBusinessHours = async () => {
    try {
      const hoursArray = Object.entries(businessHours).map(([day, hours]) => ({
        day,
        startTime: hours.startTime,
        endTime: hours.endTime,
        isOpen: hours.isOpen,
        id,
      }));

      startTransition(async () => {
        const promise = updateBusinessHours(id, hoursArray as any);
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
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Clock className='w-5 h-5' />
          Business Hours
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {Object.entries(businessHours).map(([day, hours]) => (
            <div
              key={day}
              className='flex items-center gap-4 p-2 rounded-lg border'
            >
              <div className='w-28 flex flex-col gap-2'>
                <Label className='capitalize'>{day}</Label>
                <Switch
                  checked={hours.isOpen}
                  onCheckedChange={() =>
                    handleToggleDay(day as keyof BusinessHoursState)
                  }
                />
              </div>

              {hours.isOpen && (
                <div className='flex-1 grid grid-cols-2 gap-4'>
                  <div>
                    <Label>Open</Label>
                    <Input
                      type='time'
                      value={hours.startTime}
                      onChange={(e) =>
                        handleTimeChange(
                          day as keyof BusinessHoursState,
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
                      value={hours.endTime}
                      onChange={(e) =>
                        handleTimeChange(
                          day as keyof BusinessHoursState,
                          "endTime",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          <Button
            variant='outline'
            disabled={isPending}
            onClick={saveBusinessHours}
            className='w-full mt-4 bg-gray-400'
          >
            Update Business Hours
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessHoursManager;
