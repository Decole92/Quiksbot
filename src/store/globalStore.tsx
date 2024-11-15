import type { ChatBot, ChatRoom } from "@prisma/client";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { Contact } from "../../typing";

interface BoardState {
  userPosition: {
    lat: number | null;
    lng: number | null;
  };

  setUserPosition: (newPosition: { lat: number; lng: number }) => void;

  contactList: Contact[];
  setContactList: (contactList: Contact[]) => void;

  position: {
    lat: string;
    lng: string;
    address: string;
  };
  setPosition: (newLocal: {
    lat: string;
    lng: string;
    address: string;
  }) => void;

  isExtended: boolean;
  setIsExtended: (isExtended: boolean) => void;

  bot: ChatBot | null;
  setBot: (bot: ChatBot) => void;

  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  chatRoom: ChatRoom | null;
  setChatRoom: (chatRoom: ChatRoom) => void;
  selectedChatRoomId: string | null;
  setSelectedChatRoomId: (id: string | null) => void;
  chatId: string;
  setChatId: (id: string) => void;
  feedback: boolean;
  setFeedback: (feed: boolean) => void;

  subject: string;
  setSubject: (subject: string) => void;
}

export const useGlobalStore = create<BoardState>()(
  devtools(
    persist(
      (set) => ({
        contactList: [],
        setContactList: (contactList: Contact[]) => set({ contactList }),

        userPosition: { lat: null, lng: null },
        setUserPosition: (newUser) => set({ userPosition: newUser }),

        position: { lat: "", lng: "", address: "" },
        setPosition: (newLocal) => set({ position: newLocal }),

        isExtended: false,
        setIsExtended: (isExtended) => set({ isExtended }),

        bot: null,
        setBot: (bot) => set({ bot }),

        isOpen: false,
        setIsOpen: (isOpen) => set({ isOpen }),

        chatRoom: null,
        setChatRoom: (chatRoom) => set({ chatRoom }),

        selectedChatRoomId: null,
        setSelectedChatRoomId: (id) => set({ selectedChatRoomId: id }),

        chatId: "",
        setChatId: (chatId) => set({ chatId }),

        feedback: false,
        setFeedback: (feedback) => set({ feedback }),

        subject: "",
        setSubject: (subject) => set({ subject }),
      }),
      {
        name: "idstorage",
      }
    )
  )
);
