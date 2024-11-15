"use client";
import React, { useMemo } from "react";
import { Users, Mail, BarChart3, Inbox } from "lucide-react";
import { getCustomers } from "@/actions/customer";
import { getCampaign } from "@/actions/campaign";
import useSWR from "swr";
import { calculateStats } from "@/lib/calculateStat";
import { useUser } from "@clerk/nextjs";

// const stats = [
//   {
//     name: "Total Customers",
//     value: "2,847",
//     change: "+12.5%",
//     icon: Users,
//     trend: "up",
//   },
//   {
//     name: "Mail Rate",
//     value: "24.8%",
//     change: "+4.3%",
//     icon: Mail,
//     trend: "up",
//   },
//   {
//     name: "Click Rate",
//     value: "12.3%",
//     change: "-2.1%",
//     icon: BarChart3,
//     trend: "down",
//   },
//   {
//     name: "Bounce Rate",
//     value: "0.8%",
//     change: "-0.3%",
//     icon: Inbox,
//     trend: "down",
//   },
// ];

export default function Stats() {
  const { user } = useUser();
  const { data: allCustomerContacts, isLoading: customerLoading } = useSWR(
    user ? `/api/getCustomers/${user?.id}` : null,
    user ? async () => await getCustomers(user?.id) : null
  );

  const { data: campaignData, isLoading: campaignLoading } = useSWR(
    user ? `/api/getCampaign/${user?.id}` : null,
    user ? async () => await getCampaign(user?.id) : null
  );

  // Calculate stats whenever data changes
  const stats = useMemo(() => {
    if (!allCustomerContacts || !campaignData) return [];
    return calculateStats(allCustomerContacts, campaignData);
  }, [allCustomerContacts, campaignData]);

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-6 w-full'>
      {stats.map((stat) => (
        <div
          key={stat.name}
          className='bg-white dark:bg-gray-900 rounded-lg shadow-sm shadow-gray-200 dark:shadow-gray-900 p-6 dark:text-gray-400'
        >
          <div className='flex items-center justify-between'>
            <div className='bg-gray-100 dark:bg-gray-950 p-3 rounded-lg'>
              <stat.icon
                //@ts-ignore
                className='w-6 h-6 text-[#E1B177]'
              />
            </div>
            <span
              className={`text-sm font-medium ${
                stat.trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {stat.change}
            </span>
          </div>
          <h3 className='mt-4 text-2xl font-semibold text-gray-900 dark:text-gray-200'>
            {stat.value}
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
            {stat.name}
          </p>
        </div>
      ))}
    </div>
  );
}
