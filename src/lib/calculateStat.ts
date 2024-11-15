// import { Campaign, Customer } from "@prisma/client";
// import { Mail, Users } from "lucide-react";

// interface Contact {
//   id: number;
//   name: string;
//   email: string;
//   location: string;
//   acquired: string;
//   type: "contact" | "appointment";
//   createdAt: string;
// }

// interface Statistic {
//   name: string;
//   value: string;
//   change: string;
//   icon: React.ComponentType<{ size?: number; color?: string }>;
//   trend: "up" | "down";
// }

// export const calculateStats = (
//   customerData: Contact[],
//   campaignData: Campaign[]
// ): Statistic[] => {
//   // Get current date and date 30 days ago
//   const now = new Date();
//   const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

//   // Calculate total customers
//   const totalCustomers = customerData.length;

//   // Calculate new customers in last 30 days
//   const newCustomers = customerData.filter(
//     (customer) => new Date(customer.createdAt) > thirtyDaysAgo
//   ).length;

//   // Calculate customer growth
//   const customerChange =
//     totalCustomers > 0
//       ? ((newCustomers / totalCustomers) * 100).toFixed(1)
//       : "0.0";

//   // Calculate mail rate (successful campaigns in last 30 days)
//   const recentCampaigns = campaignData.filter(
//     (campaign) => new Date(campaign.createdAt) > thirtyDaysAgo
//   );
//   const successfulCampaigns = recentCampaigns.filter(
//     (campaign) => campaign.createdAt !== null
//   ).length;
//   const mailRate =
//     totalCustomers > 0
//       ? ((successfulCampaigns / totalCustomers) * 100).toFixed(1)
//       : "0.0";

//   // Calculate mail rate change
//   const previousPeriodCampaigns = campaignData.filter((campaign) => {
//     const campaignDate = new Date(campaign.createdAt);
//     return (
//       campaignDate >
//         new Date(thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)) &&
//       campaignDate < thirtyDaysAgo
//     );
//   });
//   const previousSuccessfulCampaigns = previousPeriodCampaigns.filter(
//     (campaign) => campaign.createdAt !== null
//   ).length;
//   const previousMailRate =
//     totalCustomers > 0
//       ? (previousSuccessfulCampaigns / totalCustomers) * 100
//       : 0;
//   const mailRateChange = (Number(mailRate) - previousMailRate).toFixed(1);

//   return [
//     {
//       name: "Total Customers",
//       value: totalCustomers.toLocaleString(),
//       change: `+${customerChange}%`,
//       icon: Users,
//       trend: Number(customerChange) >= 0 ? "up" : "down",
//     },
//     {
//       name: "Mail Rate",
//       value: `${successfulCampaigns}`,
//       change: `${mailRateChange >= 0 ? "+" : ""}${mailRateChange}%`,
//       icon: Mail,
//       trend: Number(mailRateChange) >= 0 ? "up" : "down",
//     },
//   ];
// };

import { Campaign, Customer } from "@prisma/client";
import { Mail, Users } from "lucide-react";

interface Contact {
  id: number;
  name: string;
  email: string;
  location: string;
  acquired: string;
  type: "contact" | "appointment";
  createdAt: string;
}

interface Statistic {
  name: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  trend: "up" | "down";
}

export const calculateStats = (
  customerData: Contact[],
  campaignData: Campaign[]
): Statistic[] => {
  // Get current date and date 30 days ago
  const now = new Date();
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

  // Calculate total customers
  const totalCustomers = customerData.length;

  // Calculate new customers in last 30 days
  const newCustomers = customerData.filter(
    (customer) => new Date(customer.createdAt) > thirtyDaysAgo
  ).length;

  // Calculate customer growth
  const customerChange =
    totalCustomers > 0
      ? ((newCustomers / totalCustomers) * 100).toFixed(1)
      : "0.0";

  // Calculate mail rate (successful campaigns in last 30 days)
  const recentCampaigns = campaignData.filter(
    (campaign) => new Date(campaign.createdAt) > thirtyDaysAgo
  );
  const successfulCampaigns = recentCampaigns.filter(
    (campaign) => campaign.createdAt !== null
  ).length;
  const mailRate =
    totalCustomers > 0
      ? ((successfulCampaigns / totalCustomers) * 100).toFixed(1)
      : "0.0";

  // Calculate mail rate change
  const previousPeriodCampaigns = campaignData.filter((campaign) => {
    const campaignDate = new Date(campaign.createdAt);
    return (
      campaignDate >
        new Date(thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)) &&
      campaignDate < thirtyDaysAgo
    );
  });
  const previousSuccessfulCampaigns = previousPeriodCampaigns.filter(
    (campaign) => campaign.createdAt !== null
  ).length;
  const previousMailRate =
    totalCustomers > 0
      ? (previousSuccessfulCampaigns / totalCustomers) * 100
      : 0;
  const mailRateChange = (Number(mailRate) - previousMailRate).toFixed(1);

  // Fix comparison: Convert customerChange and mailRateChange to numbers for comparison
  const customerChangeNumber = Number(customerChange);
  const mailRateChangeNumber = Number(mailRateChange);

  return [
    {
      name: "Total Customers",
      value: totalCustomers.toLocaleString(),
      change: `+${customerChange}%`,
      icon: Users as React.ComponentType<{ size?: number; color?: string }>,
      trend: customerChangeNumber >= 0 ? "up" : "down", // Comparison with number
    },
    {
      name: "Mail Rate",
      value: `${successfulCampaigns}`,
      change: `${mailRateChangeNumber >= 0 ? "+" : ""}${mailRateChange}%`,
      icon: Mail as React.ComponentType<{ size?: number; color?: string }>,
      trend: mailRateChangeNumber >= 0 ? "up" : "down", // Comparison with number
    },
  ];
};
