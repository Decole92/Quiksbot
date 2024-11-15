import type { Campaign } from "@prisma/client";

import React, { useState, useEffect, useTransition } from "react";
import { Mail, ChevronRight, AlertCircle, Users, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { formatDateTime, htmlToText } from "@/lib/formatDate";
import { deleteCampaign, getCampaign } from "@/actions/campaign";
import { toast } from "sonner";
import useSWR from "swr";
import { useUser } from "@clerk/nextjs";
function MailCampaign({ campaign }: { campaign: Campaign[] }) {
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();

  const { data: campaignData, mutate } = useSWR(
    user ? `/api/getCampaign/${user?.id}` : null,
    user ? async () => await getCampaign(user?.id) : null
  );
  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this item?"
    );

    if (!confirmed) {
      return;
    }

    // Proceed with the deletion if confirmed
    startTransition(async () => {
      const del = deleteCampaign(id);
      toast.promise(del, {
        success: "Campaign deleted.",
        loading: "Deleting campaign...",
        error: "Error occurs while trying to delete campaign",
      });
    });
    await mutate();
  };
  return (
    <ScrollArea className='h-[600px] w-full rounded-md border'>
      <div className='p-4'>
        {campaign && campaign?.length > 0 ? (
          campaign?.map((email, index) => (
            <React.Fragment key={email.id}>
              <div className='flex items-start space-x-4 py-4'>
                <Mail className='mt-1 h-5 w-5 text-gray-500' />
                <div className='flex-1 space-y-1'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-sm font-medium'>{email.subject}</h3>
                    <span className='text-xs text-gray-500'>
                      {formatDateTime(email?.createdAt)}
                    </span>
                  </div>
                  <p className='text-sm text-gray-600'>From: {email.from}</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className='flex items-center text-sm text-gray-500'>
                          <Users className='mr-1 h-4 w-4' />
                          <span>{email.customers.length} recipients</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <ul className='list-none p-0 m-0'>
                          {email.customers.map((client, i) => (
                            <li key={i}>{client}</li>
                          ))}
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <p className='text-sm text-gray-500 line-clamp-2'>
                    {htmlToText(email?.template!)}
                  </p>
                </div>
                <div className='flex items-center space-x-2'>
                  <ChevronRight className='h-5 w-5 text-gray-400' />
                  <Button
                    disabled={isPending}
                    variant='ghost'
                    size='icon'
                    onClick={() => handleDelete(email.id)}
                    aria-label={`Delete email: ${email.subject}`}
                  >
                    <Trash2 className='h-4 w-4 text-gray-500 hover:text-red-500' />
                  </Button>
                </div>
              </div>
              {index < campaign?.length - 1 && <Separator />}
            </React.Fragment>
          ))
        ) : (
          <div>You have 0 Campaign right now.</div>
        )}
      </div>
    </ScrollArea>
  );
}

export default MailCampaign;
