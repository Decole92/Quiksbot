import { getBlocksById, getBotPosition } from "@/actions/user";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing ID parameter" },
        { status: 400 }
      );
    }
    const [blockedPages, botPosition] = await Promise.all([
      getBlocksById(id),
      getBotPosition(id),
    ]);

    const blockedPagesArray = blockedPages || [];

    const jsContent = `
      (function() {
        let chatFrame = null;

        const isPathBlocked = (path) => {
          const blockedPages = ${JSON.stringify(blockedPagesArray)};
          return blockedPages.some(page => path.startsWith(page)) || path.startsWith('/chatbot');
        };

        const createChatbotIframe = () => {
          if (chatFrame) return;

          const script = document.querySelector('script[data-address]');
          const address = script?.getAttribute('data-address');
          const position = ${JSON.stringify(botPosition)};
          const id = "${id}"

          if (!address || !id) {
            console.error('Missing data attributes in the script tag.');
            return;
          }

          const isProduction = !['localhost', '127.0.0.1'].includes(window.location.hostname);
          const chatbotUrl = isProduction ? \`\${address}/chatbot\` : 'http://localhost:3000/chatbot';

          const style = document.createElement('style');
          style.textContent = \`
            .chat-frame {
              position: fixed;
              bottom: 10px;
               \${
              position === "center"
                ? "left: 50%; transform: translateX(-50%);"
                : position === "right"
                  ? "right: 10px;"
                  : "left: 10px;"
            }
              border: none;
              width: 80px;
              height: 80px;
              z-index: 999;
              transition: width 0.3s ease, height 0.3s ease;
            }
          \`;
          document.head.appendChild(style);

          chatFrame = document.createElement("iframe");
          chatFrame.src = chatbotUrl;
          chatFrame.classList.add("chat-frame");
          document.body.appendChild(chatFrame);

          const handleMessage = (e) => {
            if (e.origin !== new URL(chatbotUrl).origin) return;
           

            try {
              const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;

              if (data && data.width && data.height) {
                chatFrame.style.width = \`\${data.width}px\`;
                chatFrame.style.height = \`\${data.height}px\`;
              }

              if (chatFrame && chatFrame.contentWindow) {
                chatFrame.contentWindow.postMessage(id, chatbotUrl);
              }
            } catch (error) {
              console.error("Error processing message data:", error);
            }
          };

          window.addEventListener("message", handleMessage);
        };

        const removeChatbotIframe = () => {
          if (chatFrame) {
            chatFrame.remove();
            chatFrame = null;
          }
        };

        const updateChatbotVisibility = () => {
          const currentPath = window.location.pathname;
          if (isPathBlocked(currentPath)) {
            removeChatbotIframe();
          } else {
            createChatbotIframe();
          }
        };

        // Initial check
        updateChatbotVisibility();

        // Listen for navigation changes
        const observer = new MutationObserver(() => {
          updateChatbotVisibility();
        });
        observer.observe(document.body, { childList: true, subtree: true });

        // Listen for popstate events (back/forward navigation)
        window.addEventListener('popstate', updateChatbotVisibility);
      })();
    `;

    return new NextResponse(jsContent, {
      headers: {
        "Content-Type": "application/javascript",
      },
    });
  } catch (err) {
    console.error("Error in GET function:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
