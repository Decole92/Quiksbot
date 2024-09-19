// //working junk
// import { getBlocksByUserId } from "@/actions/user";
// import { auth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// export async function GET(req: Request) {
//   try {
//     const { userId } = auth();
//     if (!userId) {
//       return NextResponse.json(
//         { error: "User not authenticated" },
//         { status: 401 }
//       );
//     }

//     // Get blocked pages from the database using the userId
//     const blockedPages = await getBlocksByUserId(userId);

//     const blockedPagesArray = blockedPages || [];
//     console.log("blockarray", blockedPages);

//     const jsContent = `
//       (function() {
//         const existingIframe = document.querySelector('.chat-frame');
//         if (existingIframe) {
//           console.log("iframe already exists");
//           return;
//         }

//         const currentPath = window.location.pathname;
//         const blockedPages = ${JSON.stringify(
//           blockedPagesArray
//         )}; // Inject blockedPages from server
//         const isBlocked = blockedPages.some(page => currentPath.startsWith(page));

//         // Prevent iframe from loading on blocked pages or /chatbot path
//         console.log('this is from backend', isBlocked);

//         if (isBlocked || currentPath.startsWith('/chatbot')) {
//           console.log('This page is blocked for the chatbot iframe.');
//           return;
//         }

//         const script = document.currentScript;
//         const address = script?.getAttribute("data-address");
//         const id = script?.getAttribute("data-id");

//         if (!address || !id) {
//           console.error('Missing data attributes in the script tag.');
//           return;
//         }

//         const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
//         const chatbotUrl = isProduction ? \`\${address}/chatbot\` : 'http://localhost:3000/chatbot';

//         // Inject styles for the iframe
//         const iframeStyles = (styleString) => {
//           const style = document.createElement('style');
//           style.textContent = styleString;
//           document.head.append(style);
//         };

//         iframeStyles(\`
//           .chat-frame {
//             position: fixed;
//             bottom: 10px;
//             right: 10px;
//             border: none;
//             width: 80px;
//             height: 80px;
//             z-index: 999;
//             transition: width 0.3s ease, height 0.3s ease;
//           }
//         \`);

//         const iframe = document.createElement("iframe");
//         iframe.src = chatbotUrl;
//         iframe.classList.add("chat-frame");
//         document.body.appendChild(iframe);

//         window.addEventListener("message", (e) => {
//           if (e.origin !== new URL(chatbotUrl).origin) return;

//           try {
//             let data;
//             if (typeof e.data === 'string') {
//               try {
//                 data = JSON.parse(e.data);
//               } catch (parseError) {
//                 data = e.data;  // If not JSON, treat as string
//               }
//             } else {
//               data = e.data;  // If it's already an object, use as is
//             }

//             if (data && data.width && data.height) {
//               iframe.style.width = \`\${data.width}px\`;
//               iframe.style.height = \`\${data.height}px\`;
//             }

//             iframe.contentWindow.postMessage(id, chatbotUrl);
//           } catch (error) {
//             console.error("Error parsing message data:", error);
//           }
//         });
//       })();
//     `;

//     // Return the generated JavaScript as a response
//     return new NextResponse(jsContent, {
//       headers: {
//         "Content-Type": "application/javascript",
//       },
//     });
//   } catch (err) {
//     return new NextResponse(`Error occurred: ${err}`, { status: 500 });
//   }
// }

///working partially

// import { getBlocksByUserId } from "@/actions/user";
// import { auth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// export async function GET(req: Request) {
//   try {
//     const { userId } = auth();
//     if (!userId) {
//       return NextResponse.json(
//         { error: "User not authenticated" },
//         { status: 401 }
//       );
//     }

//     const blockedPages = await getBlocksByUserId(userId);
//     const blockedPagesArray = blockedPages || [];

//     const jsContent = `
//       (function() {
//         const createChatbotIframe = () => {
//           const existingIframe = document.querySelector('.chat-frame');
//           if (existingIframe) {
//             console.log("iframe already exists");
//             return;
//           }

//           const currentPath = window.location.pathname;
//           const blockedPages = ${JSON.stringify(blockedPagesArray)};
//           const isBlocked = blockedPages.some(page => currentPath.startsWith(page));

//           if (isBlocked || currentPath.startsWith('/chatbot')) {
//             console.log('This page is blocked from loading the chatbot iframe.');
//             return;
//           }

//           const script = document.querySelector('script[data-address][data-id]');
//           const address = script?.getAttribute("data-address");
//           const id = script?.getAttribute("data-id");

//           if (!address || !id) {
//             console.error('Missing data attributes in the script tag.');
//             return;
//           }

//           const isProduction = !['localhost', '127.0.0.1'].includes(window.location.hostname);
//           const chatbotUrl = isProduction ? \`\${address}/chatbot\` : 'http://localhost:3000/chatbot';

//           const style = document.createElement('style');
//           style.textContent = \`
//             .chat-frame {
//               position: fixed;
//               bottom: 10px;
//               right: 10px;
//               border: none;
//               width: 80px;
//               height: 80px;
//               z-index: 999;
//               transition: width 0.3s ease, height 0.3s ease;
//             }
//           \`;
//           document.head.appendChild(style);

//           const iframe = document.createElement("iframe");
//           iframe.src = chatbotUrl;
//           iframe.classList.add("chat-frame");
//           document.body.appendChild(iframe);

//           window.addEventListener("message", (e) => {
//             if (e.origin !== new URL(chatbotUrl).origin) return;

//             try {
//               const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;

//               if (data && data.width && data.height) {
//                 iframe.style.width = \`\${data.width}px\`;
//                 iframe.style.height = \`\${data.height}px\`;
//               }

//               iframe.contentWindow.postMessage(id, chatbotUrl);
//             } catch (error) {
//               console.error("Error processing message data:", error);
//             }
//           });
//         };

//         createChatbotIframe();

//         const observer = new MutationObserver(() => {
//           createChatbotIframe();
//         });
//         observer.observe(document.body, { childList: true, subtree: true });
//       })();
//     `;

//     return new NextResponse(jsContent, {
//       headers: {
//         "Content-Type": "application/javascript",
//       },
//     });
//   } catch (err) {
//     console.error("Error in GET function:", err);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
