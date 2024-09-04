interface MenuTypes {
  label: string;
  icon: RefAttributes<SVGSVGElement>;
  path: string;
}

interface ChatBot {
  id: string;
  greetings: string?;
  icon: string?;
  theme?: string;
  userMessageBgColor: string?;
  chatModel: string;
  prompt: string?;
  role: string?;
  createdAt: Date;
  updatedAt: Date;
  name: String;
  firstQuestion: FirstQuestion[];
  User: null;

  Source?: Source[] | null;
  botIcon: string?;
  iconPosition: string?;
}

interface FirstQuestion {
  id: string;
  question: string;
  chatbotId: string;
}

interface Source {
  id?: string;
  characteristic;
  characteristic: characteristic[];
  pdfFile: pdfFile[];
  websiteUrl?: string;
}

interface characteristic {
  id: string;
  characteristic: string;

  sourceId?: string;
}
interface User {
  id: string;
  fullname: string;
  clerkId: string;
  type: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  stripeId: string | null;
}

interface CustomerResponses {
  id: string;
  question: string;
  answered: string | null;
  customer: Customer;
  customerId: string;
}

interface Customer {
  id: string;
  name: string;
  email: string | null;
  questions: CustomerResponses[];
  chatRoom: ChatRoom[];
  Chatbot: ChatBot | null;
  chatbotId: string | null;
  country?: string,
  city?: string,
  lat?:string,
  lng?: string,
}

interface ChatRoom {
  id: string;
  live: boolean;
  mailed: boolean;
  createdAt: Date;
  updatedAt: Date;
  Customer: Customer | null;
  customerId: string | null;
  message: ChatMessage[];
}

interface ChatMessage {
  id: string;
  message: string;
  //role: Role | null;
  role: "user" | "ai";
  createdAt: Date | string;
  updatedAt?: Date;
  ChatRoom?: ChatRoom | null;
  chatRoomId: string | null;
  seen?: boolean;
}

interface pdfFile {
  id: string;
  fileName: string;
  file: Buffer;
  sourceId: string | null;
}
// interface Role {
//   role: "user" | "ai";
// }

// interface Message {
//   id: string;
//   chat_session_id: string;
//   content: string;
//   createdAt: Date;
//   sender: "ai" | "user";
//   chat_session: chat_session;
// }

// interface chat_session {
//   id: string;
//   chatbotId: string;
//   guestId: string;
//   createdAt: Date;
//}
