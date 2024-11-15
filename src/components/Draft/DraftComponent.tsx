import React, { useEffect, useState, useTransition } from "react";
import { Input } from "../ui/input";
import DraftEditor from "./DraftEditor";
import { Button } from "../ui/button";
import {
  Mail,
  Send,
  Plus,
  Edit,
  EyeIcon,
  Save,
  Check,
  X,
  Loader2Icon,
} from "lucide-react";
import {
  Editor,
  EditorState,
  convertToRaw,
  convertFromRaw,
  ContentBlock,
  DraftStyleMap,
} from "draft-js";
import "draft-js/dist/Draft.css";
import { useAuth, useUser } from "@clerk/nextjs";
import useSWR from "swr";
import { getCustomers } from "@/actions/customer";
import { useGlobalStore } from "@/store/globalStore";

import { toast } from "sonner";
import { stateToHTML } from "draft-js-export-html";
import { getCampaign } from "@/actions/campaign";
type Contact = {
  email: string;
};

const customStyleMap: DraftStyleMap = {
  BLACK: { color: "black" },
  RED: { color: "#D0312D" },
  GREEN: { color: "#3CB043" },
  BLUE: { color: "#1338BE" },
  ORANGE: { color: "#FFA500" },
  PURPLE: { color: "#800080" },
  H1: { fontSize: "2em", fontWeight: "bold" },
  H2: { fontSize: "1.5em", fontWeight: "bold" },
  H3: { fontSize: "1.17em", fontWeight: "bold" },
};

function DraftComponent({ integrate }: { integrate: boolean }) {
  const { user } = useUser();
  const blockStyleFn = (contentBlock: ContentBlock): string => {
    const blockType = contentBlock.getType();

    if (blockType.startsWith("align-")) {
      const alignment = blockType.split("-")[1];
      const className = `custom-text-${alignment}`;
      return className;
    }

    if (blockType.startsWith("header-")) {
      const headerLevel = parseInt(blockType.split("-")[1], 10);
      switch (headerLevel) {
        case 1:
          return "custom-h1";
        case 2:
          return "custom-h2";
        case 3:
          return "custom-h3";
        default:
          return "";
      }
    }

    return "";
  };

  const {
    data: campaignData,
    isLoading: campaignLoading,
    mutate,
  } = useSWR(
    user ? `/api/getCampaign/${user?.id}` : null,
    user ? async () => await getCampaign(user?.id) : null
  );
  const [contactList, setContactList, subject, setSubject] = useGlobalStore(
    (state) => [
      state.contactList,
      state.setContactList,
      state.subject,
      state.setSubject,
    ]
  );

  const [showEmailList, setShowEmailList] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const [emailAddress, setEmailAddress] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewState, setPreviewState] = useState(() =>
    EditorState.createEmpty()
  );

  const { data: allCustomerContacts, isLoading: loading } = useSWR(
    `/api/getCustomers/${user?.id}`,
    user ? async () => await getCustomers(user?.id) : null
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedContent = localStorage.getItem("draftContent");
      if (savedContent) {
        const content = convertFromRaw(JSON.parse(savedContent));
        setEditorState(EditorState.createWithContent(content));
      }
    }
  }, []);

  const saveContent = () => {
    const content = editorState.getCurrentContent();
    localStorage.setItem("draftContent", JSON.stringify(convertToRaw(content)));
  };

  const handlePreview = () => {
    setPreviewState(editorState);
    setShowPreview(!showPreview);
  };

  const toggleEmailList = () => {
    setShowEmailList(!showEmailList);
  };

  const removeContact = (emailToRemove: any) => {
    setContactList(
      contactList.filter((contact) => contact.email !== emailToRemove)
    );
  };
  const isEmailSelected = (email: string) => {
    return contactList.some((contact) => contact.email === email);
  };

  const handleEmailSelect = (contact: Contact) => {
    if (isEmailSelected(contact.email)) {
      const updatedList = contactList.filter(
        (item) => item.email !== contact.email
      );
      setContactList(updatedList);
    } else {
      const updatedList = [...contactList, contact];
      setContactList(updatedList);
    }
  };

  const sendMail = async () => {
    const contentState = editorState.getCurrentContent();

    const options = {
      inlineStyles: {
        H1: { element: "h1" },
        H2: { element: "h2" },
        H3: { element: "h3" },
        BLACK: { style: { color: "black" } },
        RED: { style: { color: "#D0312D" } },
        GREEN: { style: { color: "#3CB043" } },
        BLUE: { style: { color: "#1338BE" } },
        ORANGE: { style: { color: "#FFA500" } },
        PURPLE: { style: { color: "#800080" } },
      },
      blockStyleFn: (block: ContentBlock) => {
        const type = block.getType();
        if (type.startsWith("header-")) {
          return {
            element: `h${type.split("-")[1]}`,
          };
        }
      },
    };

    const content = stateToHTML(contentState, options);

    startTransition(async () => {
      const res = fetch("/api/sendCampaign", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          contactList: contactList,
          rawContent: content,
          subject,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.success) {
            setSubject("");
            setContactList([]);
            setEditorState(EditorState.createEmpty());
          }
          return data;
        });
      await mutate();
      toast.promise(res, {
        success: "Email sent",
        loading: "Sending mail...",
        error: "Error occurred while sending mail",
      });
    });
  };
  const addNewEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setContactList([...contactList, { email: emailAddress }]);
    setEmailAddress("");
  };
  return (
    <div className='flex-1 flex overflow-hidden'>
      <div className='w-full bg-white dark:bg-gray-900'>
        <div>
          <div className='flex flex-col space-y-2'>
            <div className='p-2 border rounded-md dark:bg-gray-950'>
              <div className='flex flex-wrap gap-2 items-center'>
                {contactList.map((contact) => (
                  <div
                    key={contact.email}
                    className='flex items-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md'
                  >
                    <span className='text-sm mr-2'>{contact.email}</span>
                    <X
                      className='h-4 w-4 cursor-pointer hover:text-red-500'
                      onClick={() => removeContact(contact.email)}
                    />
                  </div>
                ))}
                <button
                  onClick={toggleEmailList}
                  className='p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full'
                >
                  <Plus className='h-5 w-5 text-gray-900 dark:text-gray-100' />
                </button>
              </div>
            </div>

            {showEmailList && (
              <div className='border rounded-md p-4 dark:bg-gray-950'>
                <h3 className='text-sm font-medium mb-2'>Select Recipients</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2'>
                  {allCustomerContacts?.map((contact) => {
                    const selected = isEmailSelected(contact.email);
                    return (
                      <div
                        key={contact.email}
                        className={`flex items-center justify-between p-1 py-2 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          selected ? "bg-gray-50 dark:bg-gray-800 " : ""
                        }`}
                        onClick={() => handleEmailSelect(contact)}
                      >
                        <span className='text-sm'>{contact.email}</span>
                        {selected && (
                          <Check className='h-4 w-4 text-green-500 flex-shrink-0' />
                        )}
                      </div>
                    );
                  })}
                  <form onSubmit={addNewEmail}>
                    <Input
                      placeholder='Type Recipient Email'
                      type='email'
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                    />
                    <button type='submit' hidden></button>
                  </form>
                </div>
              </div>
            )}
          </div>

          <Input
            placeholder='Subject:'
            name={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className='mb-2 mt-2'
            maxLength={500}
            minLength={2}
          />
        </div>

        {showPreview ? (
          <div className='w-full lg:h-[calc(100vh-485px)] md:h-[calc(100vh-540px)] border rounded-md p-2'>
            <Editor
              editorState={previewState}
              readOnly={true}
              onChange={() => {}}
              customStyleMap={customStyleMap}
              blockStyleFn={blockStyleFn}
            />
          </div>
        ) : (
          <div className='w-full lg:h-[calc(100vh-485px)]'>
            <DraftEditor
              editorState={editorState}
              setEditorState={setEditorState}
              blockStyleFn={blockStyleFn}
            />
          </div>
        )}

        <div className='flex flex-row w-full justify-between items-center mt-4'>
          <Button type='button' onClick={handlePreview} variant='ghost'>
            {showPreview ? (
              <Edit className='h-4 w-4 mr-2' />
            ) : (
              <EyeIcon className='h-4 w-4 mr-2' />
            )}
            {showPreview ? "Edit Text" : "Preview"}
          </Button>
          <div className='flex justify-end space-x-2'>
            <Button type='button' variant='outline' onClick={saveContent}>
              <Save className='h-4 w-4 mr-2' />
              Save Draft
            </Button>

            {integrate ? (
              <Button
                disabled={
                  isPending ||
                  !subject ||
                  contactList.length === 0 ||
                  !editorState.getCurrentContent().hasText()
                }
                onClick={sendMail}
                type='submit'
                className={` dark:bg-gray-200/50`}
              >
                {isPending ? (
                  <Loader2Icon className='h-4 w-4 animate-spin' />
                ) : (
                  <>
                    <Send className='h-4 w-4 mr-2' />
                    Send
                  </>
                )}
              </Button>
            ) : null}
          </div>
        </div>

        <div className='bg-gray-50 dark:bg-gray-900 dark:border rounded-md p-4 mt-4'>
          {integrate ? (
            <>
              <h3 className='text-sm font-medium text-gray-700 dark:text-gray-400 mb-2'>
                Preview Text
              </h3>
              <p className='text-sm text-gray-400'>
                This text will appear in the inbox preview of your
                recipient&#39;s email client.
              </p>
            </>
          ) : (
            <>
              <h3 className='text-sm font-medium text-red-500 mb-2'>
                Integration Required
              </h3>
              <p className='text-sm text-gray-400'>
                Complete the integration to set up your account and start using
                our email campaign tool.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DraftComponent;
