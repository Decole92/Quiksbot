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
        let isChatbotOpen = false;
        let showGreeting = false;

        const isPathBlocked = (path) => {
          const blockedPages = ${JSON.stringify(blockedPagesArray)};
          return blockedPages.some(page => path.startsWith(page)) || path.startsWith('/chatbot');
        };

        const isMobile = () => window.innerWidth <= 768;

        const updateFrameSize = () => {
          if (!chatFrame) return;

          // Set z-index based on chatbot open state
          chatFrame.style.zIndex = isChatbotOpen ? '9999' : '1';
          // chatFrame.style.background = 'white';

          if (isMobile()) {
            // Full screen for mobile when open
            if (isChatbotOpen) {
              chatFrame.style.width = '100%';
              chatFrame.style.height = '100%';
              chatFrame.style.top = '0';
              chatFrame.style.left = '0';
              chatFrame.style.right = '0';
              chatFrame.style.bottom = '0';
              chatFrame.style.transform = 'none';
            } else if(showGreeting) {
              // Default size when closed on mobile
              chatFrame.style.width = '240px';
              chatFrame.style.height = '160px';
              chatFrame.style.bottom = '10px';
              chatFrame.style.right = '10px';
              chatFrame.style.top = 'auto';
              chatFrame.style.left = 'auto';
              chatFrame.style.transform = 'none';
            }else{
              chatFrame.style.width = '50px';
              chatFrame.style.height = '60px';
              chatFrame.style.bottom = '10px';
              chatFrame.style.right = '10px';
              chatFrame.style.top = 'auto';
              chatFrame.style.left = 'auto';
              chatFrame.style.transform = 'none';
            }


          } else {
            // Desktop dimensions
            if (isChatbotOpen) {
              chatFrame.style.width = '500px';
              chatFrame.style.height = '700px';
            } else if(showGreeting){
              chatFrame.style.width = '250px';
              chatFrame.style.height = '150px';
            }else{
              chatFrame.style.width = '50px';
              chatFrame.style.height = '60px';
            }
            chatFrame.style.top = 'auto';

            const position = ${JSON.stringify(botPosition)};

            // Restrict position to left, right, or center for desktop
            if (position === "center") {
              chatFrame.style.left = '50%';
              chatFrame.style.transform = 'translateX(-50%)';
              chatFrame.style.bottom = '10px';
            } else if (position === "right") {
              chatFrame.style.right = '10px';
              chatFrame.style.left = 'auto';
              chatFrame.style.bottom = '10px';
              chatFrame.style.transform = 'none';
            } else if (position === "left") {
              chatFrame.style.left = '10px';
              chatFrame.style.right = 'auto';
              chatFrame.style.bottom = '10px';
              chatFrame.style.transform = 'none';
            }
          }
        };

        const createChatbotIframe = () => {
          if (chatFrame) return;

          const script = document.querySelector('script[data-address]');
          const address = script?.getAttribute('data-address');
          const id = "${id}";

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
              border: none;
              width: 50px;
              height: 60px;
              transition: all 0.3s ease;
              border-radius: 8px;
              // box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }

            @media (max-width: 768px) {
              .chat-frame {
                border-radius: 0;
              }
            }
          \`;

          document.head.appendChild(style);

          chatFrame = document.createElement("iframe");
          chatFrame.src = chatbotUrl;
          chatFrame.classList.add("chat-frame");
          document.body.appendChild(chatFrame);

          updateFrameSize();

          const handleMessage = (e) => {
            if (e.origin !== new URL(chatbotUrl).origin) return;

            try {
            if (e.data === 'chatbot-opened') {
            isChatbotOpen = true;
            showGreeting = false;
           
            updateFrameSize();
             } else if (e.data === 'chatbot-closed') {
               isChatbotOpen = false;
               updateFrameSize();
             }

           if (e.data === 'greeting-opened') {
            showGreeting = true;
            isChatbotOpen = false;
          
            updateFrameSize();
            } else if (e.data === 'greeting-closed') {
            showGreeting = false;
            updateFrameSize();
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

        // Listen for window resize
        window.addEventListener('resize', updateFrameSize);

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
        "Content-Type": "application/javascript; charset=utf-8",
        // Cache for 5 minutes at the edge, 1 minute for the browser
        "Cache-Control": "public, s-maxage=300, max-age=60, stale-while-revalidate=600",
        "Vary": "Accept-Encoding",
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
