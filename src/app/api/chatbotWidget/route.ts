import { NextResponse } from "next/server";

export async function GET() {
  const jsContent = `
    (function() {

            const existingIframe = document.querySelector('.chat-frame');
            if (existingIframe) {
                console.log("iframe already existing")
                 return;
          }

          if (window.location.pathname.startsWith('/chatbot')) {
            return;
        }

      const script = document.currentScript;
      const name = script?.getAttribute("data-name");
      const address = script?.getAttribute("data-address");
      const id = script?.getAttribute("data-id");
      const widgetSize = script?.getAttribute("data-widget-size");
      const widgetButtonSize = script?.getAttribute("data-widget-button-size");

      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const chatbotUrl = isProduction ? \`\${address}/chatbot\` : 'http://localhost:3000/chatbot';
   // const chatbotUrl = isProduction ? address : 'http://localhost:3000';

      const iframeStyles = (styleString) => {
        const style = document.createElement('style');
        style.textContent = styleString;
        document.head.append(style);
      };

      iframeStyles(\`
        .chat-frame {
          position: fixed;
          bottom: 10px;
          right: 10px;
          border: none;
          width: 80px;
          height: 80px;
          z-index: 999;
          transition: width 0.3s ease, height 0.3s ease;
        }
      \`);

      const iframe = document.createElement("iframe");
      iframe.src = chatbotUrl;
      iframe.classList.add("chat-frame");
      document.body.appendChild(iframe);

      window.addEventListener("message", (e) => {

        if (e.origin !== new URL(chatbotUrl).origin) return;

        try {

            let data;

            if (typeof e.data === 'string') {
              try {
                // Try to parse if it's a JSON string
                data = JSON.parse(e.data);
              } catch (parseError) {
                // If it's not JSON, we treat it as a simple string message (likely the UUID)
                data = e.data;  // This could be your botId or other simple message
              }
            } else {
              // If it's an object (could be already parsed), use it as is
              data = e.data;
            }
            if (data && data.width && data.height) {
                iframe.style.width = \`\${data.width}px\`;
                iframe.style.height = \`\${data.height}px\`;
              }

              // Send the ID back to the iframe (no need to stringify simple strings)
              iframe.contentWindow.postMessage(id, chatbotUrl);

        } catch (error) {
          console.error("Error parsing message data:", error);
        }
      });
    })();

  `;

  return new NextResponse(jsContent, {
    headers: {
      "Content-Type": "application/javascript",
    },
  });
}
