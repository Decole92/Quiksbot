// export const useChatTime = (createdAt: Date, roomId: string) => {
//   const { chatRoom } = useChatContext();
//   const [messageSentAt, setMessageSentAt] = useState<string>();
//   const [urgent, setUrgent] = useState<boolean>(false);

//   const onSetMessageRecievedDate = () => {
//     const dt = new Date(createdAt);
//     const current = new Date();
//     const currentDate = current.getDate();
//     const hr = dt.getHours();
//     const min = dt.getMinutes();
//     const date = dt.getDate();
//     const month = dt.getMonth();
//     const difference = currentDate - date;

//     if (difference <= 0) {
//       setMessageSentAt(`${hr}:${min}${hr > 12 ? "PM" : "AM"}`);
//       if (current.getHours() - dt.getHours() < 2) {
//         setUrgent(true);
//       }
//     } else {
//       setMessageSentAt(`${date} ${getMonthName(month)}`);
//     }
//   };

//   const onSeenChat = async () => {
//     if (chatRoom == roomId && urgent) {
//       await onViewUnReadMessages(roomId);
//       setUrgent(false);
//     }
//   };

//   useEffect(() => {
//     onSeenChat();
//   }, [chatRoom]);

//   useEffect(() => {
//     onSetMessageRecievedDate();
//   }, []);

//   return { messageSentAt, urgent, onSeenChat };
// };
