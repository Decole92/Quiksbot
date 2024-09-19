import { getBot } from "@/actions/bot";
import useSubcription from "@/hook/useSubscription";
import { cn } from "@/lib/utils";
import { CheckCheckIcon, HammerIcon, RocketIcon, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";
import Dropzone from "react-dropzone";
import { toast } from "sonner";
import useSWR from "swr";

function DropzoneComponent({ chatbotId }: { chatbotId: string }) {
  const {
    isOverFileLimit,
    handleNewPdfUpload,
    loading: setter,
  } = useSubcription();
  const [isUploading, startUploading] = useTransition();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const maxSize = 5000000;
  const acceptedFileTypes = {
    "application/pdf": [".pdf"],
  };
  const { mutate } = useSWR("/api/getBot", async () => await getBot(chatbotId));
  const uploadFile = async (selectedFile: File) => {
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("chatbotId", chatbotId);
    startUploading(async () => {
      const response = fetch("/api/uploadPdf", {
        method: "POST",
        body: formData,
      });

      toast.promise(response, {
        loading: "Uploading Pdf file",
        success: `${selectedFile?.name} uploaded successfully`,
        error:
          "Error while uploading pdf file, Upgrade your plan to enable you upload more pdf files.",
      });

      const result = await response;
      const data = await result.json();
      mutate();
      if (data?.completed) {
        router.push(`/edit-chatbot/${chatbotId}`);
      }
      handleNewPdfUpload();
    });
  };

  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = async () => {
        setLoading(true);
        await uploadFile(file);
        setLoading(false);
      };

      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <Dropzone
      disabled={isOverFileLimit || isUploading || loading}
      minSize={0}
      onDrop={onDrop}
      maxFiles={1}
      accept={acceptedFileTypes}
    >
      {({
        getRootProps,
        getInputProps,
        isDragActive,
        isDragReject,
        fileRejections,
      }) => {
        const isFileTooLarge =
          fileRejections.length > 0 && fileRejections[0].file.size > maxSize;

        return (
          <section className='w-full text-black mt-4 '>
            <div
              {...getRootProps()}
              className={cn(
                "border border-dashed w-full h-52 flex justify-center items-center p-5 rounded-md",
                isDragActive
                  ? "bg-gray-500 text-white animate-pulse"
                  : "bg-gray-200/50 text-black dark:bg-gray-950 dark:text-gray-400"
              )}
            >
              <input disabled={loading} {...getInputProps()} />
              <Upload className='mr-4' />
              {!isDragActive && "Click here or drop a file to upload!"}
              {isDragActive && !isDragReject && "Drop to upload this file!"}
              {isDragReject && "File type not accepted, sorry!"}
              {/* {isFileTooLarge && (
        <p className="text-red-500 px-5">File is too big</p>
      )} */}
            </div>

            <div className='flex p-4  flex-col items-center justify-center text-gray-500 text-sm'>
              <p>
                If you are uploading a PDF, make sure you can select/highlight
                the text.
              </p>
              {setter ? null : isOverFileLimit ? (
                <p className='text-red-500'>
                  Upgrade your plan to upload more pdf files.
                </p>
              ) : null}
            </div>
          </section>
        );
      }}
    </Dropzone>
  );
}

export default DropzoneComponent;
