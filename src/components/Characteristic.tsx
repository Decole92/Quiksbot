import {
  RemoveCharacteristicId,
  RemoveSuggestionId,
  getBot,
} from "@/actions/bot";
import { RemovePageAddressById, getBlocks } from "@/actions/user";
import { useGlobalStore } from "@/store/globalStore";
import type { Characteristic, FirstQuestion } from "@prisma/client";
import { OctagonX } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";
import { BlockPage, characteristic } from "../../typing";
import { redirect, useRouter } from "next/navigation";

function Characteristic({
  blockpage,
  question,
  characteristic,
  type,
  chatbotId,
}: {
  blockpage?: BlockPage;
  question?: FirstQuestion;
  characteristic?: Characteristic;
  type: string;
  chatbotId?: string;
}) {
  // const { mutate } = useSWR("/api/getBot");
  const { mutate } = useSWR(
    chatbotId ? `/api/getBot/${chatbotId}` : null,
    chatbotId ? async () => getBot(chatbotId) : null
  );

  const { mutate: getBlockPage } = useSWR(
    blockpage ? `/api/getBlocks/${blockpage?.chatbotId}` : null,
    blockpage ? async () => await getBlocks(blockpage?.chatbotId) : null
  );
  const router = useRouter();
  const handleRemoveSuggestion = async () => {
    try {
      const promise = RemoveSuggestionId(question?.id!);
      toast.promise(promise, {
        loading: `Removing ${question?.question}...`,
        success: "Question Removed!",
        error: "error occurs while removing suggesong",
      });

      await mutate();
    } catch (err) {
      console.log("err occurs while removing question suggestion!");
    }
  };

  const handleRemoveBlock = async () => {
    try {
      const promise = RemovePageAddressById(blockpage?.id!);
      toast.promise(promise, {
        loading: `Removing ${blockpage?.address}...`,
        success: "path Removed!",
        error: "error occurs while removing blockpages",
      });

      await getBlockPage();
    } catch (err) {
      console.log("err occurs while removing question suggestion!");
    }
  };
  const handleRemoveCharacteristic = async () => {
    try {
      const promise = RemoveCharacteristicId(characteristic?.id!);
      toast.promise(promise, {
        loading: `Removing ${characteristic?.characteristic}...`,
        success: "Characteristic Removed!",
        error: "error occurs while removing suggesting",
      });

      await mutate();
    } catch (err) {
      console.log("err occurs while removing question suggestion!");
    }
  };

  return (
    <li className='relative bg-white border  p-5 md:p-7 lg:p-7  rounded-md text-black dark:bg-gray-900 dark:text-gray-400'>
      {type === "suggestion"
        ? question?.question
        : type === "getAddress"
        ? blockpage?.address
        : characteristic?.characteristic}
      <OctagonX
        onClick={() => {
          type === "suggestion"
            ? handleRemoveSuggestion()
            : type === "getAddress"
            ? handleRemoveBlock()
            : handleRemoveCharacteristic();
        }}
        className='absolute right-1 top-1 text-red-500 cursor-pointer h-5 w-5 hover:opacity-50'
      />
    </li>
  );
}

export default Characteristic;
