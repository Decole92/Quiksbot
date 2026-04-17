"use client";

import { useTransition } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { updateChatbotWhatsApp } from "@/actions/whatsapp";

interface PhoneNumberSelectorProps {
  chatbotId: string;
  phoneNumbers: { id: string; number: string }[];
  whatsappToken: string;
  whatsappBusinessId: string;
  onPhoneNumberSelected: (phoneId: string, phoneNumber: string) => void;
}

export const PhoneNumberSelector = ({
  chatbotId,
  phoneNumbers,
  whatsappToken,
  whatsappBusinessId,
  onPhoneNumberSelected,
}: PhoneNumberSelectorProps) => {
  const [isPending, startTransition] = useTransition();

  const handlePhoneNumberSelect = async (selectedPhoneId: string) => {
    const selectedPhone = phoneNumbers.find(
      (phone) => phone.id === selectedPhoneId
    );
    if (!selectedPhone) return;

    startTransition(async () => {
      const result = await updateChatbotWhatsApp(chatbotId, {
        enableWhatsApp: true,
        whatsappPhoneId: selectedPhone.id,
        whatsappNumber: selectedPhone.number,
        whatsappToken,
        whatsappBusinessId,
      });
      if (result.success) {
        onPhoneNumberSelected(selectedPhone.id, selectedPhone.number);
        toast.success(`Connected to WhatsApp number: ${selectedPhone.number}`);
      } else {
        toast.error("Failed to save phone number");
      }
    });
  };

  return (
    <div className='space-y-2'>
      <Label>Select Phone Number</Label>
      <Select onValueChange={handlePhoneNumberSelect} disabled={isPending}>
        <SelectTrigger className='w-full dark:bg-gray-800 dark:border-gray-700'>
          <SelectValue placeholder='Choose a phone number' />
        </SelectTrigger>
        <SelectContent>
          {phoneNumbers.map((phone) => (
            <SelectItem key={phone.id} value={phone.id}>
              {phone.number}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className='text-sm text-gray-500 dark:text-gray-400'>
        Select a phone number to connect to this chatbot
      </p>
    </div>
  );
};
