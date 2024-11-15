"use client";
import React, { useEffect, useState } from "react";
import AnalyticContact from "../AnalyticContact";
import MailDraft from "../MailDraft";
import useSWR from "swr";
import { getUserById } from "@/actions/user";
import { useAuth } from "@clerk/nextjs";
import useSubcription from "@/hook/useSubscription";
import UpgradeBanner from "../UpgradeBanner";

function EmailClient() {
  const { userId } = useAuth();
  const [integrate, setIntegrate] = useState(false);
  const { hasActiveMembership } = useSubcription();
  const {
    data: MailData,
    mutate,
    isLoading,
  } = useSWR(
    userId ? `/api/getUser/${userId}` : null,
    async () => await getUserById(userId as string)
  );

  useEffect(() => {
    if (MailData?.mailId) {
      setIntegrate(true);
    }
  }, [userId, MailData]);

  return (
    <div className='w-full mt-20 md:max-w-5xl md:mx-auto lg:max-w-7xl md:pl-6 lg:pl-6 lg:mx-auto p-5 h-full lg:max-h-screen md:max-h-screen relative '>
      {hasActiveMembership === "STANDARD" ? (
        <UpgradeBanner />
      ) : (
        <div className='flex flex-col gap-4 items-start lg:flex-row md:flex-row md:justify-evenly lg:justify-evenly w-full'>
          <AnalyticContact />
          <MailDraft integrate={integrate} />
        </div>
      )}
    </div>
  );
}

export default EmailClient;
