import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface BoardState {
  userPosition: {
    lat: number | null;
    lng: number | null;
  };

  setUserPosition: (newPosition: { lat: number; lng: number }) => void;

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
}

export const useGlobalStore = create<BoardState>()(
  // devtools(
  //   persist(
  (set) => ({
    userPosition: { lat: null, lng: null },
    setUserPosition: (newUser) => set({ userPosition: newUser }),

    position: { lat: "", lng: "", address: "" },
    setPosition: (newLocal) => set({ position: newLocal }),

    isExtended: false,
    setIsExtended: (isExtended) => set({ isExtended }),

    bot: null,
    setBot: (bot) => set({ bot }),

    isOpen: true,
    setIsOpen: (isOpen) => set({ isOpen }),

    chatRoom: null,
    setChatRoom: (chatRoom) => set({ chatRoom }),

    selectedChatRoomId: null,
    setSelectedChatRoomId: (id) => set({ selectedChatRoomId: id }),
  })
  //     {
  //       name: "tem-storage",
  //     }
  //   )
  // )
);
