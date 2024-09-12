import { getUserPdfFiles, getUserSub } from "@/actions/user";
import { useUser } from "@clerk/nextjs";
import { Plans } from "@prisma/client";
import { useEffect, useState } from "react";

//file docs
export const STANDARD_LIMIT = 2;
export const PRO_LIMIT = 22;
export const ULTIMATE_LIMIT = 50;

function useSubcription() {
  const [hasActiveMembership, setHasActiveMembership] = useState<Plans>();
  const [isOverFileLimit, setIsOverFileLimit] = useState(false);
  const { user } = useUser();
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [usersLimit, setUsersLimit] = useState<number>();
  const [loading, setLoading] = useState(false);
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
      console.log("User PDF files:", files);

      const limit =
        hasActiveMembership === "STANDARD"
          ? STANDARD_LIMIT
          : hasActiveMembership === "PRO"
          ? PRO_LIMIT
          : ULTIMATE_LIMIT;

      console.log("Calculated limit:", limit);
      setUsersLimit(limit);

      if (typeof files === "number") {
        setIsOverFileLimit(files >= limit);
      }
      setLoading(false);
    };

    getPdfFiles();
  }, [user, hasActiveMembership, isFileUploaded]);

  const handleNewPdfUpload = () => {
    setIsFileUploaded((prev) => !prev);
  };
  return {
    hasActiveMembership,
    isOverFileLimit,
    handleNewPdfUpload,
    loading,
  };
}
export default useSubcription;
