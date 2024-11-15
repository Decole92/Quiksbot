import React, { useState, useTransition } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import DropzoneComponent from "../DropzoneComponent";
import { Info, Loader2, TrashIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import useSWR from "swr";
import {
  addCharacteristic,
  deletePdf,
  deleteWebsiteUrl,
  getBot,
} from "@/actions/bot";
import Characteristic from "../Characteristic";
import type { PdfFile } from "@prisma/client";
import useSubcription from "@/hook/useSubscription";
import { BASE_URL } from "../../../constant/url";

function Source({ chatbotId }: { chatbotId: string }) {
  const { isOverFileLimit, handleNewPdfUpload } = useSubcription();
  const [isPending, startTransition] = useTransition();
  const [isCrawling, startCrawling] = useTransition();

  const { data: chatbot, mutate } = useSWR(
    chatbotId ? `/api/getBot/${chatbotId}` : null,
    chatbotId ? async () => getBot(chatbotId) : null
  );

  const [characteristic, setCharacteristic] = useState("");
  const [url, setUrl] = useState("");
  const [links, setLinks] = useState([]);
  const handleAddCharacteristics = async (e: React.FormEvent) => {
    e.preventDefault();
    const feature = characteristic;
    setCharacteristic("");
    startTransition(async () => {
      const promise = addCharacteristic(chatbotId, feature);
      toast.promise(promise, {
        loading: "Adding characteristic..",
        success: "Characteristic Added Successfully!",
        error: "an error has occurred while adding characteristics",
      });

      await mutate(() => getBot(chatbotId));
    });
  };

  const handleDeletePdf = async (file: PdfFile) => {
    const promise = deletePdf(file?.id, chatbotId);
    toast.promise(promise, {
      loading: `Deleting ${file?.fileName} ...`,
      success: "File Deleted!",
      error: "error has occur while trying to delete pdf file",
    });
    await mutate(() => getBot(chatbotId));

    const fetch = await promise;
    if (fetch?.completed) {
      handleNewPdfUpload();
    }
  };

  const handleDeleteWebsiteUrl = async (id: string) => {
    const promise = deleteWebsiteUrl(id);
    toast.promise(promise, {
      loading: `Deleting url...`,
      success: "Url Deleted!",
      error: "error has occur while trying to delete website url",
    });
    await mutate(() => getBot(chatbotId));
  };

  const handleWebsiteUrl = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const sourceId = chatbot?.sourceId;
    const address = url;
    setUrl("");
    startCrawling(async () => {
      const res = await fetch("/api/fetch-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address, chatbotId, sourceId }),
      });

      const data = await res.json();
      if (data.success) {
        await mutate(() => getBot(chatbotId));
      } else {
        console.error("Error fetching data");
      }
    });
  };

  return (
    <div className='border border-gray-300 rounded-md p-5 md:p-7 lg:p-7 h-full max-w-5xl mx-auto bg-white dark:bg-gray-900 '>
      <h3 className='text-2xl pb-4 font-thin'>Bot Training Sources</h3>

      <div className='space-y-5'>
        <div className=''>
          <h3 className='font-bold text-lg'>Heres what your AI knows...</h3>
          <h5 className=' pb-2 '>
            Your chatbot is equipped with the following information to assist
            you in your conversations with your clients.
          </h5>

          <div className='bg-gray-200/50 dark:bg-gray-950 p-3 rounded-md space-y-3'>
            <form
              onSubmit={handleAddCharacteristics}
              className='flex items-center md:flex-row flex-col md:gap-4 lg:gap-4 gap-2'
            >
              <Input
                minLength={2}
                value={characteristic}
                onChange={(e) => setCharacteristic(e?.target?.value)}
                className='flex-1 dark:bg-gray-900'
                placeholder='Example: If customer asks for prices, provide pricing page: www.example.com/pricing '
              />
              <Button
                disabled={isPending || !characteristic}
                type='submit'
                className='bg-black/70  dark:bg-gray-900 hover:bg-[#E1B177] dark:hover:bg-[#E1B177] dark:text-gray-200  w-full md:w-[100px] lg:w-[100px] '
              >
                Add
              </Button>
            </form>
            {chatbot?.Source?.characteristic?.length !== 0 && (
              <ul className='flex flex-wrap-reverse gap-2 md:gap-3'>
                {chatbot?.Source?.characteristic?.map((characteristic: any) => (
                  <Characteristic
                    key={characteristic?.id}
                    characteristic={characteristic}
                    chatbotId={chatbotId}
                    type='characteristic'
                  />
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className=''>
          <h3 className='font-bold text-lg'>Upload File</h3>
          <h5 className=' pb-2 '>Training your chatbot with files .</h5>
          <DropzoneComponent chatbotId={chatbotId} />
          <div>
            <span className='flex w-full items-center'>
              <hr className='bg-black w-1/3' />
              <h5 className='flex-1 w-full text-center  '>
                Already Included Files
              </h5>
              <hr className='bg-black w-1/3' />
            </span>

            <div className='p-4'>
              {chatbot?.Source?.pdfFile &&
              chatbot?.Source?.pdfFile?.length > 0 ? (
                <div className='space-y-3'>
                  {chatbot?.Source?.pdfFile.map((file: any) => (
                    <div
                      key={file?.id}
                      className='flex items-center justify-between border p-3 rounded-md'
                    >
                      <h4>{file?.fileName} </h4>
                      <TrashIcon
                        onClick={() => handleDeletePdf(file)}
                        className='h-5 w-5 fill-red-100 text-red-500 cursor-pointer'
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <h4>
                  {`Your ${chatbot?.name} bot has not been trained with any PDF files yet`}
                </h4>
              )}
            </div>
            <hr />
          </div>
        </div>

        <div className='space-y-5 '>
          <div className=''>
            <h3 className='font-bold text-lg'>Crawl Website</h3>
            <h5 className=' pb-2 '>
              This will crawl all the links starting with the URL (not including
              files on the website).
            </h5>

            <div className='bg-gray-200/50 dark:bg-gray-950 p-3 rounded-md space-y-3'>
              <form
                onSubmit={handleWebsiteUrl}
                className='flex items-center md:flex-row flex-col md:gap-4'
              >
                <Input
                  disabled={isCrawling}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className='flex-1 dark:bg-gray-900'
                  placeholder='https://www.example.com '
                />
                {isCrawling ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Button
                    type='submit'
                    disabled={isCrawling || !url}
                    className=' w-auto bg-black/70  dark:bg-gray-900 hover:bg-[#E1B177] dark:hover:bg-[#E1B177] dark:text-gray-200 '
                  >
                    Fetch more links
                  </Button>
                )}
              </form>
            </div>

            <div className='space-y-2'>
              <span className='flex w-full items-center pt-4'>
                <hr className='bg-black w-1/3' />
                <h5 className='flex-1 w-full text-center'>
                  Website links Included
                </h5>
                <hr className='bg-black w-1/3' />
              </span>

              {chatbot?.Source?.webpage &&
              chatbot?.Source?.webpage?.length > 0 ? (
                <>
                  {chatbot?.Source.webpage.map((webpage) => (
                    <div key={webpage.id} className='px-5 py-2'>
                      <div className='flex items-center justify-between '>
                        <div className='flex flex-1 items-center space-x-4'>
                          <Badge className='p-2 bg-green-100 text-green-500 border border-green-500 gap-3 rounded-md '>
                            trained
                            <Info className='w-4 h-4' />
                          </Badge>

                          <Input
                            disabled={true}
                            className='w-1/2'
                            value={`${webpage.weblinks}`}
                            placeholder={`${webpage?.weblinks}`}
                          />
                          <h5 className='text-gray-500 text-sm'>
                            {webpage.length}
                          </h5>
                        </div>
                        <TrashIcon
                          onClick={() => handleDeleteWebsiteUrl(webpage.id)}
                          className='h-5 w-5 fill-red-100 text-red-500 cursor-pointer'
                        />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <h4>
                  {`Your ${chatbot?.name} bot has not been trained with any website  yet`}
                </h4>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Source;
