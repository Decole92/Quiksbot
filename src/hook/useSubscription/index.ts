import { getUserCredits, getUserPdfFiles, getUserSub } from "@/actions/user";
import { useUser } from "@clerk/nextjs";
import type { Plans } from "@prisma/client";
import { useEffect, useState } from "react";

//file docs
export const STANDARD_LIMIT = 2;
export const PRO_LIMIT = 22;
export const ULTIMATE_LIMIT = 50;
export const STANDARD_CREDITS = 25;
function useSubcription() {
  const [hasActiveMembership, setHasActiveMembership] = useState<Plans>();
  const [isOverFileLimit, setIsOverFileLimit] = useState(false);
  const { user } = useUser();
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [usersLimit, setUsersLimit] = useState<number>();
  const [loading, setLoading] = useState(false);
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
      setLoading(true);
      const files: number | undefined = await getUserPdfFiles(user.id);
      const credits: number | null | undefined = await getUserCredits(user.id);
      console.log("User PDF files:", files);

      const limit =
        hasActiveMembership === "STANDARD"
          ? STANDARD_LIMIT
          : hasActiveMembership === "PRO"
          ? PRO_LIMIT
          : ULTIMATE_LIMIT;

      console.log("Calculated limit:", limit);
      setUsersLimit(limit);
      setTotalCredits(STANDARD_CREDITS);

      if (typeof files === "number") {
        setIsOverFileLimit(files >= limit);
      }

      if (typeof credits === "number") {
        setUsedCredits(credits);
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
    loading,
    usedCredits,
    totalCredits,
    isOverCreditLimit,
  };
}
export default useSubcription;
