import {
  RemoveCharacteristicId,
  RemoveSuggestionId,
  getBot,
} from "@/actions/bot";
import { useGlobalStore } from "@/store/globalStore";
import type { Characteristic, FirstQuestion } from "@prisma/client";
import { OctagonX } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";

function Characteristic({
  question,
  characteristic,
  type,
}: {
  question?: FirstQuestion;
  characteristic?: Characteristic;
  type: string;
}) {
  const { mutate } = useSWR("/api/getBot");
  // const [setBot] = useGlobalStore((state) => [state.setBot]);
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
    <li className='relative bg-white border  p-5  rounded-md text-black dark:bg-gray-900 dark:text-gray-400'>
      {type === "suggestion"
        ? question?.question
        : characteristic?.characteristic}
      <OctagonX
        onClick={() => {
          type === "suggestion"
            ? handleRemoveSuggestion()
            : handleRemoveCharacteristic();
        }}
        className='absolute right-1 top-1 text-red-500 cursor-pointer h-5 w-5 hover:opacity-50'
      />
    </li>
  );
}

export default Characteristic;
