"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Script from "next/script";
import { toast } from "sonner";
import {
  fetchWhatsAppDetails,
  getWhatsAppPhoneNumber,
  updateChatbotWhatsApp,
} from "@/actions/whatsapp";

import useSubcription from "@/hook/useSubscription";
import { AlertCircle } from "lucide-react";

type FacebookSDK = {
  init: (config: {
    appId: string;
    version: string;
    status?: boolean;
    cookie?: boolean;
    xfbml: boolean;
    autoLogAppEvents?: boolean;
  }) => void;
  login: (
    callback: (response: any) => void,
    options: {
      config_id: string;
      response_type: string;
      override_default_response_type: boolean;
      extras: {
        setup: Record<string, any>;
        featureType: string;
        sessionInfoVersion: string;
      };
    }
  ) => void;
};

declare global {
  var FB: FacebookSDK | undefined;
  interface Window {
    fbAsyncInit: () => void;
  }
}

// Create a type for the WhatsApp signup data
type WhatsAppSignupData = {
  business_id: string;
  phone_number_id: string;
  waba_id: string;
};

const WhatsAppComponent = ({
  chatbot,
  userId,
}: {
  chatbot: any;
  userId: string;
}) => {
  const embeddedSignupRef = useRef<HTMLDivElement>(null);
  const [whatsAppEnabled, setWhatsAppEnabled] = useState(
    chatbot?.enableWhatsApp || false
  );
  const { hasActiveMembership } = useSubcription();
  const [phoneId, setPhoneId] = useState(chatbot?.whatsappPhoneId || "");
  const [phoneNumber, setPhoneNumber] = useState(chatbot?.whatsappNumber || "");
  const [whatsappBusinessId, setWhatsappBusinessId] = useState(
    chatbot?.whatsappBusinessId || ""
  );
  const [whatsappToken, setWhatsappToken] = useState(
    chatbot?.whatsappToken || ""
  );
  const [phoneNumbers, setPhoneNumbers] = useState<
    { id: string; number: string }[]
  >([]);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();
  // Store WhatsApp signup data temporarily if token isn't available yet
  const [pendingSignupData, setPendingSignupData] =
    useState<WhatsAppSignupData | null>(null);

  const whatsappChatLink = phoneNumber
    ? `https://wa.me/${phoneNumber.replace("+", "")}`
    : null;

  useEffect(() => {
    window.fbAsyncInit = function () {
      window?.FB?.init({
        appId: process.env.NEXT_PUBLIC_META_APP_ID!,
        autoLogAppEvents: true,
        xfbml: true,
        version: "v22.0",
      });
      setIsScriptLoaded(true);
    };
  }, []);

  // Effect to handle when both the token and signup data are available
  useEffect(() => {
    const processWhatsAppData = async () => {
      // Only proceed if we have both pieces of data
      if (!pendingSignupData || !whatsappToken) return;

      const { business_id, phone_number_id, waba_id } = pendingSignupData;

      try {
        // Set the IDs immediately
        setPhoneId(phone_number_id);
        setWhatsappBusinessId(business_id);

        // Fetch phone number using the phone ID and token
        const phoneNumberResult = await getWhatsAppPhoneNumber(
          phone_number_id,
          whatsappToken
        );

        if (!phoneNumberResult) {
          throw new Error("Failed to retrieve WhatsApp phone number");
        }

        setPhoneNumber(phoneNumberResult);

        // Update chatbot and user info
        const chatbotResult = await updateChatbotWhatsApp(chatbot.id, {
          enableWhatsApp: true,
          whatsappPhoneId: phone_number_id,
          whatsappNumber: phoneNumberResult,
          whatsappBusinessId: business_id,
          whatsappToken: whatsappToken,
        });
        if (chatbotResult.success) {
          toast.success(`Connected to WhatsApp number: ${phoneNumberResult}`);
          setPendingSignupData(null);
        } else {
          throw new Error("Failed to save WhatsApp details");
        }
      } catch (error) {
        console.error("Error processing WhatsApp data:", error);
        toast.error((error as Error).message || "Failed to setup WhatsApp");
      }
    };

    processWhatsAppData();
  }, [pendingSignupData, whatsappToken, chatbot.id, userId]);

  // Listen for WhatsApp signup message
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Check valid origins
      if (
        !["https://www.facebook.com", "https://web.facebook.com"].includes(
          event.origin
        )
      ) {
        return;
      }

      try {
        // Try to parse the message data as JSON
        const data = JSON.parse(event.data);

        // Verify this is the WhatsApp signup finish event
        if (data.type === "WA_EMBEDDED_SIGNUP" && data.event === "FINISH") {
          // Extract values from event data
          const { business_id, phone_number_id, waba_id } = data.data;

          // Store the data to be processed once we have the token
          setPendingSignupData({
            business_id,
            phone_number_id,
            waba_id,
          });

          // If we already have a token, the useEffect will process this immediately
        }
      } catch (error) {
        // This could happen for non-JSON messages, which is normal
        if (!(error instanceof SyntaxError)) {
          throw new Error("Error processing Facebook message:", error as any);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [whatsappToken]);

  const fbLoginCallback = (response: any) => {
    if (response.authResponse) {
      const code = response.authResponse.code;

      startTransition(async () => {
        const result = await fetchWhatsAppDetails(code);

        if (result.success && result.data?.accessToken) {
          const accessToken = result.data.accessToken;

          // Store the token
          setWhatsappToken(accessToken);

          toast.success("WhatsApp authentication successful!");
        } else {
          toast.error("Failed to fetch WhatsApp details: " + result.error);
        }
      });
    } else {
      toast.error("Failed to authenticate with Facebook");
      setWhatsAppEnabled(false);
    }
  };

  const launchWhatsAppSignup = () => {
    if (hasActiveMembership === "STANDARD") return;
    if (!window.FB) {
      toast.error("Facebook SDK not loaded yet");
      return;
    }
    if (!isScriptLoaded) {
      toast.error("Facebook SDK not initialized yet");
      return;
    }
    window?.FB.login(fbLoginCallback, {
      config_id: "1182999359961389",
      response_type: "code",
      override_default_response_type: true,
      extras: {
        setup: {},
        featureType: "whatsapp_embedded_signup",
        sessionInfoVersion: "3",
      },
    });
  };

  const handleWhatsAppToggle = (checked: boolean) => {
    setWhatsAppEnabled(checked);
    if (!checked && phoneId) {
      startTransition(async () => {
        const result = await updateChatbotWhatsApp(chatbot.id, {
          enableWhatsApp: false,
          whatsappPhoneId: null,
          whatsappNumber: null,
          whatsappToken: null,
          whatsappBusinessId: null,
        });
        if (result.success) {
          setPhoneId("");
          setPhoneNumber("");
          setWhatsappBusinessId("");
          setWhatsappToken("");
          setPhoneNumbers([]);
          toast.success("WhatsApp integration disabled");
        } else {
          toast.error("Failed to disable WhatsApp");
          setWhatsAppEnabled(true);
        }
      });
    }
  };

  const handlePhoneNumberSelect = async (selectedPhoneId: string) => {
    const selectedPhone = phoneNumbers.find(
      (phone) => phone.id === selectedPhoneId
    );
    if (!selectedPhone) return;

    startTransition(async () => {
      const chatbotResult = await updateChatbotWhatsApp(chatbot.id, {
        enableWhatsApp: true,
        whatsappPhoneId: selectedPhone.id,
        whatsappNumber: selectedPhone.number,
        whatsappBusinessId,
        whatsappToken,
      });

      if (chatbotResult.success) {
        setPhoneId(selectedPhone.id);
        setPhoneNumber(selectedPhone.number);
        toast.success(`Connected to WhatsApp number: ${selectedPhone.number}`);
      } else {
        toast.error("Failed to save WhatsApp details");
      }
    });
  };

  return (
    <div className='col-span-5 mt-8'>
      <Script
        async
        defer
        src='https://connect.facebook.net/en_US/sdk.js'
        onLoad={() => console.warn("Facebook SDK script loaded")}
        onError={(e) => {
          console.error("SDK Load Error:", e);
          toast.error("Failed to load Facebook SDK");
        }}
      />

      {hasActiveMembership === "STANDARD" ? (
        <div className='grid grid-cols-1 gap-1'>
          <h3 className='font-bold text-lg border-t pt-8 border-gray-200 dark:border-gray-700 '>
            WhatsApp Integration
          </h3>
          <h5 className='text-amber-600 font-medium flex items-center gap-2 mb-2'>
            <AlertCircle className='h-4 w-4' /> Premium feature
          </h5>
        </div>
      ) : (
        <h3 className='text-xl font-semibold text-gray-700'>
          WhatsApp Integration
        </h3>
      )}

      <div className='flex items-center justify-between p-4 border rounded-lg dark:border-gray-700'>
        <div>
          <h3 className='font-medium'>Enable WhatsApp</h3>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Connect your chatbot to WhatsApp Business API
          </p>
        </div>
        <Switch
          checked={whatsAppEnabled}
          onCheckedChange={handleWhatsAppToggle}
          disabled={hasActiveMembership === "STANDARD" || isPending}
        />
      </div>

      {whatsAppEnabled && (
        <div className='p-4 border rounded-lg space-y-6 mt-4 dark:border-gray-700'>
          {phoneNumber && (
            <div className='bg-green-100 dark:bg-green-900/20 p-3 rounded-lg'>
              <p className='text-sm'>
                Connected WhatsApp Number:{" "}
                <span className='font-medium'>{phoneNumber}</span>
              </p>
              {whatsappChatLink && (
                <p className='text-sm mt-1'>
                  Chat Link:{" "}
                  <a
                    href={whatsappChatLink}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 hover:underline'
                  >
                    {whatsappChatLink}
                  </a>
                </p>
              )}
            </div>
          )}

          {!phoneId && (
            <div className='space-y-4'>
              <div className='bg-gray-100 p-4 rounded-lg dark:bg-gray-800'>
                <h4 className='font-medium mb-2'>Connect WhatsApp Business</h4>
                <p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
                  Complete the Meta onboarding to connect your WhatsApp Business
                  account
                </p>
                <button
                  onClick={launchWhatsAppSignup}
                  className='bg-[#1877f2] text-white px-6 py-2 rounded font-bold hover:bg-[#1666d2] disabled:bg-gray-400'
                  disabled={!isScriptLoaded || isPending}
                >
                  {isPending ? "Processing..." : "Login with Facebook"}
                </button>
              </div>
            </div>
          )}

          {isPending && (
            <div className='flex justify-center py-4'>
              <div className='animate-pulse text-center'>
                <p className='text-sm text-gray-500'>Processing request...</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WhatsAppComponent;
