import { getUserPdfFiles, getUserSub } from "@/actions/user";
import { useUser } from "@clerk/nextjs";
import { Plans } from "@prisma/client";
import { useEffect, useState } from "react";

//file docs
export const STANDARD_LIMIT = 2;
export const PRO_LIMIT = 22;
export const ULTIMATE_LIMIT = 50;

function useSubcription() {
  const [hasActiveMembership, setHasActiveMembership] =
    useState<Plans>("STANDARD");
  const [isOverFileLimit, setIsOverFileLimit] = useState(false);
  const { user } = useUser();

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
      const files: number | undefined = await getUserPdfFiles(user?.id!);
      const usersLimit =
        hasActiveMembership === "STANDARD"
          ? STANDARD_LIMIT
          : hasActiveMembership === "PRO"
          ? PRO_LIMIT
          : ULTIMATE_LIMIT;
      setIsOverFileLimit((files as number) >= usersLimit);
    };

    getPdfFiles();
  }, [isOverFileLimit, user, STANDARD_LIMIT, PRO_LIMIT, ULTIMATE_LIMIT]);

  return {
    hasActiveMembership,
    isOverFileLimit,
  };
}
export default useSubcription;
