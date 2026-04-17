import { getUserChatbots } from "@/actions/bot";
import { getUserCredits, getUserPdfFiles, getUserSub } from "@/actions/user";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

type Plans = "STANDARD" | "PRO" | "ULTIMATE";
import {
  PRO_CHATBOT_LIMIT,
  PRO_LIMIT,
  STANDARD_CHATBOT_LIMIT,
  STANDARD_CREDITS,
  STANDARD_LIMIT,
  ULTIMATE_CHATBOT_LIMIT,
  ULTIMATE_LIMIT,
} from "../../../constant/url";

//file docs

function useSubcription() {
  const [hasActiveMembership, setHasActiveMembership] = useState<Plans>();
  const [isOverFileLimit, setIsOverFileLimit] = useState(false);
  const { user } = useUser();
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [usersLimit, setUsersLimit] = useState<number>();
  const [isOverChatbotLimit, setIsOverChatbotLimit] = useState(true);
  const [chatbotLimit, setChatbotLimit] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  const [usedCredits, setUsedCredits] = useState(0);
  const [totalCredits, setTotalCredits] = useState(STANDARD_CREDITS);
  useEffect(() => {
    if (!user) return;
    const findUserSubcription = async () => {
      const userSub = await getUserSub(user?.id!);
      setHasActiveMembership(userSub as Plans);
      return userSub;
    };
    findUserSubcription();
  }, [user]);

  useEffect(() => {
    const getPdfFiles = async () => {
      if (!user) return;
      // setLoading();
      const files: number | undefined = await getUserPdfFiles(user.id);
      const credits: number | null | undefined = await getUserCredits(user.id);
      const chatbots: number | undefined = await getUserChatbots(user.id);

      const limit =
        hasActiveMembership === "STANDARD"
          ? STANDARD_LIMIT
          : hasActiveMembership === "PRO"
          ? PRO_LIMIT
          : ULTIMATE_LIMIT;

      const chatbotLimitValue =
        hasActiveMembership === "STANDARD"
          ? STANDARD_CHATBOT_LIMIT
          : hasActiveMembership === "PRO"
          ? PRO_CHATBOT_LIMIT
          : ULTIMATE_CHATBOT_LIMIT;

      setUsersLimit(limit);
      setTotalCredits(STANDARD_CREDITS);
      setChatbotLimit(chatbotLimitValue);

      if (typeof files === "number") {
        setIsOverFileLimit(files >= limit);
      }

      if (typeof credits === "number") {
        setUsedCredits(credits);
      }
      if (typeof chatbots === "number" && chatbotLimitValue !== Infinity) {
        setIsOverChatbotLimit(chatbots >= chatbotLimitValue);
      }

      setLoading(false);
    };

    getPdfFiles();
  }, [user, hasActiveMembership, isFileUploaded]);

  const handleNewPdfUpload = () => {
    setIsFileUploaded((prev) => !prev);
  };

  const isOverCreditLimit = usedCredits >= totalCredits;
  return {
    hasActiveMembership,
    isOverFileLimit,
    handleNewPdfUpload,
    isOverChatbotLimit,
    usedCredits,
    totalCredits,
    isOverCreditLimit,
    loading,
  };
}
export default useSubcription;
