export const transformData = (data: any) => {
  if (!data) return null;

  return {
    name: data?.chatBot?.[0]?.name, // Name of the customer
    botIcon: data.ChatBot?.[0]?.botIcon, // Assuming the first ChatBot is relevant
    chatRoom:
      data.ChatBot?.[0]?.customer?.[0]?.chatRoom?.map((room: any) => ({
        id: room.id,
        createdAt: room.createdAt,
        message: room.message.map((msg: any) => ({
          id: msg.id,
          message: msg.message,
          createdAt: msg.createdAt,
        })),
      })) || [], // Handle cases where there might be no chat rooms
  };
};
