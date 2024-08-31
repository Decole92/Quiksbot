import React from "react";
import { Input } from "../ui/input";
import { BASE_URL } from "../../../constant/url";
import { Button } from "../ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

function Connect({ chatbot }: { chatbot: ChatBot }) {
  const InputValue = `${BASE_URL}/chatbot/${chatbot?.id}`;

  let snippet = `
  const iframe = document.createElement("iframe");
  
  const iframeStyles = (styleString) => {
  const style = document.createElement('style');
  style.textContent = styleString;
  document.head.append(style);
  }
  
  iframeStyles('
      .chat-frame {
          position: fixed;
          bottom: 50px;
          right: 50px;
          border: none;
      }
  ')
  
  iframe.src = '${BASE_URL}'/chatbot
  iframe.classList.add('chat-frame')
  document.body.appendChild(iframe)
  
  window.addEventListener("message", (e) => {
      if(e.origin !== '${BASE_URL}') return null
      let dimensions = JSON.parse(e.data)
      iframe.width = dimensions.width
      iframe.height = dimensions.height
      iframe.contentWindow.postMessage("${chatbot?.id}", ${BASE_URL})
  })
      `;

  return (
    <div className='border border-gray-300 rounded-md p-5 h-full max-w-5xl mx-auto bg-white md:p-7 lg:p-7 '>
      <h3 className='text-2xl pb-4 font-thin'>Connect Bot</h3>
      <div className='grid grid-cols-5  h-full  rounded-lg gap-5  '>
        <div className='col-span-5 lg:col-span-5 '>
          <div>
            <h3 className='font-bold text-lg'>{`Link to ${chatbot?.name}`}</h3>
            <h5 className='pb-2 '>
              Share this link with your customers to start conversations with
              your chatbot
            </h5>
            <div className='bg-gray-200/50 p-3 rounded-md  flex items-center  w-full gap-2'>
              <Input disabled value={InputValue} className='flex-1' />
              <Button
                className='bg-black h-full '
                onClick={() => {
                  navigator.clipboard.writeText(InputValue);
                  toast.success("Copied to clipboard");
                }}
              >
                <Copy />
              </Button>
            </div>
          </div>
        </div>

        <div className='col-span-5 lg:col-span-5 '>
          <h3 className='font-bold text-lg'>{` ${chatbot?.name} Snippet Code  `}</h3>
          <h5 className='pb-2 '>
            Copy and paste this code snippet into the header tag of your website
          </h5>
          <div className='bg-gray-200/50 px-10 rounded-lg inline-block relative w-full'>
            <Button
              variant={"ghost"}
              className='absolute top-2 right-0 text-black'
              onClick={() => {
                navigator.clipboard.writeText(snippet);
                toast.success("Copied to clipboard");
              }}
            >
              <Copy />
            </Button>
            <div className='w-full overflow-x-auto'>
              <pre>
                <code className='text-gray-500'>{snippet}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Connect;
