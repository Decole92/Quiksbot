import Pusher from "pusher";
import pusherJs from "pusher-js";

export const serverPusher = new Pusher({
  appId: process.env.PUSHER_APPID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: "eu",
});
export const clientPusher = new pusherJs("beee85282478cf8a5899", {
  cluster: "eu",
});
