import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
function SettingsPage({ chatbot }: { chatbot: ChatBot }) {
  console.log("this is data", chatbot);
  return (
    <div className="border border-gray-300 rounded-md p-5 md:p-7 lg:p-7 h-full max-w-5xl mx-auto bg-white">
      <h3 className="text-2xl pb-4 font-thin">Bot Settings</h3>
      <div className="grid lg:grid-cols-5 h-full rounded-lg gap-5">
        <div className="col-span-5 lg:col-span-5 space-y-4">
          <div className="pb-2">
            <h3 className="font-bold text-lg">Select ChatGPT Model</h3>
            <h5 className="pb-2">
              Choose the ChatGPT model that best fits your chatbot's purpose.
              Each model offers different capabilities.
            </h5>
            <div className="bg-gray-200/50 p-3 rounded-md">
              
               <Select
                    // defaultValue={chatbot?.iconPosition!}
                    // onValueChange={(e) => setIconPosition(e)}
                  >
                    <SelectTrigger className='p-3 w-full'>
                      <SelectValue placeholder='Choose a model' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='gpt-3.5'>GPT-3.5</SelectItem>
                      
                    </SelectContent>
                  </Select>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg">Choose Your Bot Type</h3>
            <h5 className="pb-2">
              Select the most suitable bot for your needs. Whether you're
              setting up a Sales Bot to engage with customers or a Chatbot that
              interacts via PDF documents, this choice will determine how your
              chatbot will serve your clients.
            </h5>
            <div className="bg-gray-200/50 p-3 rounded-md">
             
              <Select
                    // defaultValue={chatbot?.iconPosition!}
                    // onValueChange={(e) => setIconPosition(e)}
                  >
                    <SelectTrigger className='p-3 w-full'>
                      <SelectValue placeholder='Choose a bot type that fits your needs' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='sales'>Sales Bot - Engage and convert leads</SelectItem>
                      <SelectItem value='pfd'>Chat with PDF Only - Answer queries based on your uploaded</SelectItem>
                      <SelectItem value='custom'>Customize your own prompt</SelectItem>
                    </SelectContent>
                  </Select>
            </div>
          </div>

          {/* Customization Textarea */}
          <div hidden>
            <h3 className="font-bold text-lg">Customize Input</h3>
            <div className="bg-gray-200/50 p-3 rounded-md">
              <textarea
                //   value={customization}
                //   onChange={handleCustomizationChange}
                placeholder="Enter your customization..."
                className="w-full h-24 p-3 rounded-md border-gray-300"
              />
            </div>
          </div>

          <div className=" bg-gray-200/50 p-3 rounded-md">
            <Card className="border border-red-500 hover:bg-gray-200/50 hover:border-red-500 cursor-pointer group ">
              <CardHeader>
                <CardTitle className="text-black font-bold group-hover:text-red-500">
                  Delete Chatbot
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Deleting this chatbot is an irreversible action. All
                  associated data and conversations will be permanently removed.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
