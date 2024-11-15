"use client";
import React, { useState } from "react";
import {
  Search,
  UserPlus,
  Trash2,
  Mail,
  Contact,
  Inbox,
  Plus,
} from "lucide-react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@clerk/nextjs";
import useSWR from "swr";
import { getCustomers, getUserCustomers } from "@/actions/customer";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import MailCampaign from "./MailCampaign";
import { getCampaign } from "@/actions/campaign";
import { useGlobalStore } from "@/store/globalStore";

// interface Contact {
//   id: number;
//   name: string;
//   email: string;
//   location: string;
//   acquired: string;
//   type: "contact" | "appointment";
//   createdAt: string;
// }
export default function ContactList() {
  const [activeTab, setActiveTab] = useState("contacts");
  const [searchTerm, setSearchTerm] = useState("");
  const [contactList, setContactList] = useGlobalStore((state) => [
    state.contactList,
    state.setContactList,
  ]);
  const { user } = useUser();

  const { data: allCustomerContacts, isLoading: loading } = useSWR(
    user ? `/api/getCustomers/${user?.id}` : null,
    user ? async () => await getCustomers(user?.id) : null
  );

  const { data: campaignData } = useSWR(
    user ? `/api/getCampaign/${user?.id}` : null,
    user ? async () => await getCampaign(user?.id) : null
  );
  const addContact = (email: string) => {
    setContactList([...contactList, { email }]);
  };
  return (
    <div className='bg-white rounded-lg shadow-md shadow-gray-200 dark:shadow-gray-800 p-2 dark:bg-gray-900 md:p-4 lg:p-4 '>
      <div className='flex md:items-center justify-between border-b p-4 items-start lg:items-center'>
        <div className='flex flex-col md:flex-row md:items-center gap-2'>
          <Tabs
            defaultValue='active'
            value={activeTab}
            onValueChange={setActiveTab}
            className='flex'
          >
            <TabsList>
              <TabsTrigger value='contacts'>
                <Contact className='w-4 h-4 mr-2' /> Contacts
              </TabsTrigger>
              <TabsTrigger value='campaign'>
                <Inbox className='w-4 h-4 mr-2' />
                Campaigns
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Tabs
        defaultValue='active'
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsContent value='contacts'>
          <div className='relative mb-6'>
            <input
              type='text'
              name={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder='Search contacts by name or email...'
              className='w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-800 rounded-md focus:outline-none dark:bg-gray-900'
            />
            <Search
              className='absolute left-3 top-2.5 text-gray-400 '
              size={20}
            />
          </div>

          {allCustomerContacts && allCustomerContacts?.length > 0 ? (
            <ScrollArea className='w-full whitespace-nowrap rounded-md border lg:h-[calc(100vh-500px)] md:h-[calc(100vh-600px)] h-full'>
              {/* <div className="flex w-max space-x-4 p-4"> */}
              <table className='min-w-full '>
                <thead>
                  <tr className='border-b border-gray-200 dark:border-gray-700'>
                    <th className='text-left py-3 px-4 text-sm font-semibold text-gray-600'>
                      Name
                    </th>
                    <th className='text-left py-3 px-4 text-sm font-semibold text-gray-600'>
                      Email
                    </th>
                    <th className='text-left py-3 px-4 text-sm font-semibold text-gray-600'>
                      Location
                    </th>
                    <th className='text-left py-3 px-4 text-sm font-semibold text-gray-600'>
                      Type
                    </th>
                    <th className='text-left py-3 px-4 text-sm font-semibold text-gray-600'>
                      Acquired
                    </th>
                    <th className='text-left py-3 px-4 text-sm font-semibold text-gray-600'>
                      Created
                    </th>
                    <th className='text-right py-3 px-4 text-sm font-semibold text-gray-600'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allCustomerContacts &&
                    allCustomerContacts
                      ?.filter((contact) => {
                        return (
                          contact?.email
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) |
                          contact?.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                        );
                      })
                      ?.map((contact) => (
                        <tr
                          key={contact.id}
                          className='border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-transparent cursor-pointer '
                        >
                          <td className='py-3 px-4 text-gray-500'>
                            {contact.name}
                          </td>
                          <td className='py-3 px-4 text-gray-500'>
                            {contact.email}
                          </td>
                          <td className='py-3 px-4 text-gray-500'>
                            {contact.type === "contact"
                              ? contact?.location
                              : "Null"}
                          </td>
                          <td className='py-3 px-4'>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                contact?.type === "contacts"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {contact?.type}
                            </span>
                          </td>

                          <td className='py-3 px-4 text-gray-500'>
                            {contact?.acquired}
                          </td>
                          <td className='py-3 px-4 text-gray-500 '>
                            {contact.createdAt &&
                              new Date(contact?.createdAt).toLocaleString()}
                          </td>
                          <td className='py-3 px-5'>
                            <Button
                              variant='outline'
                              className='rounded-md text-gray-500 '
                              onClick={() => addContact(contact?.email)}
                            >
                              <Mail size={18} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
              <ScrollBar orientation='horizontal' />
            </ScrollArea>
          ) : (
            <div className='w-full whitespace-nowrap rounded-md border lg:h-[calc(100vh-500px)] md:h-[calc(100vh-600px)] h-full'>
              <div className='flex flex-col justify-center items-center h-full'>
                No Contact or Appointment made yet.
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value='campaign'>
          <MailCampaign campaign={campaignData!} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
